const crypto = require("crypto");
const { createClient } = require("redis");

const OTP_TTL_SECONDS = 10 * 60;
const RESEND_COOLDOWN_SECONDS = 60;
const MAX_OTP_ATTEMPTS = 5;

let redisClient;
let redisConnection;

class PasswordResetOtpCooldownError extends Error {
  constructor() {
    super("A reset code was recently sent. Please wait before requesting another.");
    this.name = "PasswordResetOtpCooldownError";
  }
}

const getRedisClient = async () => {
  if (!process.env.REDIS_URL) {
    throw new Error("REDIS_URL must be configured for password reset.");
  }

  if (!redisClient) {
    redisClient = createClient({ url: process.env.REDIS_URL });
    redisClient.on("error", (error) => {
      console.error("Redis password reset client error:", error.message);
    });
  }

  if (redisClient.isReady) return redisClient;

  if (!redisConnection) {
    redisConnection = redisClient.connect().catch((error) => {
      redisConnection = null;
      throw error;
    });
  }

  await redisConnection;
  return redisClient;
};

const emailKey = (email) =>
  crypto.createHmac("sha256", process.env.JWT_SECRET).update(email).digest("hex");

const otpDigest = (email, otp) =>
  crypto
    .createHmac("sha256", process.env.JWT_SECRET)
    .update(`${email}:${otp}`)
    .digest("hex");

const issuePasswordResetOtp = async (email) => {
  const client = await getRedisClient();
  const key = emailKey(email);
  const otpKey = `password-reset:otp:v1:${key}`;
  const cooldownKey = `password-reset:otp-cooldown:v1:${key}`;
  const cooldownSet = await client.set(cooldownKey, "1", {
    EX: RESEND_COOLDOWN_SECONDS,
    NX: true,
  });

  if (!cooldownSet) throw new PasswordResetOtpCooldownError();

  const otp = crypto.randomInt(0, 1_000_000).toString().padStart(6, "0");

  try {
    await client.set(otpKey, otpDigest(email, otp), { EX: OTP_TTL_SECONDS });
    return otp;
  } catch (error) {
    try {
      await client.del([otpKey, cooldownKey]);
    } catch (cleanupError) {
      console.error("Unable to clear failed password reset OTP state:", cleanupError);
    }
    throw error;
  }
};

const clearPasswordResetOtp = async (email) => {
  const client = await getRedisClient();
  const key = emailKey(email);
  await client.del([
    `password-reset:otp:v1:${key}`,
    `password-reset:otp-cooldown:v1:${key}`,
    `password-reset:otp-attempts:v1:${key}`,
  ]);
};

const verifyPasswordResetOtp = async (email, otp) => {
  const client = await getRedisClient();
  const key = emailKey(email);
  const result = await client.eval(
    `
      local storedDigest = redis.call("GET", KEYS[1])
      if not storedDigest then return -1 end

      local attempts = tonumber(redis.call("GET", KEYS[2]) or "0")
      if attempts >= tonumber(ARGV[2]) then return -2 end

      if storedDigest ~= ARGV[1] then
        attempts = redis.call("INCR", KEYS[2])
        if attempts == 1 then
          redis.call("EXPIRE", KEYS[2], ARGV[3])
        end
        if attempts >= tonumber(ARGV[2]) then
          redis.call("DEL", KEYS[1])
          return -2
        end
        return 0
      end

      redis.call("DEL", KEYS[1], KEYS[2])
      return 1
    `,
    {
      keys: [
        `password-reset:otp:v1:${key}`,
        `password-reset:otp-attempts:v1:${key}`,
      ],
      arguments: [
        otpDigest(email, otp),
        String(MAX_OTP_ATTEMPTS),
        String(OTP_TTL_SECONDS),
      ],
    }
  );

  return result === 1 ? "verified" : result === -2 ? "locked" : "invalid";
};

module.exports = {
  PasswordResetOtpCooldownError,
  clearPasswordResetOtp,
  issuePasswordResetOtp,
  verifyPasswordResetOtp,
};
