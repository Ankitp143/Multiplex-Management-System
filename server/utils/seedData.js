const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");

const User = require("../models/User");
const Movie = require("../models/Movie");
const Theatre = require("../models/Theatre");
const Screen = require("../models/Screen");
const Show = require("../models/Show");
const Snack = require("../models/Snack");
const Coupon = require("../models/Coupon");

dotenv.config();

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/multiplex_management_system");
        console.log("Connected to DB for Seeding...");

        // Clear existing data
        await User.deleteMany();
        await Movie.deleteMany();
        await Theatre.deleteMany();
        await Screen.deleteMany();
        await Show.deleteMany();
        await Snack.deleteMany();
        await Coupon.deleteMany();

        const hashedPassword = await bcrypt.hash("password123", 10);

        // 1. Create Users
        const admin = await User.create({
            firstName: "System",
            lastName: "Admin",
            email: "admin@mms.com",
            password: hashedPassword,
            phone: "9876543210",
            role: "admin",
            accountStatus: "Active"
        });

        const owner = await User.create({
            firstName: "Rajesh",
            lastName: "Sharma",
            email: "owner@mms.com",
            password: hashedPassword,
            phone: "9876543211",
            role: "theatre_owner",
            accountStatus: "Active"
        });

        const staff = await User.create({
            firstName: "Amit",
            lastName: "Kumar",
            email: "staff@mms.com",
            password: hashedPassword,
            phone: "9876543212",
            role: "staff",
            accountStatus: "Active"
        });

        const customer = await User.create({
            firstName: "Ankit",
            lastName: "Prajapati",
            email: "customer@mms.com",
            password: hashedPassword,
            phone: "9876543213",
            role: "customer",
            accountStatus: "Active"
        });

        console.log("✅ Users Seeded");

        // 2. Create Movies
        const movies = await Movie.insertMany([
            {
                title: "Avatar: The Way of Water",
                description: "Jake Sully lives with his newfound family formed on the extrasolar moon Pandora. Once a familiar threat returns to finish what was previously started, Jake must work with Neytiri and the army of the Na'vi race to protect their home.",
                genre: "Sci-Fi / Action",
                language: "English / Hindi",
                duration: 192,
                releaseDate: new Date("2026-06-15"),
                certificate: "UA",
                poster: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&q=80",
                trailer: "https://www.youtube.com/watch?v=d9MyW72ELq0",
                status: "Now Showing",
                averageRating: 4.8,
                numReviews: 124,
                createdBy: admin._id
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
                numReviews: 210,
                createdBy: admin._id
            },
            {
                title: "Interstellar",
                description: "When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft, along with a team of researchers, to find a new planet for humans.",
                genre: "Sci-Fi / Adventure",
                language: "English / Hindi",
                duration: 169,
                releaseDate: new Date("2026-08-01"),
                certificate: "UA",
                poster: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&q=80",
                trailer: "https://www.youtube.com/watch?v=zSWdZVtXT7E",
                status: "Now Showing",
                averageRating: 4.9,
                numReviews: 350,
                createdBy: admin._id
            },
            {
                title: "Dune: Part Two",
                description: "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.",
                genre: "Action / Sci-Fi",
                language: "English",
                duration: 166,
                releaseDate: new Date("2026-09-10"),
                certificate: "UA",
                poster: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500&q=80",
                trailer: "",
                status: "Coming Soon",
                averageRating: 0,
                numReviews: 0,
                createdBy: admin._id
            }
        ]);

        console.log("✅ Movies Seeded");

        // 3. Create Theatres & Screens
        const theatre = await Theatre.create({
            name: "PVR Grand Cinema",
            city: "Mumbai",
            address: "Phoenix Marketcity, Kurla West",
            phone: "022-67890123",
            owner: owner._id,
            totalScreens: 2
        });

        // Helper to generate seat grid
        const layout1 = [];
        const rows = ["A", "B", "C", "D", "E", "F"];
        rows.forEach(r => {
            for (let c = 1; c <= 8; c++) {
                const type = (r === "E" || r === "F") ? "VIP" : (r === "C" || r === "D" ? "Premium" : "Standard");
                const priceMultiplier = type === "VIP" ? 1.5 : (type === "Premium" ? 1.2 : 1.0);
                layout1.push({ seatNo: `${r}${c}`, row: r, number: c, type, priceMultiplier });
            }
        });

        const screen1 = await Screen.create({
            theatre: theatre._id,
            name: "Audi 1 (IMAX 3D)",
            screenType: "IMAX",
            seatingCapacity: 48,
            rows: 6,
            cols: 8,
            seatLayout: layout1
        });

        const screen2 = await Screen.create({
            theatre: theatre._id,
            name: "Audi 2 (4DX)",
            screenType: "4DX",
            seatingCapacity: 48,
            rows: 6,
            cols: 8,
            seatLayout: layout1
        });

        console.log("✅ Theatres & Screens Seeded");

        // 4. Create Shows
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        await Show.create([
            {
                movie: movies[0]._id,
                theatre: theatre._id,
                screen: screen1._id,
                showDate: today,
                startTime: "14:00",
                endTime: "17:15",
                ticketPrice: 350,
                status: "Scheduled",
                bookedSeats: ["A1", "A2"]
            },
            {
                movie: movies[1]._id,
                theatre: theatre._id,
                screen: screen2._id,
                showDate: today,
                startTime: "18:00",
                endTime: "21:00",
                ticketPrice: 300,
                status: "Scheduled",
                bookedSeats: []
            },
            {
                movie: movies[2]._id,
                theatre: theatre._id,
                screen: screen1._id,
                showDate: today,
                startTime: "21:30",
                endTime: "00:20",
                ticketPrice: 400,
                status: "Scheduled",
                bookedSeats: []
            }
        ]);

        console.log("✅ Shows Seeded");

        // 5. Create Snacks
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

        console.log("✅ Snacks Seeded");

        // 6. Create Coupons
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

        console.log("✅ Coupons Seeded");

        console.log("\n==================================================");
        console.log("🎉 ALL DEMO SEED DATA CREATED SUCCESSFULLY!");
        console.log("==================================================");
        console.log("Credentials:");
        console.log("1. Admin:         admin@mms.com    / password123");
        console.log("2. Theatre Owner: owner@mms.com    / password123");
        console.log("3. Staff:         staff@mms.com    / password123");
        console.log("4. Customer:      customer@mms.com / password123");
        console.log("==================================================");

        process.exit(0);
    } catch (err) {
        console.error("❌ Seed Error:", err);
        process.exit(1);
    }
};

seed();
