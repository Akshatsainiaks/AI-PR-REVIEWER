const redis = require("./config/redis");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const getOtpTemplate = (otp) => `
<div style="font-family: 'Segoe UI', sans-serif; background:#f5f7fb; padding:30px;">
  <div style="max-width:500px; margin:auto; background:white; border-radius:12px; padding:30px; text-align:center;">
    <h2 style="color:#7f56d9;">Revuzen AI</h2>
    <p style="color:#555;">Use the OTP below to reset your password</p>
    <div style="font-size:32px; font-weight:bold; letter-spacing:6px; margin:20px 0;">
      ${otp}
    </div>
    <p style="color:#888;">Expires in 5 minutes</p>
  </div>
</div>
`;

exports.sendOTP = async (email) => {
  const cooldown = await redis.get(`otp_cooldown:${email}`);
  if (cooldown !== null && cooldown > 0) {
    throw new Error("Please wait 60 seconds before requesting another OTP");
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  await redis.set(`reset:${email}`, otp, "EX", 300);
  await redis.set(`otp_cooldown:${email}`, new Date(Date.now() + 60000).getTime() / 1000, "EX", 60);

  await transporter.sendMail({
    to: email,
    subject: "🔐 Revuzen Password Reset OTP",
    html: getOtpTemplate(otp),
  });
};

exports.verifyOTP = async (email, otp) => {
  const storedOtp = await redis.get(`reset:${email}`);

  if (!storedOtp || storedOtp !== otp) {
    return false;
  }

  await redis.delete(`reset:${email}`);
  return true;
};

exports.storeTempUser = async (email, data) => {
  if (await redis.exists(`temp:${email}`)) {
    await redis.del(`temp:${email}`);
  }
  await redis.set(`temp:${email}`, JSON.stringify(data), "EX", 300);
};

exports.getTempUser = async (email) => {
  const data = await redis.get(`temp:${email}`);
  return data ? JSON.parse(data) : {};
};