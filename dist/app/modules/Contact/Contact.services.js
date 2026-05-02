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
exports.ContactService = void 0;
const prisma_1 = __importDefault(require("../../shared/prisma"));
const golobalErrorHnadelar_1 = require("../../middleware/golobalErrorHnadelar");
const http_status_1 = __importDefault(require("http-status"));
// import sendEmail from "../../../utility/Email/sendEmail";
const sendMessage_1 = __importDefault(require("../../../utility/Message/sendMessage"));
const ContactIntoDb = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield prisma_1.default.contact.create({
            data: payload,
        });
        return result;
    }
    catch (error) {
        throw new golobalErrorHnadelar_1.AppError(http_status_1.default.NOT_ACCEPTABLE, "Not Acceptable this contract data", error === null || error === void 0 ? void 0 : error.message);
    }
});
const FindAllContractListFromDb = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield prisma_1.default.contact.findMany({});
        return result;
    }
    catch (error) {
        throw new golobalErrorHnadelar_1.AppError(http_status_1.default.NOT_ACCEPTABLE, "Not Acceptable this contract data", error === null || error === void 0 ? void 0 : error.message);
    }
});
const DeleteContactFromDb = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const deleteResult = yield prisma_1.default.contact.delete({
            where: {
                id: id,
            },
        });
        if (deleteResult) {
            return {
                deleteId: deleteResult === null || deleteResult === void 0 ? void 0 : deleteResult.id,
                message: "server site data delete successfully",
            };
        }
    }
    catch (error) {
        throw new golobalErrorHnadelar_1.AppError(http_status_1.default.NOT_ACCEPTABLE, "Not Acceptable this contract data", error === null || error === void 0 ? void 0 : error.message);
    }
});
const SendSMS = () => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Sohel");
    const phoneNumber = "+8801722305054"; // Replace with a real phone number
    const carrier = "grameenphone"; // Supported carriers: att, verizon, tmobile, sprint
    const message = "Hello, this is a test SMS from my Node.js app! My Name Sohel";
    //  sendEmail('amsr215019@gmail.com',{
    //   html:"the quick Box Jumps Over the Lazy Dog",
    //   subject:"Auth",
    //   text:"10 min "
    //  })
    (0, sendMessage_1.default)(phoneNumber, carrier, message);
    return "Successfully Send SMS";
});
exports.ContactService = {
    ContactIntoDb,
    FindAllContractListFromDb,
    DeleteContactFromDb,
    SendSMS
};
