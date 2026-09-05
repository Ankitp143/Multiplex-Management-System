const mongoose = require("mongoose");
const Movie = require("../models/Movie");
const { seedDatabase } = require("../utils/seedData");

const connectDB = async () => {
    try {
        const connection = await mongoose.connect(process.env.MONGODB_URI);

        console.log("==========================================");
        console.log("✅ MongoDB Connected Successfully");
        console.log(`📂 Database : ${connection.connection.name}`);
        console.log(`🖥️  Host     : ${connection.connection.host}`);
        console.log("==========================================");

        // Auto seed movies and shows if database is empty
        const movieCount = await Movie.countDocuments();
        if (movieCount === 0) {
            console.log("🎬 Empty database detected! Auto-seeding 10 movies and show schedules...");
            await seedDatabase();
        }
    } catch (error) {
        console.error("==========================================");
        console.error("❌ MongoDB Connection Failed");
        console.error(error.message);
        console.error("==========================================");

        process.exit(1);
    }
};

module.exports = connectDB;