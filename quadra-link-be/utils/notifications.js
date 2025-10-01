// backend/utils/notifications.js
let notifications = [];

const addNotification = (userId, message, type = 'info') => {
  const notification = {
    id: require('crypto').randomUUID(),
    userId,
    message,
    type,
    timestamp: new Date().toISOString(),
    read: false,
  };
  notifications.push(notification);
  return notification;
};

const getNotifications = (userId) => {
  return notifications.filter(n => n.userId === userId);
};

const markAsRead = (notificationId) => {
  const notification = notifications.find(n => n.id === notificationId);
  if (notification) notification.read = true;
};

module.exports = { addNotification, getNotifications, markAsRead };