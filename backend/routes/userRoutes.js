const express = require("express");
require("dotenv").config();
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const {protect} = require('../middleware/authMiddleware')
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");
const router = express.Router();

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

// @route POST /api/users/register
// @desc Register a new user
// @access Public

router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

  if (!name?.trim() || !normalizedEmail || !password) {
    return res.status(400).json({ message: "Name, email, and password are required." });
  }
  if (name.trim().length < 2) {
    return res.status(400).json({ message: "Please enter a name with at least 2 characters." });
  }
  if (password.length < 8 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password)) {
    return res.status(400).json({
      message: "Use at least 8 characters, including an uppercase letter, a lowercase letter, and a number.",
    });
  }

  try {
    const existingUser = await User.findOne({ email: normalizedEmail }).collation({
      locale: "en",
      strength: 2,
    });

    if (existingUser) {
      return res.status(400).json({ message: "An account with this email already exists." });
    }

    const user = new User({ name: name.trim(), email: normalizedEmail, password });
    await user.save();

    //Create JWT Payload
    const payload = { user: { id: user._id, role: user.role } };

    //sign and return the token along with user data
    // time according to you
  
    jwt.sign(payload, process.env.JWT_SECRET,
      { expiresIn: "10h" },
      (err, token) => {
        if (err) throw err;

        //Send the user and token in response
        res.status(201).json({
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            profileImage: user.profileImage,
          },
          token,
        });
      }
    );
  } catch (error) {
    if (error.code === 11000 && error.keyPattern?.email) {
      return res.status(400).json({ message: "An account with this email already exists." });
    }
    console.log(error);
    res.status(500).send("Server Error");
  }
});


// @route POST /api/users/login
// @desc Authenticate user
// @access Public
router.post('/login', async(req,res)=>{
  const {email,password} = req.body;
  const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

  try{
    //find the user by email
    let user = await User.findOne({ email: normalizedEmail })

    if(!user) return res.status(400).json({message: 'Invalid Credentials'});
    const isMatch = await user.matchPassword(password);

    if(!isMatch) return res.status(400).json({message: 'Invalid Credential'});

    const payload = { user: { id: user._id, role: user.role } };

    //sign and return the token along with user data
    // time according to you
    jwt.sign(payload, process.env.JWT_SECRET,
      { expiresIn: "10h" },
      (err, token) => {
        if (err) throw err;

        //Send the user and token in response
        res.json({
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            profileImage: user.profileImage,
          },
          token,
        })
      })
  }
  catch (error){   
    console.error(error);
    res.status(500).send('Server Error');
  }
});

//@route GET /api/users/profile
// @desc get logged-in user's profile (Protected Route)
// @access Private

router.get('/profile', protect, async(req,res)=>{
  res.json(req.user);

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
