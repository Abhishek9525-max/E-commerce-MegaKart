const parseCookies = (header = "") => {
  const cookies = {};
  header.split(";").forEach((part) => {
    const separator = part.indexOf("=");
    if (separator < 0) return;
    const name = part.slice(0, separator).trim();
    const value = part.slice(separator + 1).trim();
    if (!name) return;
    try {
      cookies[name] = decodeURIComponent(value);
    } catch {
      cookies[name] = value;
    }
  });
  return cookies;
};

const cookieParser = (req, res, next) => {
  req.cookies = parseCookies(req.headers.cookie);
  next();
};

module.exports = cookieParser;
