const Theatre = require("../models/Theatre");
const AppError = require("../utils/AppError");

const createTheatre = async (theatreData, ownerId) => {
    const theatre = await Theatre.create({
        ...theatreData,
        owner: ownerId
    });

    try {
        const Screen = require("../models/Screen");
        const { generateSeatLayout } = require("./screenService");
        const numScreens = theatre.totalScreens || 2;
        for (let i = 1; i <= numScreens; i++) {
            const type = i % 2 === 1 ? "IMAX" : "4DX";
            await Screen.create({
                theatre: theatre._id,
                name: `Audi ${i} (${type})`,
                screenType: type,
                seatingCapacity: 48,
                rows: 6,
                cols: 8,
                seatLayout: generateSeatLayout(6, 8)
            });
        }
    } catch (err) {
        console.error("Auto screen creation error for theatre:", err.message);
    }

    return theatre;
};

const getAllTheatres = async (query = {}) => {
    const filter = {};
    if (query.city) filter.city = new RegExp(query.city, "i");
    if (query.owner) filter.owner = query.owner;
    return await Theatre.find(filter).populate("owner", "firstName lastName email phone");
};

const getTheatreById = async (theatreId) => {
    const theatre = await Theatre.findById(theatreId).populate("owner", "firstName lastName email phone");
    if (!theatre) {
        throw new AppError("Theatre not found", 404);
    }
    return theatre;
};

const updateTheatre = async (theatreId, updateData, user) => {
    const theatre = await Theatre.findById(theatreId);
    if (!theatre) {
        throw new AppError("Theatre not found", 404);
    }

    if (user.role !== "admin" && theatre.owner.toString() !== user.id) {
        throw new AppError("Not authorized to update this theatre", 403);
    }

    Object.assign(theatre, updateData);
    await theatre.save();
    return theatre;
};

const deleteTheatre = async (theatreId, user) => {
    const theatre = await Theatre.findById(theatreId);
    if (!theatre) {
        throw new AppError("Theatre not found", 404);
    }

    if (user.role !== "admin" && theatre.owner.toString() !== user.id) {
        throw new AppError("Not authorized to delete this theatre", 403);
    }

    await theatre.deleteOne();
    return true;
};

module.exports = {
    createTheatre,
    getAllTheatres,
    getTheatreById,
    updateTheatre,
    deleteTheatre
};
