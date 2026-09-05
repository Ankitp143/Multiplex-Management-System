const mongoose = require("mongoose");
const dotenv = require("dotenv");

const User = require("../models/User");
const Movie = require("../models/Movie");
const Theatre = require("../models/Theatre");
const Screen = require("../models/Screen");
const Show = require("../models/Show");
const Snack = require("../models/Snack");
const Coupon = require("../models/Coupon");

dotenv.config();

const MOVIES_DATA = [
    {
        title: "Avatar: The Way of Water",
        description: "Jake Sully lives with his newfound family formed on the extrasolar moon Pandora. Once a familiar threat returns to finish what was previously started, Jake must work with Neytiri to protect their home.",
        genre: "Sci-Fi / Action / Adventure",
        language: "English / Hindi",
        duration: 192,
        releaseDate: new Date("2026-06-15"),
        certificate: "UA",
        poster: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&q=80",
        trailer: "https://www.youtube.com/watch?v=d9MyW72ELq0",
        status: "Now Showing",
        averageRating: 4.8,
        numReviews: 124
    },
    {
        title: "Oppenheimer",
        description: "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II.",
        genre: "Biography / Drama / History",
        language: "English",
        duration: 180,
        releaseDate: new Date("2026-07-20"),
        certificate: "A",
        poster: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&q=80",
        trailer: "https://www.youtube.com/watch?v=uYPbbksJxIg",
        status: "Now Showing",
        averageRating: 4.9,
        numReviews: 210
    },
    {
        title: "Interstellar",
        description: "When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft to find a new planet for humanity.",
        genre: "Sci-Fi / Adventure",
        language: "English / Hindi",
        duration: 169,
        releaseDate: new Date("2026-08-01"),
        certificate: "UA",
        poster: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&q=80",
        trailer: "https://www.youtube.com/watch?v=zSWdZVtXT7E",
        status: "Now Showing",
        averageRating: 4.9,
        numReviews: 350
    },
    {
        title: "Dune: Part Two",
        description: "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.",
        genre: "Action / Sci-Fi",
        language: "English / Hindi",
        duration: 166,
        releaseDate: new Date("2026-09-01"),
        certificate: "UA",
        poster: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500&q=80",
        trailer: "https://www.youtube.com/watch?v=Way9Dexny3w",
        status: "Now Showing",
        averageRating: 4.7,
        numReviews: 180
    },
    {
        title: "Spider-Man: Across the Spider-Verse",
        description: "Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence.",
        genre: "Animation / Action / Sci-Fi",
        language: "English / Hindi",
        duration: 140,
        releaseDate: new Date("2026-06-02"),
        certificate: "U",
        poster: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=500&q=80",
        trailer: "https://www.youtube.com/watch?v=cqGjhVJWtEg",
        status: "Now Showing",
        averageRating: 4.9,
        numReviews: 420
    },
    {
        title: "The Dark Knight",
        description: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
        genre: "Action / Crime / Drama",
        language: "English / Hindi",
        duration: 152,
        releaseDate: new Date("2026-05-10"),
        certificate: "UA",
        poster: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500&q=80",
        trailer: "https://www.youtube.com/watch?v=EXeTwQWrcwY",
        status: "Now Showing",
        averageRating: 5.0,
        numReviews: 890
    },
    {
        title: "Inception",
        description: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
        genre: "Action / Adventure / Sci-Fi",
        language: "English / Hindi",
        duration: 148,
        releaseDate: new Date("2026-04-15"),
        certificate: "UA",
        poster: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&q=80",
        trailer: "https://www.youtube.com/watch?v=YoHD9XEInc0",
        status: "Now Showing",
        averageRating: 4.8,
        numReviews: 610
    },
    {
        title: "Avengers: Endgame",
        description: "After the devastating events of Infinity War, the universe is in ruins. With the help of remaining allies, the Avengers assemble once more to reverse Thanos' actions.",
        genre: "Action / Sci-Fi / Drama",
        language: "English / Hindi",
        duration: 181,
        releaseDate: new Date("2026-04-26"),
        certificate: "UA",
        poster: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&q=80",
        trailer: "https://www.youtube.com/watch?v=TcMBFSGVi1c",
        status: "Now Showing",
        averageRating: 4.9,
        numReviews: 950
    },
    {
        title: "Jawan",
        description: "A high-octane action thriller which outlines the emotional journey of a man who is set to rectify the wrongs in the society.",
        genre: "Action / Thriller",
        language: "Hindi",
        duration: 169,
        releaseDate: new Date("2026-09-07"),
        certificate: "UA",
        poster: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&q=80",
        trailer: "https://www.youtube.com/watch?v=COv52Qyctws",
        status: "Coming Soon",
        averageRating: 0,
        numReviews: 0
    },
    {
        title: "Kalki 2898 AD",
        description: "A modern avatar of Vishnu, a Hindu god, who is believed to have descended to earth to protect the world from evil forces.",
        genre: "Sci-Fi / Action / Mythology",
        language: "Telugu / Hindi / English",
        duration: 180,
        releaseDate: new Date("2026-09-25"),
        certificate: "UA",
        poster: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500&q=80",
        trailer: "https://www.youtube.com/watch?v=kQDd1AhGIHk",
        status: "Coming Soon",
        averageRating: 0,
        numReviews: 0
    }
];

