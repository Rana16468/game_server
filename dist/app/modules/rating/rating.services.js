"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_status_1 = __importDefault(require("http-status"));
const golobalErrorHnadelar_1 = require("../../middleware/golobalErrorHnadelar");
const prisma_1 = __importDefault(require("../../shared/prisma"));
const find_all_ratingFromDb = () => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma_1.default.view
        .findMany({})
        .then((result) => result)
        .catch((error) => {
        throw new golobalErrorHnadelar_1.AppError(http_status_1.default.SERVICE_UNAVAILABLE, "Error find All Rating Issues server issues", error);
    });
});
const RatingServices = {
    find_all_ratingFromDb,
};
exports.default = RatingServices;
