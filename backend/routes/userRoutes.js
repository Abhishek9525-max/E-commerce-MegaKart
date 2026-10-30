const express = require("express");
require("dotenv").config();
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { OAuth2Client } = require("google-auth-library");
const {protect} = require('../middleware/authMiddleware')
const {
  REFRESH_COOKIE,
  clearAuthCookies,
  createAuthTokens,
  hashRefreshToken,
  refreshSecret,
  setAuthCookies,
} = require("../utils/authTokens");
const {
  RegistrationOtpCooldownError,
  issueRegistrationOtp,
  verifyRegistrationOtp,
} = require("../utils/registrationOtp");
const {
  PasswordResetOtpCooldownError,
  clearPasswordResetOtp,
  issuePasswordResetOtp,
  verifyPasswordResetOtp,
} = require("../utils/passwordResetOtp");
const { sendPasswordResetEmail, sendWelcomeEmail } = require("../utils/emailService");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");
const router = express.Router();
const googleClient = new OAuth2Client();

const userResponse = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  profileImage: user.profileImage,
});

const hashesMatch = (left, right) => {
  const leftBuffer = Buffer.from(left || "");
  const rightBuffer = Buffer.from(right || "");
  return (
    leftBuffer.length === rightBuffer.length &&
    crypto.timingSafeEqual(leftBuffer, rightBuffer)
  );
};

const startSession = async (user, res) => {
  const tokens = createAuthTokens(user);
  user.refreshTokenHash = tokens.refreshTokenHash;
  await user.save();
  setAuthCookies(res, tokens);
};

const sendGoogleWelcomeEmailOnce = async (user) => {
  if (user.googleWelcomeEmailSentAt) return null;

  try {
    await sendWelcomeEmail(user);
    const sentAt = new Date();
    await User.updateOne(
      { _id: user._id, googleWelcomeEmailSentAt: { $exists: false } },
      { $set: { googleWelcomeEmailSentAt: sentAt } }
    );
    user.googleWelcomeEmailSentAt = sentAt;
    return true;
  } catch (error) {
    console.error(`Unable to send welcome email for user ${user._id}:`, error);
    return false;
  }
};

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const profileImageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    if (!file.mimetype.startsWith("image/")) {
      return callback(new Error("Only image files can be uploaded."));
    }
    callback(null, true);
  },
});

const validateRegistrationInput = (body = {}) => {
  const { name, email, password } = body;
  const normalizedName = typeof name === "string" ? name.trim() : "";
  const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

  if (!normalizedName || !normalizedEmail || typeof password !== "string") {
    return { error: "Name, email, and password are required." };
  }
  if (normalizedName.length < 2) {
    return { error: "Please enter a name with at least 2 characters." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return { error: "Please enter a valid email address." };
  }
  if (
    password.length < 8 ||
    !/[A-Z]/.test(password) ||
    !/[a-z]/.test(password) ||
    !/\d/.test(password)
  ) {
    return {
      error:
        "Use at least 8 characters, including an uppercase letter, a lowercase letter, and a number.",
    };
  }

  return { normalizedName, normalizedEmail };
};

// @route POST /api/users/register
// @desc Send a registration verification code
// @access Public

router.post("/register", async (req, res) => {
  const validation = validateRegistrationInput(req.body ?? {});
  if (validation.error) return res.status(400).json({ message: validation.error });
  const { normalizedName, normalizedEmail } = validation;

  try {
    const existingUser = await User.findOne({ email: normalizedEmail }).collation({
      locale: "en",
      strength: 2,
    });

    if (existingUser) {
      return res.status(400).json({ message: "An account with this email already exists." });
    }

    await issueRegistrationOtp(normalizedEmail, normalizedName);
    res.json({ message: "A verification code was sent to your email address." });
  } catch (error) {
    if (error instanceof RegistrationOtpCooldownError) {
      return res.status(429).json({ message: error.message });
    }
    console.error("Unable to send registration verification code:", error);
    res.status(503).json({
      message: "Unable to send a verification code right now. Please try again later.",
    });
  }
});

// @route POST /api/users/register/verify-otp
// @desc Verify a registration code and create the user account
// @access Public
router.post("/register/verify-otp", async (req, res) => {
  const requestBody = req.body ?? {};
  const validation = validateRegistrationInput(requestBody);
  if (validation.error) return res.status(400).json({ message: validation.error });

  const { normalizedName, normalizedEmail } = validation;
  const otp = typeof requestBody.otp === "string" ? requestBody.otp.trim() : "";
  if (!/^\d{6}$/.test(otp)) {
    return res.status(400).json({ message: "Enter the 6-digit verification code." });
  }

  try {
    const existingUser = await User.findOne({ email: normalizedEmail }).collation({
      locale: "en",
      strength: 2,
    });
    if (existingUser) {
      return res.status(400).json({ message: "An account with this email already exists." });
    }

    const otpResult = await verifyRegistrationOtp(normalizedEmail, otp);
    if (otpResult === "locked") {
      return res.status(429).json({
        message: "Too many incorrect codes. Request a new verification code.",
      });
    }
    if (otpResult !== "verified") {
      return res.status(400).json({
        message: "The verification code is incorrect or expired. Request a new code.",
      });
    }

    const user = new User({
      name: normalizedName,
      email: normalizedEmail,
      password: requestBody.password,
    });
    await user.save();
    await startSession(user, res);
    let welcomeEmailSent = false;
    try {
      await sendWelcomeEmail(user);
      welcomeEmailSent = true;
    } catch (error) {
      console.error(`Unable to send welcome email for user ${user._id}:`, error);
    }
    res.status(201).json({ user: userResponse(user), welcomeEmailSent });
  } catch (error) {
    if (error.code === 11000 && error.keyPattern?.email) {
      return res.status(400).json({ message: "An account with this email already exists." });
    }
    console.error("Unable to verify registration code:", error);
    res.status(503).json({
      message: "Unable to complete registration right now. Please try again later.",
    });
  }
});

// @route POST /api/users/forgot-password
// @desc Send a password reset code when the account exists
// @access Public
router.post("/forgot-password", async (req, res) => {
  const email =
    typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ message: "Please enter a valid email address." });
  }

  let otp;
  try {
    const user = await User.findOne({ email }).collation({
      locale: "en",
      strength: 2,
    });
    if (!user) {
      return res.json({
        message: "If an account exists for that email, a reset code has been sent.",
      });
    }

    otp = await issuePasswordResetOtp(email);
    await sendPasswordResetEmail(user, otp);

    return res.json({
      message: "If an account exists for that email, a reset code has been sent.",
    });
  } catch (error) {
    if (otp) {
      try {
        await clearPasswordResetOtp(email);
      } catch (cleanupError) {
        console.error("Unable to clear failed password reset OTP state:", cleanupError);
      }
    }
    if (error instanceof PasswordResetOtpCooldownError) {
      return res.json({
        message: "If an account exists for that email, a reset code has been sent.",
      });
    }
    console.error("Unable to send password reset code:", error);
    return res.status(503).json({
      message: "Unable to send a password reset code right now. Please try again later.",
    });
  }
});

