
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./src/config/db.js";
import incidentRoutes from "./src/routes/incidentRoutes.js";


dotenv.config();

// Connect to database
connectDB();

// Initialize express
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:3000" }));
app.use(express.json());

//  Route 
app.use("/api/incidents", incidentRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Create HTTP server
const httpServer = createServer(app);

// Socket.io setup
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// Make io available to routes
app.set("io", io);

// Socket connection handling
io.on("connection", (socket) => {
  console.log("🔌 Client connected:", socket.id);

  socket.on("join_incident", (incidentId) => {
    socket.join(`incident_${incidentId}`);
    console.log(`📡 Socket ${socket.id} joined incident ${incidentId}`);
  });

  socket.on("disconnect", () => {
    console.log("🔌 Client disconnected:", socket.id);
  });
});

// Start server
httpServer.listen(PORT, () => {
  console.log(`
═══════════════════════════════════════
🚀 CODE AUTOPSY ENGINE BACKEND
═══════════════════════════════════════
📡 Server: http://localhost:${PORT}
🔌 WebSocket: ws://localhost:${PORT}
🌍 Environment: ${process.env.NODE_ENV || "development"}
═══════════════════════════════════════
  `);
});