
const express = require("express");
const cors = require("cors");
const path = require("path");
const nodemailer = require("nodemailer");
require("dotenv").config();

const pool = require("./database");

const app = express();
const PORT = process.env.PORT || 3000;

// Allow your local portfolio frontend to call this API.
app.use(cors({
  origin: [
    "http://127.0.0.1:5500",
    "http://localhost:5500"
  ]
}));

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Test route
app.get("/api/health", (req, res) => {
  res.json({ message: "Portfolio backend is running!" });
});


app.get("/api/db-health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ database: "connected" });
  } catch (error) {
    console.error("Database diagnostic:", {
      code: error.code,
      message: error.message
    });

    res.status(503).json({
      database: "disconnected",
      errorCode: error.code || "UNKNOWN"
    });
  }
});



// Save contact form submissions
app.post("/api/contacts", async (req, res) => {
  try {
    const body = req.body;
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return res.status(400).json({
        message: "Please provide your name, email, and message."
      });
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
      return res.status(400).json({
        message: "Please provide your name, email, and message."
      });
    }

    if (
      name.trim().length > 100 ||
      email.trim().length > 150 ||
      message.trim().length > 5000
    ) {
      return res.status(400).json({
        message: "One or more fields exceed the allowed length."
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({
        message: "Please provide a valid email address."
      });
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
      return res.status(503).json({
        message: "Email delivery is not configured. Check SMTP settings in the private .env file."
      });
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

    await transporter.sendMail({
      from: smtpUser,
      to: recipient,
      replyTo: email.trim(),
      subject: "New portfolio contact message",
      text: `Name: ${name.trim()}\nEmail: ${email.trim()}\n\nMessage:\n${message.trim()}`
    });

    res.status(201).json({ message: "Your message was sent successfully." });
  } catch (error) {
    console.error("Contact email error:", {
      code: error.code || "UNKNOWN",
      responseCode: error.responseCode
    });

    if (error.code === "EAUTH") {
      return res.status(503).json({
        message: "The mail provider rejected the SMTP login. Check SMTP_USER and use a valid App Password in .env."
      });
    }

    res.status(500).json({
      message: "Unable to send your message right now."
    });
  }
});

app.listen(PORT, () => {
  console.log(`Portfolio backend running at http://localhost:${PORT}`);
});
