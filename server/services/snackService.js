const Snack = require("../models/Snack");
const AppError = require("../utils/AppError");

const createSnack = async (snackData) => {
    return await Snack.create(snackData);
};

const getSnacks = async (query = {}) => {
    const filter = {};
    if (query.category) filter.category = query.category;
    if (query.available !== undefined) filter.isAvailable = query.available === "true";
    return await Snack.find(filter).sort("category name");
};

const getSnackById = async (id) => {
    const snack = await Snack.findById(id);
    if (!snack) throw new AppError("Snack item not found", 404);
    return snack;
};

const updateSnack = async (id, updateData) => {
    const snack = await Snack.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    if (!snack) throw new AppError("Snack item not found", 404);
    return snack;
};

const deleteSnack = async (id) => {
    const snack = await Snack.findByIdAndDelete(id);
    if (!snack) throw new AppError("Snack item not found", 404);
    return true;
};

module.exports = {
    createSnack,
    getSnacks,
    getSnackById,
    updateSnack,
    deleteSnack
};
