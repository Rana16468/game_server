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
const client_1 = require("@prisma/client");
const prisma_1 = __importDefault(require("../prisma"));
const golobalErrorHnadelar_1 = require("../../middleware/golobalErrorHnadelar");
const http_status_1 = __importDefault(require("http-status"));
const CheckedUser = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const isExist = yield prisma_1.default.user.findFirstOrThrow({
            where: {
                AND: [
                    {
                        id: payload.id,
                        isVerified: true,
                        status: client_1.UserStatus.ACTIVE,
                        role: payload.role,
                    },
                ],
            },
            select: {
                isVerified: true,
            },
        });
        return isExist;
    }
    catch (error) {
        throw new golobalErrorHnadelar_1.AppError(http_status_1.default.SERVICE_UNAVAILABLE, "Checked User Exist Issues", error);
    }
});
exports.default = CheckedUser;
