const rateLimit = require("express-rate-limit");


const otpLimiter = rateLimit({
  windowMs: 60 * 1000, 
  max: 3,
  message: {
    error: "Too many OTP requests. Try again after 1 minute",
  },
});

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

module.exports = { otpLimiter, globalLimiter };