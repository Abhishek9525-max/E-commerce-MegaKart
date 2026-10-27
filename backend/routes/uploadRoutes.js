const express = require("express");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");

require("dotenv").config();
const router = express.Router();

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer setup using memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    if (!file.mimetype.startsWith("image/")) {
      return callback(new Error("Only image files can be uploaded."));
    }
    callback(null, true);
  },
});

router.post("/", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file Uploaded" });
    }

    // Function to handle the stream upload to Cloudinary
    const streamUpload = (fileBuffer) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "megakart/products",
            resource_type: "image",
            transformation: [
              {
                width: 900,
                height: 1200,
                crop: "fill",
                gravity: "auto",
                quality: "auto",
                fetch_format: "auto",
              },
            ],
          },
          (error, result) => {
            if (result) {
              resolve(result);
            } else {
              reject(error);
            }
          }
        );

        // Use streamifier to convert to a stream
        streamifier.createReadStream(fileBuffer).pipe(stream);
      });
    };


    // Call the streamUpload function
    const result = await streamUpload(req.file.buffer);

    // Response with the uploaded 
    res.json({imageUrl: result.secure_url});
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Unable to upload image." });
  }
});

router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({ message: "Image file must be 10 MB or smaller." });
  }
  if (error.message === "Only image files can be uploaded.") {
    return res.status(400).json({ message: error.message });
  }
  next(error);
});

module.exports = router;