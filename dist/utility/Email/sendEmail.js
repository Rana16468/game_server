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
const nodemailer_1 = __importDefault(require("nodemailer"));
const config_1 = __importDefault(require("../../app/config"));
const ApiError_1 = __importDefault(require("../../app/error/ApiError"));
const http_status_1 = __importDefault(require("http-status"));
const sendEmail = (to, senddata) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const senderEmail = config_1.default.email_sender.email;
        const transporter = nodemailer_1.default.createTransport({
            host: "smtp.gmail.com.",
            port: 587,
            secure: config_1.default.NODE_ENV === "production",
            auth: {
                user: senderEmail,
                pass: config_1.default.email_sender.app_password,
            },
            tls: {
                minVersion: "TLSv1.2",
            },
        });
        yield transporter.verify();
        yield transporter.sendMail({
            from: {
                name: "Rate My Plate",
                address: senderEmail,
            },
            to,
            subject: senddata.subject,
            text: senddata.text,
            html: senddata.html,
            headers: {
                "X-Entity-Ref-ID": `${Date.now()}`,
                "List-Unsubscribe": `<mailto:${senderEmail}?subject=unsubscribe>`,
                "Message-ID": `<${Date.now()}.${Math.random()
                    .toString(36)
                    .substring(2)}@${senderEmail.split("@")[1]}>`,
            },
        });
    }
    catch (error) {
        throw new ApiError_1.default(http_status_1.default.SERVICE_UNAVAILABLE, "Email Engine Issues", error === null || error === void 0 ? void 0 : error.message);
    }
});
exports.default = sendEmail;
