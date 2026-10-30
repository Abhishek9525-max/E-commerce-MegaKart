const createChatRateLimit = ({
  limit = 15,
  windowMs = 10 * 60 * 1000,
  now = Date.now,
} = {}) => {
  const clients = new Map();
  let lastCleanup = now();

  return (req, res, next) => {
    const currentTime = now();
    if (currentTime - lastCleanup > windowMs) {
      for (const [key, timestamps] of clients) {
        const recent = timestamps.filter((timestamp) => currentTime - timestamp < windowMs);
        if (recent.length) clients.set(key, recent);
        else clients.delete(key);
      }
      lastCleanup = currentTime;
    }

    const clientKey = req.ip || req.socket?.remoteAddress || "unknown";
    const recent = (clients.get(clientKey) || [])
      .filter((timestamp) => currentTime - timestamp < windowMs);

    if (recent.length >= limit) {
      const retryAfter = Math.max(1, Math.ceil((recent[0] + windowMs - currentTime) / 1000));
      res.set("Retry-After", String(retryAfter));
      return res.status(429).json({
        message: "Too many assistant requests. Please wait a little and try again.",
      });
    }

    recent.push(currentTime);
    clients.set(clientKey, recent);
    if (clients.size > 5000) clients.delete(clients.keys().next().value);
    return next();
  };
};

module.exports = { createChatRateLimit };
