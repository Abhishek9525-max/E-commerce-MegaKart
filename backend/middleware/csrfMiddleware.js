const configuredOrigins = [
  process.env.FRONTEND_URL,
  process.env.CORS_ORIGINS,
]
  .filter(Boolean)
  .flatMap((value) => value.split(","))
  .map((origin) => {
    try {
      return new URL(origin.trim()).origin;
    } catch {
      throw new Error(`Invalid frontend origin configured: ${origin.trim()}`);
    }
  });

if (process.env.NODE_ENV === "production" && configuredOrigins.length === 0) {
  throw new Error("Set FRONTEND_URL or CORS_ORIGINS for production cookie authentication.");
}

if (configuredOrigins.length === 0) {
  configuredOrigins.push("http://localhost:5173", "http://127.0.0.1:5173");
}

const isSafeMethod = (method) =>
  ["GET", "HEAD", "OPTIONS"].includes(method.toUpperCase());

const requireTrustedOrigin = (req, res, next) => {
  if (isSafeMethod(req.method)) return next();

  const origin = req.get("origin");
  if (!origin || !configuredOrigins.includes(origin)) {
    return res.status(403).json({ message: "Request origin is not allowed." });
  }
  return next();
};

module.exports = { configuredOrigins, requireTrustedOrigin };
