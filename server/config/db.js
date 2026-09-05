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

        // Auto seed movies and shows if database has fewer than 10 movies or fewer than 50 shows
        const Show = require("../models/Show");
        const movieCount = await Movie.countDocuments();
        const showCount = await Show.countDocuments();
        if (movieCount < 10 || showCount < 50) {
            console.log(`🎬 Found ${movieCount} movies & ${showCount} shows (expected 50+ shows). Auto-seeding 14-day schedule...`);
            try {
                await seedDatabase();
            } catch (seedErr) {
                console.error("⚠️ Auto-seed warning during DB connect:", seedErr.message);
            }
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