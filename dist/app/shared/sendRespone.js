"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sendRespone = (res, jsonData) => {
    res.status(jsonData.status).json({
        success: jsonData.success,
        message: jsonData.message,
        meta: jsonData.meta || null || undefined,
        data: jsonData.data || undefined || null,
    });
};
exports.default = sendRespone;
