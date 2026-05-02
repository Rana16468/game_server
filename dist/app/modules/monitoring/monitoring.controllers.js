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
const catchAsync_1 = __importDefault(require("../../shared/catchAsync"));
const sendRespone_1 = __importDefault(require("../../shared/sendRespone"));
const monitoring_services_1 = __importDefault(require("./monitoring.services"));
const pick_1 = __importDefault(require("../../shared/pick"));
const monitoring_constant_1 = require("./monitoring.constant");
const ApiError_1 = __importDefault(require("../../error/ApiError"));
const recordedUserActivity = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = req.body;
    const result = yield monitoring_services_1.default.recordedUserActivityIntoDb(data);
    (0, sendRespone_1.default)(res, {
        success: true,
        status: http_status_1.default.OK,
        message: "Successfully Recorded",
        data: result,
    });
}));
const allrecordedUserActivity = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const timePeriod = req.query.timePeriod;
    if (timePeriod && !monitoring_constant_1.TimePeriodList.includes(timePeriod)) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Invalid time period. Must be one of: daily, weekly, monthly, yearly", "");
    }
    const filter = (0, pick_1.default)(req.query, monitoring_constant_1.monitoringFilterableFields);
    const option = (0, pick_1.default)(req.query, monitoring_constant_1.FilterList);
    const result = yield monitoring_services_1.default.allrecordedUserActivity_FromDb(filter, option);
    (0, sendRespone_1.default)(res, {
        success: true,
        status: http_status_1.default.OK,
        message: "Successfully Find All Monitoring",
        data: result,
    });
}));
const findSpecificRecord = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield monitoring_services_1.default.findSpecificRecordFromDb(req.params.id);
    (0, sendRespone_1.default)(res, {
        success: true,
        status: http_status_1.default.OK,
        message: "Successfully Find Specific Monitoring Data",
        data: result,
    });
}));
const updateMonitoringRecord = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield monitoring_services_1.default.updateMonitoringRecordFromDb(req.params.id, req.body);
    (0, sendRespone_1.default)(res, {
        success: true,
        status: http_status_1.default.OK,
        message: "Successfully  Update Monitoring Info",
        data: result,
    });
}));
const deleteMultipleMonitoringRecords = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield monitoring_services_1.default.deleteMultipleMonitoringRecordsFromDb(req.body.ids);
    (0, sendRespone_1.default)(res, {
        success: true,
        status: http_status_1.default.OK,
        message: "Successfully Delete",
        data: result,
    });
}));
const UserMonitoringController = {
    recordedUserActivity,
    allrecordedUserActivity,
    findSpecificRecord,
    updateMonitoringRecord,
    deleteMultipleMonitoringRecords
};
exports.default = UserMonitoringController;
