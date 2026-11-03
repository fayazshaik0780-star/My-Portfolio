const nodemailer = require("nodemailer");

class ContactEmailError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

async function sendContactEmail(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new ContactEmailError(400, "Please provide your name, email, and message.");
  }

  const { name, email, message } = body;

  if (
    typeof name !== "string" ||
    typeof email !== "string" ||
    typeof message !== "string" ||
    !name.trim() ||
    !email.trim() ||
    !message.trim()
  ) {
    throw new ContactEmailError(400, "Please provide your name, email, and message.");
  }

  const trimmedName = name.trim();
  const trimmedEmail = email.trim();
  const trimmedMessage = message.trim();

  if (
    trimmedName.length > 100 ||
    trimmedEmail.length > 150 ||
    trimmedMessage.length > 5000
  ) {
    throw new ContactEmailError(400, "One or more fields exceed the allowed length.");
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
    throw new ContactEmailError(400, "Please provide a valid email address.");
  }

  const smtpHost = process.env.SMTP_HOST?.trim();
  const smtpUser = process.env.SMTP_USER?.trim();
  const smtpPassword = process.env.SMTP_PASS?.replace(/\s/g, "");
  const smtpPort = Number(process.env.SMTP_PORT || 465);
  const recipient = process.env.MAIL_TO?.trim() || smtpUser;

  if (
    !smtpHost ||
    !smtpUser ||
    !smtpPassword ||
    !Number.isInteger(smtpPort) ||
    smtpPort < 1 ||
    smtpPort > 65535 ||
    !recipient
  ) {
    throw new ContactEmailError(
      503,
      "Email delivery is not configured. Check SMTP environment variables."
    );
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpPassword
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 20000
  });

  try {
    await transporter.sendMail({
      from: smtpUser,
      to: recipient,
      replyTo: trimmedEmail,
      subject: "New portfolio contact message",
      text: `Name: ${trimmedName}\nEmail: ${trimmedEmail}\n\nMessage:\n${trimmedMessage}`
    });
  } catch (error) {
    console.error("Contact email error:", {
      code: error.code || "UNKNOWN",
      responseCode: error.responseCode
    });

    if (error.code === "EAUTH") {
      throw new ContactEmailError(
        503,
        "The mail provider rejected the SMTP login. Check SMTP_USER and the App Password environment variable."
      );
    }

    throw new ContactEmailError(500, "Unable to send your message right now.");
  }
}

module.exports = { ContactEmailError, sendContactEmail };
