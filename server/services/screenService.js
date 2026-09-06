const Screen = require("../models/Screen");
const Theatre = require("../models/Theatre");
const AppError = require("../utils/AppError");

// Helper to generate seat grid automatically
const generateSeatLayout = (rowsCount, colsCount) => {
    const layout = [];
    const rowLetters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O"];
    
    for (let r = 0; r < rowsCount; r++) {
        const rowLabel = rowLetters[r] || `R${r + 1}`;
        for (let c = 1; c <= colsCount; c++) {
            let seatType = "Standard";
            let priceMultiplier = 1.0;

            if (r === rowsCount - 1 || r === rowsCount - 2) {
                seatType = "VIP";
                priceMultiplier = 1.5;
            } else if (r >= Math.floor(rowsCount / 2)) {
                seatType = "Premium";
                priceMultiplier = 1.2;
            }

            layout.push({
                seatNo: `${rowLabel}${c}`,
                row: rowLabel,
                number: c,
                type: seatType,
                priceMultiplier
            });
        }
    }
    return layout;
};

const createScreen = async (screenData, user) => {
    const { theatreId, name, screenType, seatingCapacity, rows = 8, cols = 10 } = screenData;
    
    const theatre = await Theatre.findById(theatreId);
    if (!theatre) {
        throw new AppError("Theatre not found", 404);
    }

    if (user.role !== "admin" && theatre.owner.toString() !== user.id) {
        throw new AppError("Not authorized to add screens to this theatre", 403);
    }

    const calculatedCapacity = rows * cols;
    const seatLayout = generateSeatLayout(rows, cols);

    const screen = await Screen.create({
        theatre: theatreId,
        name,
        screenType: screenType || "2D",
        seatingCapacity: calculatedCapacity,
        rows,
        cols,
        seatLayout
    });

    // Update screen count in theatre
    theatre.totalScreens += 1;
    await theatre.save();

    return screen;
};

const getScreensByTheatre = async (theatreId) => {
    let screens = await Screen.find({ theatre: theatreId });
    if (!screens || screens.length === 0) {
        const theatre = await Theatre.findById(theatreId);
        if (theatre) {
            const numScreens = theatre.totalScreens || 2;
            const createdScreens = [];
            for (let i = 1; i <= numScreens; i++) {
                const type = i % 2 === 1 ? "IMAX" : "4DX";
                const s = await Screen.create({
                    theatre: theatreId,
                    name: `Audi ${i} (${type})`,
                    screenType: type,
                    seatingCapacity: 48,
                    rows: 6,
                    cols: 8,
                    seatLayout: generateSeatLayout(6, 8)
                });
                createdScreens.push(s);
            }
            screens = createdScreens;
        }
    }
    return screens;
};

const getScreenById = async (screenId) => {
    const screen = await Screen.findById(screenId).populate("theatre");
    if (!screen) {
        throw new AppError("Screen not found", 404);
    }
    return screen;
};

const updateScreen = async (screenId, updateData, user) => {
    const screen = await Screen.findById(screenId).populate("theatre");
    if (!screen) {
        throw new AppError("Screen not found", 404);
    }

    if (user.role !== "admin" && screen.theatre.owner.toString() !== user.id) {
        throw new AppError("Not authorized to update this screen", 403);
    }

    if (updateData.rows && updateData.cols) {
        updateData.seatLayout = generateSeatLayout(updateData.rows, updateData.cols);
        updateData.seatingCapacity = updateData.rows * updateData.cols;
    }

    Object.assign(screen, updateData);
    await screen.save();
    return screen;
};

const deleteScreen = async (screenId, user) => {
    const screen = await Screen.findById(screenId).populate("theatre");
    if (!screen) {
        throw new AppError("Screen not found", 404);
    }

    if (user.role !== "admin" && screen.theatre.owner.toString() !== user.id) {
        throw new AppError("Not authorized to delete this screen", 403);
    }

    await screen.deleteOne();

    // Decrement total screens in theatre
    const theatre = await Theatre.findById(screen.theatre._id);
    if (theatre && theatre.totalScreens > 0) {
        theatre.totalScreens -= 1;
        await theatre.save();
    }

    return true;
};

module.exports = {
    createScreen,
    getScreensByTheatre,
    getScreenById,
    updateScreen,
    deleteScreen
};
