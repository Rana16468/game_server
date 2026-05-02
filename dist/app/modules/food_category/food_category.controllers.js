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
const food_category_services_1 = __importDefault(require("./food_category.services"));
const sendRespone_1 = __importDefault(require("../../shared/sendRespone"));
const http_status_1 = __importDefault(require("http-status"));
const commontypes_1 = require("../../shared/common/commontypes");
const ApiError_1 = __importDefault(require("../../error/ApiError"));
const pick_1 = __importDefault(require("../../shared/pick"));
const food_category_constant_1 = require("./food_category.constant");
const create_foodCategory = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield food_category_services_1.default.create_foodCategory_IntoDb(req.user, req.body);
    (0, sendRespone_1.default)(res, {
        success: true,
        status: http_status_1.default.CREATED,
        message: "Successfully create food category",
        data: result,
    });
}));
const findAllCategory = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const timePeriod = req.query.timePeriod;
    if (timePeriod && !commontypes_1.TimePeriodList.includes(timePeriod)) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Invalid time period. Must be one of: daily, weekly, monthly, yearly", "");
    }
    const filter = (0, pick_1.default)(req.query, food_category_constant_1.footcategoryFilterableFields);
    const option = (0, pick_1.default)(req.query, commontypes_1.FilterList);
    const result = yield food_category_services_1.default.findAllCategoryFromDb(filter, option);
    (0, sendRespone_1.default)(res, {
        success: true,
        status: http_status_1.default.OK,
        message: "Successfully Find All Category",
        data: result,
    });
}));
const find_specific_foodCategory = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield food_category_services_1.default.find_specific_foodCategoryFromDb(req.params.id);
    (0, sendRespone_1.default)(res, {
        success: true,
        status: http_status_1.default.OK,
        message: "Successfully find specific food  category",
        data: result,
    });
}));
const updateSpecificFoodCategory = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield food_category_services_1.default.updateSpecificFoodCategoryIntoDb(req.params.id, req.body, req.user);
    (0, sendRespone_1.default)(res, {
        success: true,
        status: http_status_1.default.OK,
        message: "Successfully update food  category",
        data: result,
    });
}));
const FoodCategoryController = {
    create_foodCategory,
    findAllCategory,
    find_specific_foodCategory,
    updateSpecificFoodCategory,
};
exports.default = FoodCategoryController;
