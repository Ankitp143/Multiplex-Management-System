const http = require("http");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const app = require("./app");
const { initSocketServer } = require("./services/socketService");

dotenv.config();

// Connect to MongoDB
connectDB();

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// Initialize Socket.io Server for Real-Time Seat Locking
initSocketServer(server);

server.listen(PORT, () => {
    console.log(`==================================================`);
    console.log(`🎬 Multiplex Management System Server Running`);
    console.log(`📡 URL: http://localhost:${PORT}`);
    console.log(`==================================================`);
});