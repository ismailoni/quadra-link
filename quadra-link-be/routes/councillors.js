// backend/routes/councillors.js
const express = require('express');
const { Op } = require('sequelize');
const User = require('../models/User');
const Councillors = require('../models/Councillors');
const Booking = require('../models/Booking');
const authMiddleware = require('../middleware/auth');
const { broadcast } = require('../config/websocket');
const router = express.Router();

// POST /councillors/book - Book a session with availability validation
router.post('/book', authMiddleware(), async (req, res) => {
  const { councillorId, startTime, endTime } = req.body;
  const councillor = await Councillors.findByPk(councillorId);
  if (!councillor) return res.status(404).json({ error: 'Councillor not found' });
  if (councillor.status === 'busy') return res.status(400).json({ error: 'Councillor is busy' });

  const start = new Date(startTime);
  const end = new Date(endTime);
  if (end <= start) return res.status(400).json({ error: 'End time must be after start time' });
  if ((end - start) / 60000 > councillor.sessionDuration) {
    return res.status(400).json({ error: `Session must not exceed ${councillor.sessionDuration} minutes` });
  }

  const day = start.toLocaleString('en-US', { weekday: 'long' });
  const startHour = start.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  const endHour = end.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  const availability = councillor.availability[day] || [];

  const isAvailable = availability.some(slot => {
    const [slotStart, slotEnd] = slot.split('-');
    return startHour >= slotStart && endHour <= slotEnd;
  });
  if (!isAvailable) return res.status(400).json({ error: 'Time slot not available' });

  const overlappingBooking = await Booking.findOne({
    where: {
      councillorId,
      status: { [Op.not]: 'cancelled' },
      [Op.or]: [
        { startTime: { [Op.between]: [start, end] } },
        { endTime: { [Op.between]: [start, end] } },
        { [Op.and]: [
          { startTime: { [Op.lte]: start } },
          { endTime: { [Op.gte]: end } },
        ] },
      ],
    },
  });
  if (overlappingBooking) return res.status(400).json({ error: 'Slot overlaps with existing booking' });

  const startOfWeek = new Date(start);
  startOfWeek.setDate(start.getDate() - start.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);
  const weeklyBookings = await Booking.count({
    where: {
      councillorId,
      startTime: { [Op.between]: [startOfWeek, endOfWeek] },
      status: { [Op.not]: 'cancelled' },
    },
  });
  if (weeklyBookings >= councillor.maxSessions) {
    return res.status(400).json({ error: `Councillor has reached maximum ${councillor.maxSessions} sessions this week` });
  }

  const booking = await Booking.create({
    userId: req.user.id,
    councillorId,
    startTime,
    endTime,
    status: 'pending',
  });
  broadcast(req.user.id, `Your booking with ${await User.findByPk(councillor.userId).then(u => u.pseudonym)} is pending.`, 'info');
  broadcast(councillor.userId, `${req.user.pseudonym} has requested a booking on ${start.toLocaleString()}.`, 'info');
  res.status(201).json(booking);
});

