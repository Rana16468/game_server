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
const prisma_1 = __importDefault(require("../../app/shared/prisma"));
const golobalErrorHnadelar_1 = require("../../app/middleware/golobalErrorHnadelar");
const UnAuthUser = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield prisma_1.default.user.deleteMany({
            where: { isVerified: false },
        });
    }
    catch (error) {
        throw new golobalErrorHnadelar_1.AppError(http_status_1.default.SERVICE_UNAVAILABLE, "Unauthorized User Server Issues", error);
    }
    finally {
        yield prisma_1.default.$disconnect();
    }
});
exports.default = UnAuthUser;
