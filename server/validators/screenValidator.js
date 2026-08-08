const { body } = require("express-validator");
const validate = require("../middleware/validationMiddleware");

const screenValidator = [
    body("theatreId").isMongoId().withMessage("Valid theatreId is required"),
    body("name").trim().notEmpty().withMessage("Screen name is required"),
    body("screenType").isIn(["2D", "3D", "IMAX", "4DX"]).withMessage("Invalid screen type"),
    body("rows").optional().isNumeric().withMessage("Rows must be a number"),
    body("cols").optional().isNumeric().withMessage("Cols must be a number"),
    validate
];

module.exports = {
    screenValidator
};
