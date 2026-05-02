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
const catchAsync_1 = __importDefault(require("../../shared/catchAsync"));
const auth_services_1 = __importDefault(require("./auth.services"));
const sendRespone_1 = __importDefault(require("../../shared/sendRespone"));
const http_status_1 = __importDefault(require("http-status"));
const loginUser = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { accessToken, refreshToken } = yield auth_services_1.default.loginUserIntoDb(req.body);
    res.cookie("refreshToken", refreshToken, {
        secure: false,
        httpOnly: true,
    });
    (0, sendRespone_1.default)(res, {
        status: http_status_1.default.OK,
        success: true,
        message: "login successfull",
        data: {
            accessToken,
        },
    });
}));
const refreshToken = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //https://www.npmjs.com/package/cookie-parser
    const { refreshToken } = req.cookies;
    const result = yield auth_services_1.default.refreshTokenIntoDb(refreshToken);
    (0, sendRespone_1.default)(res, {
        status: http_status_1.default.OK,
        success: true,
        message: "Refresh Token Get Successfully",
        data: result,
    });
}));
const changePassword = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield auth_services_1.default.changePasswordIntoDb(req.user, req.body);
    (0, sendRespone_1.default)(res, {
        status: http_status_1.default.OK,
        success: true,
        message: "Successfully Change Password",
        data: result,
    });
}));
const forgotPassword = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield auth_services_1.default.forgotPasswordFromDb(req.body);
    (0, sendRespone_1.default)(res, {
        status: http_status_1.default.OK,
        success: true,
        message: "Checked Your Email Box Or Spam ",
        data: result,
    });
}));
const resetPassword = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.headers.authorization || "";
    console.log('token');
    console.log(token);
    const result = yield auth_services_1.default.resetPasswordFromDb(token, req.body);
    (0, sendRespone_1.default)(res, {
        status: http_status_1.default.OK,
        success: true,
        message: "Reset Password Successfully Executed",
        data: result,
    });
}));
const AuthController = {
    loginUser,
    refreshToken,
    changePassword,
    forgotPassword,
    resetPassword
};
exports.default = AuthController;
