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
const golobalErrorHnadelar_1 = require("../../app/middleware/golobalErrorHnadelar");
const http_status_1 = __importDefault(require("http-status"));
const carrierGateways = {
    att: "txt.att.net",
    verizon: "vtext.com",
    tmobile: "tmomail.net",
    sprint: "messaging.sprintpcs.com",
    grameenphone: "gptexter.com",
    banglalink: "banglalinksms.com",
    robi: "robi-sms.com",
    teletalk: "teletalksms.com",
};
const sendMessage = (phoneNumber, carrier, message) => __awaiter(void 0, void 0, void 0, function* () {
    const transporter = nodemailer_1.default.createTransport({
        service: "gmail",
        auth: {
            user: config_1.default.email_sender.email,
            pass: config_1.default.email_sender.app_password,
        },
    });
    if (!carrierGateways[carrier]) {
        console.error("Carrier not supported.");
        return;
    }
    const to = `${phoneNumber}@${carrierGateways[carrier]}`;
    const mailOptions = {
        from: config_1.default.email_sender.email,
        to,
        subject: "SMS Notification", // Required for some carriers
        text: message,
    };
    try {
        yield transporter.sendMail(mailOptions);
    }
    catch (error) {
        throw new golobalErrorHnadelar_1.AppError(http_status_1.default.INTERNAL_SERVER_ERROR, 'SMS Sending Engine Issues', error === null || error === void 0 ? void 0 : error.message);
    }
});
exports.default = sendMessage;
