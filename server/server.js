const dotenv = require("dotenv");
const connectDB = require("./config/db");
const app = require("./app");

dotenv.config();

// Connect to MongoDB
connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`==================================================`);
    console.log(`🎬 Multiplex Management System Server Running`);
    console.log(`📡 URL: http://localhost:${PORT}`);
    console.log(`==================================================`);
});