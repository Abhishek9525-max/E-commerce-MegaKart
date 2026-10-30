const mongoose = require("mongoose");

const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/.+\@.+|..+/, "Please enter a valid email address"],
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    googleWelcomeEmailSentAt: {
      type: Date,
    },
    profileImage: {
      type: String,
      default: "",
    },
    profileImagePublicId: {
      type: String,
      default: "",
      select: false,
    },
    password: {
      type: String,
      required: function () {
        return !this.googleId;
      },
      minLength: 6,
    },
    role: {
      type: String,
      enum: ["customer", "admin"],
      default: "customer",
    },
    favorites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    refreshTokenHash: {
      type: String,
      select: false,
    },
    sessionVersion: {
      type: Number,
      default: 0,
      select: false,
    },
  },
  { timestamps: true }
);

// Password Has middleware
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

//Match User entered password to hashed password

userSchema.methods.matchPassword = async function (enteredPassword) {
  if (typeof enteredPassword !== "string" || !this.password) return false;
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
