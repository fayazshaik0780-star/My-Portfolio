
const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const pool = require("./database");
const { sendContactEmail } = require("./contact-email");

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
    await sendContactEmail(req.body);
    res.status(201).json({ message: "Your message was sent successfully." });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message || "Unable to send your message right now."
    });
  }
});

app.listen(PORT, () => {
  console.log(`Portfolio backend running at http://localhost:${PORT}`);
});