// PATCH /councillors/book/:id - Accept/Decline/Reschedule booking
router.patch('/book/:id', authMiddleware(['moderator', 'admin']), async (req, res) => {
  const { status, newStartTime, newEndTime } = req.body;
  const booking = await Booking.findByPk(req.params.id);
  if (!booking) return res.status(404).json({ error: 'Booking not found' });
  const councillor = await Councillors.findByPk(booking.councillorId);
  if (!councillor) return res.status(500).json({ error: 'Councillor data inconsistent' });

  if (!['accepted', 'declined', 'rescheduled'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  if (status === 'rescheduled' && (!newStartTime || !newEndTime)) {
    return res.status(400).json({ error: 'New times required for reschedule' });
  }

  if (status === 'rescheduled') {
    const newStart = new Date(newStartTime);
    const newEnd = new Date(newEndTime);
    if (newEnd <= newStart) return res.status(400).json({ error: 'End time must be after start time' });
    if ((newEnd - newStart) / 60000 > councillor.sessionDuration) {
      return res.status(400).json({ error: `Session must not exceed ${councillor.sessionDuration} minutes` });
    }

    const day = newStart.toLocaleString('en-US', { weekday: 'long' });
    const startHour = newStart.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    const endHour = newEnd.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    const availability = councillor.availability[day] || [];
    const isAvailable = availability.some(slot => {
      const [slotStart, slotEnd] = slot.split('-');
      return startHour >= slotStart && endHour <= slotEnd;
    });
    if (!isAvailable) return res.status(400).json({ error: 'New time slot not available' });

    const overlappingBooking = await Booking.findOne({
      where: {
        councillorId: booking.councillorId,
        status: { [Op.not]: 'cancelled' },
        [Op.or]: [
          { startTime: { [Op.between]: [newStart, newEnd] } },
          { endTime: { [Op.between]: [newStart, newEnd] } },
          { [Op.and]: [
            { startTime: { [Op.lte]: newStart } },
            { endTime: { [Op.gte]: newEnd } },
          ] },
        ],
      },
    });
    if (overlappingBooking && overlappingBooking.id !== booking.id) {
      return res.status(400).json({ error: 'New slot overlaps with existing booking' });
    }

    await booking.update({ startTime: newStartTime, endTime: newEndTime, status, notificationSent: false });
    broadcast(booking.userId, `Your booking has been rescheduled to ${newStart.toLocaleString()} by ${await User.findByPk(councillor.userId).then(u => u.pseudonym)}.`, 'info');
    broadcast(councillor.userId, `You rescheduled a booking to ${newStart.toLocaleString()}.`, 'info');
  } else {
    await booking.update({ status, notificationSent: false });
    const message = status === 'accepted'
      ? `Your booking on ${booking.startTime.toLocaleString()} has been accepted by ${await User.findByPk(councillor.userId).then(u => u.pseudonym)}.`
      : `Your booking on ${booking.startTime.toLocaleString()} has been ${status} by ${await User.findByPk(councillor.userId).then(u => u.pseudonym)}.`;
    broadcast(booking.userId, message, status === 'declined' ? 'warning' : 'info');
    broadcast(councillor.userId, `You ${status} a booking on ${booking.startTime.toLocaleString()}.`, status === 'declined' ? 'warning' : 'info');
  }
  res.json({ message: 'Booking updated' });
});

// DELETE /councillors/book/:id - Cancel booking
router.delete('/book/:id', authMiddleware(), async (req, res) => {
  const booking = await Booking.findByPk(req.params.id);
  if (!booking) return res.status(404).json({ error: 'Booking not found' });
  if (booking.userId !== req.user.id && !req.user.role.includes('moderator') && !req.user.role.includes('admin')) {
    return res.status(403).json({ error: 'Can only cancel own booking' });
  }
  const councillor = await Councillors.findByPk(booking.councillorId);
  await booking.update({ status: 'cancelled', notificationSent: false });
  broadcast(booking.userId, `Your booking on ${booking.startTime.toLocaleString()} has been cancelled.`, 'warning');
  broadcast(councillor.userId, `${req.user.pseudonym} cancelled their booking on ${booking.startTime.toLocaleString()}.`, 'warning');
  res.json({ message: 'Booking cancelled' });
});

// GET /councillors/schedule/:id - View councillor's schedule
router.get('/schedule/:id', authMiddleware(), async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;
  const councillor = await Councillors.findByPk(req.params.id);
  if (!councillor) return res.status(404).json({ error: 'Councillor not found' });
  const bookings = await Booking.findAll({
    where: { councillorId: req.params.id, status: { [Op.not]: 'cancelled' } },
    include: [{ model: User, attributes: ['pseudonym'] }],
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [['startTime', 'ASC']],
  });
  const total = await Booking.count({ where: { councillorId: req.params.id, status: { [Op.not]: 'cancelled' } } });
  res.json({ data: bookings, total, availability: councillor.availability });
});

module.exports = router;