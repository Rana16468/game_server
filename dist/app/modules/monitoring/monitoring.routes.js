"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const monitoring_controllers_1 = __importDefault(require("./monitoring.controllers"));
const validateRequest_1 = __importDefault(require("../../middleware/validateRequest"));
const monitoring_validation_1 = __importDefault(require("./monitoring.validation"));
const router = express_1.default.Router();
router.patch("/recorded_monitoring", (0, validateRequest_1.default)(monitoring_validation_1.default.recorded_monitoring_schema), monitoring_controllers_1.default.recordedUserActivity);
router.get("/find_all_monitoring", monitoring_controllers_1.default.allrecordedUserActivity);
router.get("/find_specific_monitoring/:id", monitoring_controllers_1.default.findSpecificRecord);
router.patch("/update_monitoring/:id", (0, validateRequest_1.default)(monitoring_validation_1.default.update_monitoring_schema), monitoring_controllers_1.default.updateMonitoringRecord);
router.delete("/delete_multiple_monitoring", (0, validateRequest_1.default)(monitoring_validation_1.default.delete_multiple_monitoring_schema), monitoring_controllers_1.default.deleteMultipleMonitoringRecords);
const UserMonitoringRoutes = router;
exports.default = UserMonitoringRoutes;
