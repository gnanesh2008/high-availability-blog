
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const http = require("http");
const crypto = require("crypto");
const { Server } = require("socket.io");
const { connectMQTT, publishMessage } = require("./mqtt");

const app = express();
const server = http.createServer(app);

// Allow the Vite frontend
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175"
  ]
}));

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175"
    ],
    methods: ["GET", "POST"]
  }
});

// Connect to AWS IoT
const mqttClient = connectMQTT();

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "online",
    mqttConnected: mqttClient.connected
  });
});

// GitHub webhook
app.post(
  "/api/github/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    try {
      const secret = process.env.GITHUB_WEBHOOK_SECRET;
      const signature = req.get("x-hub-signature-256");

      if (!secret) {
        return res.status(500).json({
          error: "GitHub webhook secret is not configured"
        });
      }

      if (!signature || !Buffer.isBuffer(req.body)) {
        return res.status(401).json({
          error: "Missing GitHub signature"
        });
      }

      const expected =
        "sha256=" +
        crypto
          .createHmac("sha256", secret)
          .update(req.body)
          .digest("hex");

      const receivedBuffer = Buffer.from(signature);
      const expectedBuffer = Buffer.from(expected);

      if (
        receivedBuffer.length !== expectedBuffer.length ||
        !crypto.timingSafeEqual(receivedBuffer, expectedBuffer)
      ) {
        return res.status(401).json({
          error: "Invalid GitHub signature"
        });
      }

      const eventType = req.get("x-github-event");
      const payload = JSON.parse(req.body.toString("utf8"));

      if (eventType === "ping") {
        return res.json({ message: "GitHub webhook connected!" });
      }

      if (eventType !== "push") {
        return res.json({
          message: "Event ignored",
          event: eventType
        });
      }

      const commits = (payload.commits || []).map(commit => ({
        id: commit.id,
        message: commit.message,
        author: commit.author?.name || "Unknown",
        timestamp: commit.timestamp,
        url: commit.url
      }));

      const githubEvent = {
        type: "github_push",
        repository: payload.repository?.full_name || "Unknown",
        branch: (payload.ref || "").replace("refs/heads/", ""),
        author: payload.pusher?.name || "Unknown",
        totalCommits: commits.length,
        commits,
        latestCommit: payload.head_commit?.message || "No commit message",
        timestamp: new Date().toISOString()
      };

      // Publish GitHub event to AWS IoT
      await publishMessage(githubEvent);

      console.log("GitHub event published:", githubEvent.repository);

      res.status(202).json({
        success: true,
        message: "GitHub event sent to AWS IoT",
        totalCommits: commits.length
      });

    } catch (error) {
      console.error("GitHub webhook error:", error.message);

      res.status(500).json({
        error: "Webhook processing failed"
      });
    }
  }
);

// Normal JSON middleware
app.use(express.json());

// Forward AWS IoT messages to React
mqttClient.on("message", (topic, payload) => {
  let message = payload.toString();

  try {
    message = JSON.parse(message);
  } catch (error) {
    // Keep plain text messages
  }

  io.emit("iot-message", {
    topic,
    message,
    timestamp: new Date().toISOString()
  });

  console.log("Message forwarded to dashboard:", topic);
});

// MQTT status
mqttClient.on("connect", () => {
  io.emit("mqtt-status", { connected: true });
});

mqttClient.on("offline", () => {
  io.emit("mqtt-status", { connected: false });
});

// Dashboard connection
io.on("connection", (socket) => {
  console.log("Dashboard connected:", socket.id);

  socket.emit("mqtt-status", {
    connected: mqttClient.connected
  });
});

// Start backend
const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
// Testing GitHub webhook push event