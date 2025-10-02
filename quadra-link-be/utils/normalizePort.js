/**
 * Normalize and validate a PORT value.
 * - Accepts numbers or numeric strings.
 * - Trims strings, converts to integer.
 * - If invalid or out of range, returns the provided default.
 */
module.exports = function normalizePort(val, defaultPort = 3000) {
  const raw = val == null ? '' : String(val).trim();
  if (raw === '') return defaultPort;

  // Allow numeric strings like "3000"
  const n = Number(raw);
  if (!Number.isFinite(n) || Number.isNaN(n)) {
    console.warn(`[normalizePort] Invalid PORT "${val}" — falling back to ${defaultPort}`);
    return defaultPort;
  }

  const port = Math.floor(n);
  if (port < 0 || port > 65535) {
    console.warn(`[normalizePort] PORT ${port} out of range (0-65535) — falling back to ${defaultPort}`);
    return defaultPort;
  }

  return port;
};
