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
const post_services_1 = __importDefault(require("./post.services"));
const sendRespone_1 = __importDefault(require("../../shared/sendRespone"));
const http_status_1 = __importDefault(require("http-status"));
const post_rate_my_plate = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield post_services_1.default.createRateMyPlatePost(req, req.user);
    (0, sendRespone_1.default)(res, {
        success: true,
        status: http_status_1.default.CREATED,
        message: "Successfully Uploded",
        data: result,
    });
}));
const find_all_RateMyPlatePost = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield post_services_1.default.find_all_RateMyPlatePostFromDb(req.user.id);
    (0, sendRespone_1.default)(res, {
        success: true,
        status: http_status_1.default.CREATED,
        message: "Successfully Find All Post Data",
        data: result,
    });
}));
const user_Behavior_Analysis_RateMyPlatePost = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield post_services_1.default.user_Behavior_Analysis_RateMyPlatePostFromDb(req.params.userId);
    (0, sendRespone_1.default)(res, {
        success: true,
        status: http_status_1.default.CREATED,
        message: "Successfully Find Behavior Analysis Report",
        data: result,
    });
}));
// const addedDammyData: RequestHandler = catchAsync(async (req, res) => {
//   const result = await RateMyPlateServices.addedDammyDataIntoDb(
//     req.body,
//     req.user
//   );
//   sendRespone(res, {
//     success: true,
//     status: httpStatus.CREATED,
//     message: "Successfully recorded",
//     data: result,
//   });
// });
const rating_record = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield post_services_1.default.rating_recordIntoDb(req.user, req.body);
    (0, sendRespone_1.default)(res, {
        success: true,
        status: http_status_1.default.OK,
        message: "Successfully recorded Rating",
        data: result,
    });
}));
const view_record = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield post_services_1.default.view_recordIntoDb(req.user, req.body);
    (0, sendRespone_1.default)(res, {
        success: true,
        status: http_status_1.default.OK,
        message: "Successfully recorded view",
        data: result,
    });
}));
const updateRateMyPlate = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield post_services_1.default.updateRateMyPlateIntoDb(req, req.user, req.params.id);
    (0, sendRespone_1.default)(res, {
        success: true,
        status: http_status_1.default.OK,
        message: "Successfully Update Recorded",
        data: result,
    });
}));
const RateMyPlateController = {
    post_rate_my_plate,
    find_all_RateMyPlatePost,
    rating_record,
    view_record,
    updateRateMyPlate,
    user_Behavior_Analysis_RateMyPlatePost
};
exports.default = RateMyPlateController;