// @route POST /api/users/forgot-password/reset
// @desc Verify a password reset code and set a new password
// @access Public
router.post("/forgot-password/reset", async (req, res) => {
  const requestBody = req.body ?? {};
  const email =
    typeof requestBody.email === "string"
      ? requestBody.email.trim().toLowerCase()
      : "";
  const otp = typeof requestBody.otp === "string" ? requestBody.otp.trim() : "";
  const password =
    typeof requestBody.password === "string" ? requestBody.password : "";

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ message: "Please enter a valid email address." });
  }
  if (!/^\d{6}$/.test(otp)) {
    return res.status(400).json({ message: "Enter the 6-digit reset code." });
  }
  if (
    password.length < 8 ||
    !/[A-Z]/.test(password) ||
    !/[a-z]/.test(password) ||
    !/\d/.test(password)
  ) {
    return res.status(400).json({
      message:
        "Use at least 8 characters, including an uppercase letter, a lowercase letter, and a number.",
    });
  }

  try {
    const user = await User.findOne({ email })
      .collation({ locale: "en", strength: 2 })
      .select("+sessionVersion");
    const otpResult = await verifyPasswordResetOtp(email, otp);

    if (otpResult === "locked") {
      return res.status(429).json({
        message: "Too many incorrect codes. Request a new reset code.",
      });
    }
    if (otpResult !== "verified" || !user) {
      return res.status(400).json({
        message: "The reset code is incorrect or expired. Request a new code.",
      });
    }

    user.password = password;
    user.sessionVersion = (user.sessionVersion || 0) + 1;
    user.refreshTokenHash = undefined;
    await user.save();
    clearAuthCookies(res);

    return res.json({ message: "Your password has been reset. You can now sign in." });
  } catch (error) {
    console.error("Unable to reset password:", error);
    return res.status(503).json({
      message: "Unable to reset your password right now. Please try again later.",
    });
  }
});


// @route POST /api/users/login
// @desc Authenticate user
// @access Public
router.post('/login', async(req,res)=>{
  const {email,password} = req.body ?? {};
  const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

  try{
    //find the user by email
    const user = await User.findOne({ email: normalizedEmail }).select(
      "+sessionVersion"
    );

    if(!user || !user.password) {
      return res.status(400).json({message: 'Invalid Credentials'});
    }
    const isMatch = await user.matchPassword(password);

    if(!isMatch) return res.status(400).json({message: 'Invalid Credential'});

    await startSession(user, res);
    res.json({ user: userResponse(user) });
  }
  catch (error){   
    console.error(error);
    res.status(500).send('Server Error');
  }
});

