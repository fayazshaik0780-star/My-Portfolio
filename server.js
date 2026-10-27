
const express = require("express");
const cors = require("cors");
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

// Test route
app.get("/api/health", (req, res) => {
  res.json({ message: "Portfolio backend is running!" });
});

app.get("/api/db-health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ database: "connected" });
  } catch (error) {
    console.error(
      "Database connection test failed:",
      error.code || error.message
    );
    res.status(503).json({ database: "disconnected" });
  }
});


// Save contact form submissions
app.post("/api/contacts", async (req, res) => {
  try {
    const { name, email, message } = req.body;

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

    const sql = `
      INSERT INTO contacts (name, email, message)
      VALUES (?, ?, ?)
    `;

    const [result] = await pool.execute(sql, [
      name.trim(),
      email.trim(),
      message.trim()
    ]);

    res.status(201).json({
      message: "Your message was saved successfully!",
      id: result.insertId
    });
  } catch (error) {
    console.error("Contact API error:", error.message);

    res.status(500).json({
      message: "Unable to save your message right now."
    });
  }
});

app.listen(PORT, () => {
  console.log(`Portfolio backend running at http://localhost:${PORT}`);
});
