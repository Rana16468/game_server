"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const rating_controllers_1 = __importDefault(require("./rating.controllers"));
const router = express_1.default.Router();
router.get("/find_all_rating", rating_controllers_1.default.find_all_rating);
const RatingRoutes = router;
exports.default = RatingRoutes;
