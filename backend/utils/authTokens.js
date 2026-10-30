const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const ACCESS_COOKIE = "accessToken";
const REFRESH_COOKIE = "refreshToken";
const ACCESS_TTL_MS = 15 * 60 * 1000;
const REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const cookieOptions = (maxAge, path = "/") => {
  const sameSite = (process.env.COOKIE_SAME_SITE || (
    process.env.NODE_ENV === "production" ? "none" : "lax"
  )).toLowerCase();
  const secure = process.env.COOKIE_SECURE
    ? process.env.COOKIE_SECURE === "true"
    : process.env.NODE_ENV === "production";

  if (!["strict", "lax", "none"].includes(sameSite)) {
    throw new Error("COOKIE_SAME_SITE must be strict, lax, or none.");
  }
  if (sameSite === "none" && !secure) {
    throw new Error("COOKIE_SECURE must be true when COOKIE_SAME_SITE is none.");
  }

  const options = {
    httpOnly: true,
    secure,
    sameSite,
    path,
    maxAge,
  };
  if (process.env.COOKIE_DOMAIN) options.domain = process.env.COOKIE_DOMAIN;
  return options;
};

const refreshSecret = () => {
  if (
    process.env.NODE_ENV === "production" &&
    (!process.env.REFRESH_TOKEN_SECRET ||
      process.env.REFRESH_TOKEN_SECRET === process.env.JWT_SECRET)
  ) {
    throw new Error(
      "Production requires a REFRESH_TOKEN_SECRET distinct from JWT_SECRET."
    );
  }
  return process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET;
};

const validateAuthConfig = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET must be configured for authentication.");
  }
  refreshSecret();
  cookieOptions(0);
};

const hashRefreshToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

const createAuthTokens = (user) => {
  const userClaims = {
    id: user._id.toString(),
    role: user.role,
    authVersion: user.sessionVersion || 0,
  };
  const accessToken = jwt.sign(
    { user: userClaims, tokenType: "access" },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );
  const refreshToken = jwt.sign(
    { user: userClaims, tokenType: "refresh" },
    refreshSecret(),
    { expiresIn: "7d" }
  );

  return {
    accessToken,
    refreshToken,
    refreshTokenHash: hashRefreshToken(refreshToken),
  };
};

const setAuthCookies = (res, { accessToken, refreshToken }) => {
  res.cookie(ACCESS_COOKIE, accessToken, cookieOptions(ACCESS_TTL_MS));
  res.cookie(
    REFRESH_COOKIE,
    refreshToken,
    cookieOptions(REFRESH_TTL_MS, "/api/users/auth")
  );
};

const clearAuthCookies = (res) => {
  res.clearCookie(ACCESS_COOKIE, cookieOptions(undefined));
  res.clearCookie(
    REFRESH_COOKIE,
    cookieOptions(undefined, "/api/users/auth")
  );
};

module.exports = {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  clearAuthCookies,
  createAuthTokens,
  hashRefreshToken,
  refreshSecret,
  setAuthCookies,
  validateAuthConfig,
};
