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

        // Auto seed movies and shows if database has fewer than 10 movies or fewer than 500 shows
        const Show = require("../models/Show");
        const movieCount = await Movie.countDocuments();
        const showCount = await Show.countDocuments();
        if (movieCount < 10 || showCount < 500) {
            console.log(`🎬 Found ${movieCount} movies & ${showCount} shows. Re-seeding full 14-day schedule for all 10 movies...`);
            try {
                await seedDatabase();
            } catch (seedErr) {
                console.error("⚠️ Auto-seed warning during DB connect:", seedErr.message);
            }
        }

        // Guarantee every existing theatre in database has screens
        const Theatre = require("../models/Theatre");
        const Screen = require("../models/Screen");
        const { generateSeatLayout } = require("../services/screenService");
        const allTheatres = await Theatre.find();
        for (const t of allTheatres) {
            const count = await Screen.countDocuments({ theatre: t._id });
            if (count === 0) {
                console.log(`📽️ Theatre "${t.name}" (${t._id}) has 0 screens. Generating default screens...`);
                const numScreens = (t.totalScreens && t.totalScreens > 0) ? t.totalScreens : 2;
                for (let i = 1; i <= numScreens; i++) {
                    const type = i % 2 === 1 ? "IMAX" : "4DX";
                    await Screen.create({
                        theatre: t._id,
                        name: `Audi ${i} (${type})`,
                        screenType: type,
                        seatingCapacity: 48,
                        rows: 6,
                        cols: 8,
                        seatLayout: generateSeatLayout(6, 8)
                    });
                }
                if (t.totalScreens < numScreens) {
                    t.totalScreens = numScreens;
                    await t.save();
                }
                console.log(`✅ Default screens created for "${t.name}"`);
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