const seedDatabase = async () => {
    try {
        console.log("🌱 Starting Movie & Show Database Seed...");

        // Clear existing collection data & drop stale indexes
        await Movie.collection.drop().catch(() => {});
        await Theatre.collection.drop().catch(() => {});
        await Screen.collection.drop().catch(() => {});
        await Show.collection.drop().catch(() => {});
        await Snack.collection.drop().catch(() => {});
        await Coupon.collection.drop().catch(() => {});

        // 1. Insert 10 Movies
        const movies = await Movie.insertMany(MOVIES_DATA);
        console.log(`✅ ${movies.length} Movies Seeded with Trailers & Posters`);

        // 2. Create Theatre & Screens
        const theatre = await Theatre.create({
            name: "PVR Grand Cinema",
            city: "Mumbai",
            address: "Phoenix Marketcity, Kurla West",
            phone: "022-67890123",
            totalScreens: 2
        });

        // Helper to generate seat layout (6 rows x 8 cols = 48 seats)
        const layout = [];
        const rows = ["A", "B", "C", "D", "E", "F"];
        rows.forEach(r => {
            for (let c = 1; c <= 8; c++) {
                const type = (r === "E" || r === "F") ? "VIP" : (r === "C" || r === "D" ? "Premium" : "Standard");
                const priceMultiplier = type === "VIP" ? 1.5 : (type === "Premium" ? 1.2 : 1.0);
                layout.push({ seatNo: `${r}${c}`, row: r, number: c, type, priceMultiplier });
            }
        });

        const screen1 = await Screen.create({
            theatre: theatre._id,
            name: "Audi 1 (IMAX 3D)",
            screenType: "IMAX",
            seatingCapacity: 48,
            rows: 6,
            cols: 8,
            seatLayout: layout
        });

        const screen2 = await Screen.create({
            theatre: theatre._id,
            name: "Audi 2 (4DX)",
            screenType: "4DX",
            seatingCapacity: 48,
            rows: 6,
            cols: 8,
            seatLayout: layout
        });

        console.log("✅ Multiplex Theatres & Screens Created");

        // 3. Create 6 Active Shows for Today
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const shows = await Show.create([
            {
                movie: movies[0]._id, // Avatar
                theatre: theatre._id,
                screen: screen1._id,
                showDate: today,
                startTime: "11:00",
                endTime: "14:15",
                ticketPrice: 350,
                status: "Scheduled",
                bookedSeats: ["A1", "A2"]
            },
            {
                movie: movies[1]._id, // Oppenheimer
                theatre: theatre._id,
                screen: screen2._id,
                showDate: today,
                startTime: "14:30",
                endTime: "17:30",
                ticketPrice: 300,
                status: "Scheduled",
                bookedSeats: []
            },
            {
                movie: movies[2]._id, // Interstellar
                theatre: theatre._id,
                screen: screen1._id,
                showDate: today,
                startTime: "18:00",
                endTime: "20:50",
                ticketPrice: 400,
                status: "Scheduled",
                bookedSeats: ["B3", "B4", "B5"]
            },
            {
                movie: movies[3]._id, // Dune: Part Two
                theatre: theatre._id,
                screen: screen2._id,
                showDate: today,
                startTime: "18:30",
                endTime: "21:15",
                ticketPrice: 350,
                status: "Scheduled",
                bookedSeats: []
            },
            {
                movie: movies[4]._id, // Spider-Man
                theatre: theatre._id,
                screen: screen1._id,
                showDate: today,
                startTime: "21:15",
                endTime: "23:35",
                ticketPrice: 380,
                status: "Scheduled",
                bookedSeats: []
            },
            {
                movie: movies[5]._id, // Dark Knight
                theatre: theatre._id,
                screen: screen2._id,
                showDate: today,
                startTime: "21:45",
                endTime: "00:20",
                ticketPrice: 320,
                status: "Scheduled",
                bookedSeats: ["C1"]
            }
        ]);

        console.log(`✅ ${shows.length} Shows Scheduled for Today`);

        // 4. Create Snacks
        await Snack.insertMany([
            {
                name: "Large Salted Popcorn",
                category: "Popcorn",
                price: 250,
                description: "Freshly popped crispy popcorn with natural sea salt",
                image: "https://images.unsplash.com/photo-1578849278619-e73505e9610f?w=500&q=80",
                isAvailable: true
            },
            {
                name: "Cheese Burst Popcorn",
                category: "Popcorn",
                price: 290,
                description: "Warm popcorn loaded with delicious cheddar cheese powder",
                image: "https://images.unsplash.com/photo-1585647347483-22b66260dfff?w=500&q=80",
                isAvailable: true
            },
            {
                name: "Coca Cola Large (750ml)",
                category: "Beverage",
                price: 180,
                description: "Chilled sparkling beverage",
                image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&q=80",
                isAvailable: true
            },
            {
                name: "Movie Snack Combo",
                category: "Combos",
                price: 420,
                description: "1 Large Popcorn + 2 Large Cold Drinks + Nachos with Dip",
                image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&q=80",
                isAvailable: true
            }
        ]);

        console.log("✅ Snacks & Beverages Seeded");

        // 5. Create Coupons
        await Coupon.insertMany([
            {
                code: "WELCOME100",
                discountAmount: 100,
                minBookingAmount: 300,
                maxDiscount: 100,
                validUntil: new Date("2028-12-31"),
                isActive: true
            },
            {
                code: "BLOCKBUSTER20",
                discountPercentage: 20,
                minBookingAmount: 500,
                maxDiscount: 200,
                validUntil: new Date("2028-12-31"),
                isActive: true
            }
        ]);

        console.log("✅ Discount Coupons Seeded");
        console.log("🎉 Seed Completed Successfully!");
        return true;
    } catch (err) {
        console.error("❌ Seed Error:", err);
        throw err;
    }
};

// Standalone execution support
if (require.main === module) {
    mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/multiplex_management_system")
        .then(() => seedDatabase())
        .then(() => process.exit(0))
        .catch(err => {
            console.error("DB Connect Error:", err);
            process.exit(1);
        });
}

module.exports = {
    seedDatabase,
    MOVIES_DATA
};
