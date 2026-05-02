"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const block_controllers_1 = __importDefault(require("./block.controllers"));
const router = express_1.default.Router();
router.post("/block_my_plate", block_controllers_1.default.createBlock);
const BlockRoutes = router;
exports.default = BlockRoutes;
