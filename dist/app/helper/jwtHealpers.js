"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.jwtHalpers = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const golobalErrorHnadelar_1 = require("../middleware/golobalErrorHnadelar");
const http_status_1 = __importDefault(require("http-status"));
const generateToken = (payload, srcret, expiresIn) => {
    try {
        const token = jsonwebtoken_1.default.sign(payload, srcret, { algorithm: "HS256", expiresIn });
        return token;
    }
    catch (error) {
        throw new golobalErrorHnadelar_1.AppError(http_status_1.default.NOT_ACCEPTABLE, "Generate Token is Not Acceptable", error === null || error === void 0 ? void 0 : error.message);
    }
};
const varifyToken = (token, refeesh_srcret) => {
    try {
        return jsonwebtoken_1.default.verify(token, refeesh_srcret);
    }
    catch (error) {
        throw new golobalErrorHnadelar_1.AppError(http_status_1.default.NOT_ACCEPTABLE, "Varify Token is Not Acceptable", error === null || error === void 0 ? void 0 : error.message);
    }
};
exports.jwtHalpers = {
    generateToken,
    varifyToken,
};