router.post("/google", async (req, res) => {
  const credential =
    typeof req.body?.credential === "string" ? req.body.credential : "";
  if (!credential) {
    return res.status(400).json({ message: "A Google credential is required." });
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    console.error("Google sign-in is unavailable because GOOGLE_CLIENT_ID is not configured.");
    return res.status(503).json({ message: "Google sign-in is not configured." });
  }

  let googleProfile;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: clientId,
    });
    googleProfile = ticket.getPayload();
  } catch {
    return res.status(401).json({ message: "Unable to verify your Google sign-in." });
  }

  const googleId = googleProfile?.sub;
  const email =
    typeof googleProfile?.email === "string"
      ? googleProfile.email.trim().toLowerCase()
      : "";
  if (!googleId || !email || googleProfile.email_verified !== true) {
    return res.status(401).json({
      message: "Google must provide a verified email address to sign in.",
    });
  }

  try {
    let user = await User.findOne({ googleId }).select("+sessionVersion");
    if (!user) {
      const emailAccount = await User.findOne({ email }).collation({
        locale: "en",
        strength: 2,
      });
      if (emailAccount) {
        return res.status(409).json({
          message:
            "An account with this email already exists. Sign in with your password instead.",
        });
      }

      user = new User({
        name:
          typeof googleProfile.name === "string" && googleProfile.name.trim()
            ? googleProfile.name.trim()
            : email.split("@")[0],
        email,
        googleId,
        profileImage:
          typeof googleProfile.picture === "string" ? googleProfile.picture : "",
      });
      await user.save();
    }

    await startSession(user, res);
    const welcomeEmailSent = await sendGoogleWelcomeEmailOnce(user);
    return res.json({ user: userResponse(user), welcomeEmailSent });
  } catch (error) {
    if (error.code === 11000) {
      const existingGoogleUser = await User.findOne({ googleId }).select(
        "+sessionVersion"
      );
      if (existingGoogleUser) {
        await startSession(existingGoogleUser, res);
        const welcomeEmailSent =
          await sendGoogleWelcomeEmailOnce(existingGoogleUser);
        return res.json({
          user: userResponse(existingGoogleUser),
          welcomeEmailSent,
        });
      }
      if (error.keyPattern?.email) {
        return res.status(409).json({
          message:
            "An account with this email already exists. Sign in with your password instead.",
        });
      }
    }
    console.error("Unable to sign in with Google:", error);
    return res.status(500).json({ message: "Unable to sign in with Google." });
  }
});

router.post("/auth/refresh", async (req, res) => {
  const refreshToken = req.cookies?.[REFRESH_COOKIE];
  if (!refreshToken) {
    clearAuthCookies(res);
    return res.status(401).json({ message: "Refresh session not found." });
  }

  try {
    const decoded = jwt.verify(refreshToken, refreshSecret());
    if (decoded.tokenType !== "refresh" || !decoded.user?.id) {
      clearAuthCookies(res);
      return res.status(401).json({ message: "Invalid refresh session." });
    }

    const oldHash = hashRefreshToken(refreshToken);
    const user = await User.findById(decoded.user.id).select(
      "+refreshTokenHash +sessionVersion"
    );

    if (
      !user ||
      (decoded.user.authVersion || 0) !== (user.sessionVersion || 0) ||
      !hashesMatch(user.refreshTokenHash, oldHash)
    ) {
      clearAuthCookies(res);
      return res.status(401).json({ message: "Refresh session expired or revoked." });
    }

    const tokens = createAuthTokens(user);
    const rotatedUser = await User.findOneAndUpdate(
      { _id: user._id, refreshTokenHash: oldHash },
      { $set: { refreshTokenHash: tokens.refreshTokenHash } },
      { new: true }
    ).select("-password -refreshTokenHash");

    if (!rotatedUser) {
      clearAuthCookies(res);
      return res.status(401).json({ message: "Refresh session has already been used." });
    }

    setAuthCookies(res, tokens);
    res.json({ user: userResponse(rotatedUser) });
  } catch (error) {
    if (error.name !== "JsonWebTokenError" && error.name !== "TokenExpiredError") {
      console.error("Failed to refresh authentication session:", error);
      return res.status(500).json({ message: "Unable to refresh authentication session." });
    }
    clearAuthCookies(res);
    return res.status(401).json({ message: "Refresh session expired." });
  }
});

