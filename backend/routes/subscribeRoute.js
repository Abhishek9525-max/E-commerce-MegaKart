const express = require("express");

const router = express.Router();
const Subscriber = require("../models/Subscriber");
const { sendNewsletterWelcomeEmail } = require("../utils/emailService");

// @route POST /api/subscribe
// @desc Handle newsletter subscription
// @access Public

router.post("/subscribe", async (req, res) => {
  const email = typeof req.body?.email === "string"
    ? req.body.email.trim().toLowerCase()
    : "";

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ message: "A valid email address is required." });
  }

  try {
    const subscriber = await Subscriber.findOne({ email });
    if (subscriber) {
      return res.status(400).json({ message: "email is already subscribed" });
    }

    await Subscriber.create({ email });

    let welcomeEmailSent = false;
    try {
      await sendNewsletterWelcomeEmail(email);
      welcomeEmailSent = true;
    } catch (error) {
      console.error(`Unable to send newsletter welcome email to ${email}:`, error);
    }

    res.status(201).json({
      message: welcomeEmailSent
        ? "Successfully subscribed to the newsletter!"
        : "You are subscribed, but we could not send the welcome email.",
      welcomeEmailSent,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
