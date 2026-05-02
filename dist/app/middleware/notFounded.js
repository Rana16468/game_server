"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const notFounded = (req, res, next) => {
    res.status(200).json({
        success: false,
        message: "Api Not Founded",
        error: {
            path: req.originalUrl,
            message: "Your Requested path not founded",
        },
    });
    next();
};
exports.default = notFounded;