router.post("/auth/logout", async (req, res) => {
  const refreshToken = req.cookies?.[REFRESH_COOKIE];
  if (refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, refreshSecret());
      if (decoded.tokenType === "refresh" && decoded.user?.id) {
        await User.updateOne(
          {
            _id: decoded.user.id,
            refreshTokenHash: hashRefreshToken(refreshToken),
          },
          { $unset: { refreshTokenHash: "" } }
        );
      }
    } catch (error) {
      if (error.name !== "JsonWebTokenError" && error.name !== "TokenExpiredError") {
        console.error("Failed to revoke authentication session:", error);
      }
    }
  }
  clearAuthCookies(res);
  res.json({ message: "Signed out." });
});

//@route GET /api/users/profile
// @desc get logged-in user's profile (Protected Route)
// @access Private

router.get('/profile', protect, async(req,res)=>{
  res.json(userResponse(req.user));

});

// @route PUT /api/users/profile/password
// @desc Change the authenticated user's password
// @access Private
router.put("/profile/password", protect, async (req, res) => {
  const currentPassword =
    typeof req.body?.currentPassword === "string" ? req.body.currentPassword : "";
  const newPassword =
    typeof req.body?.newPassword === "string" ? req.body.newPassword : "";

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      message: "Current password and new password are required.",
    });
  }
  if (
    newPassword.length < 8 ||
    !/[A-Z]/.test(newPassword) ||
    !/[a-z]/.test(newPassword) ||
    !/\d/.test(newPassword)
  ) {
    return res.status(400).json({
      message:
        "Use at least 8 characters, including an uppercase letter, a lowercase letter, and a number.",
    });
  }

  try {
    const user = await User.findById(req.user._id).select("+sessionVersion");
    if (!user) {
      return res.status(404).json({ message: "User account not found." });
    }

    if (!(await user.matchPassword(currentPassword))) {
      return res.status(400).json({ message: "Your current password is incorrect." });
    }
    if (await user.matchPassword(newPassword)) {
      return res.status(400).json({
        message: "Your new password must be different from your current password.",
      });
    }

    user.password = newPassword;
    user.sessionVersion = (user.sessionVersion || 0) + 1;
    await startSession(user, res);

    return res.json({
      message: "Your password has been changed. Other active sessions were signed out.",
    });
  } catch (error) {
    console.error("Unable to change account password:", error);
    return res.status(500).json({ message: "Unable to change your password." });
  }
});


// @route PUT /api/users/profile/image
// @desc Upload and save the authenticated user's profile image
// @access Private
router.put("/profile/image", protect, profileImageUpload.single("image"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Choose an image to upload." });
  }

  try {
    const previousUser = await User.findById(req.user._id).select("+profileImagePublicId");
    if (!previousUser) {
      return res.status(404).json({ message: "User account not found." });
    }

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "megakart/profiles",
          resource_type: "image",
          transformation: [
            { width: 500, height: 500, crop: "fill", gravity: "face", quality: "auto", fetch_format: "auto" },
          ],
        },
        (error, uploadedImage) => {
          if (error) {
            reject(error);
          } else {
            resolve(uploadedImage);
          }
        }
      );
      streamifier.createReadStream(req.file.buffer).pipe(stream);
    });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        profileImage: result.secure_url,
        profileImagePublicId: result.public_id,
      },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      await cloudinary.uploader.destroy(result.public_id);
      return res.status(404).json({ message: "User account not found." });
    }

    if (previousUser.profileImagePublicId) {
      try {
        await cloudinary.uploader.destroy(previousUser.profileImagePublicId);
      } catch (error) {
        console.error("Failed to remove replaced profile image:", error);
      }
    }

    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    console.error("Failed to save profile image:", error);
    res.status(500).json({ message: "Unable to save profile image." });
  }
});

// @route DELETE /api/users/profile/image
// @desc Remove the authenticated user's profile image
// @access Private
router.delete("/profile/image", protect, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id).select("+profileImagePublicId");
    if (!currentUser) {
      return res.status(404).json({ message: "User account not found." });
    }

    if (currentUser.profileImagePublicId) {
      const result = await cloudinary.uploader.destroy(currentUser.profileImagePublicId);
      if (result.result !== "ok" && result.result !== "not found") {
        console.error("Cloudinary did not remove the profile image:", result);
        return res.status(502).json({ message: "Unable to remove profile image." });
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $unset: { profileImage: "", profileImagePublicId: "" } },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User account not found." });
    }

    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: "",
      },
    });
  } catch (error) {
    console.error("Failed to remove profile image:", error);
    res.status(500).json({ message: "Unable to remove profile image." });
  }
});

router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({ message: "Profile image must be 5 MB or smaller." });
  }
  if (error.message === "Only image files can be uploaded.") {
    return res.status(400).json({ message: error.message });
  }
  next(error);
});


module.exports = router;
