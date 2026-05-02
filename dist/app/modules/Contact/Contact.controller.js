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
exports.ContactController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../../shared/catchAsync"));
const sendRespone_1 = __importDefault(require("../../shared/sendRespone"));
const Contact_services_1 = require("./Contact.services");
const Contact = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield Contact_services_1.ContactService.ContactIntoDb(req.body);
    (0, sendRespone_1.default)(res, {
        success: true,
        status: http_status_1.default.CREATED,
        message: "Create successfully Profile",
        data: result,
    });
}));
const FindAllContractList = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield Contact_services_1.ContactService.FindAllContractListFromDb();
    (0, sendRespone_1.default)(res, {
        success: true,
        status: http_status_1.default.OK,
        message: "Successfully Find All Contact List",
        data: result,
    });
}));
const DeleteContact = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield Contact_services_1.ContactService.DeleteContactFromDb(Number(req.params.id));
    (0, sendRespone_1.default)(res, {
        success: true,
        status: http_status_1.default.OK,
        message: "Successfully Delete Contact Information",
        data: result,
    });
}));
const SendSMS = (0, catchAsync_1.default)(((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield Contact_services_1.ContactService.SendSMS();
    (0, sendRespone_1.default)(res, {
        success: true,
        status: http_status_1.default.OK,
        message: "Successfully Send SMS",
        data: result,
    });
})));
exports.ContactController = {
    Contact,
    FindAllContractList,
    DeleteContact,
    SendSMS
};
