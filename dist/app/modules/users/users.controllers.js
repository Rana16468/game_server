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
const users_services_1 = __importDefault(require("./users.services"));
const sendRespone_1 = __importDefault(require("../../shared/sendRespone"));
const http_status_1 = __importDefault(require("http-status"));
const users_constant_1 = require("./users.constant");
const ApiError_1 = __importDefault(require("../../error/ApiError"));
const pick_1 = __importDefault(require("../../shared/pick"));
const commontypes_1 = require("../../shared/common/commontypes");
const createUser = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield users_services_1.default.createUserIntoDb(req.body);
    (0, sendRespone_1.default)(res, {
        success: true,
        status: http_status_1.default.CREATED,
        message: "Checked Your Email Box Or Spam",
        data: result,
    });
}));
const chnageProfileStatus = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield users_services_1.default.chnageProfileStatusFromDb(req.body, req.params.userId, req.user.id);
    (0, sendRespone_1.default)(res, {
        success: true,
        status: http_status_1.default.OK,
        message: "Successfully Change Profile Status",
        data: result,
    });
}));
const userVarificationStatusChange = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield users_services_1.default.userVarificationStatusChangeFromDb(req.body);
    (0, sendRespone_1.default)(res, {
        success: true,
        status: http_status_1.default.OK,
        message: "Successfully Varified",
        data: result,
    });
}));
const updateMyProfile = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield users_services_1.default.updateMyProfileIntoDb(req.user, req);
    (0, sendRespone_1.default)(res, {
        success: true,
        status: http_status_1.default.OK,
        message: "Update My Profile Successfully",
        data: result,
    });
}));
const myProfile = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const result = yield users_services_1.default.myProfileFromDb(user);
    (0, sendRespone_1.default)(res, {
        success: true,
        status: http_status_1.default.OK,
        message: "Successfully Find My Profile",
        data: result,
    });
}));
const findAllUser = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const timePeriod = req.query.timePeriod;
    if (timePeriod && !commontypes_1.TimePeriodList.includes(timePeriod)) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Invalid time period. Must be one of: daily, weekly, monthly, yearly", "");
    }
    const filter = (0, pick_1.default)(req.query, users_constant_1.userFilterableFields);
    const option = (0, pick_1.default)(req.query, commontypes_1.FilterList);
    const result = yield users_services_1.default.findAllUserFromDb(filter, option);
    (0, sendRespone_1.default)(res, {
        success: true,
        status: http_status_1.default.OK,
        message: "Successfully Find All Monitoring",
        data: result,
    });
}));
const socialMediaLogin = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { accessToken, refreshToken } = yield users_services_1.default.socialMediaLoginIntoDb(req.body);
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
const UsersController = {
    createUser,
    chnageProfileStatus,
    userVarificationStatusChange,
    updateMyProfile,
    myProfile,
    findAllUser,
    socialMediaLogin,
};
exports.default = UsersController;
