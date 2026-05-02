import express from "express";
import UserMonitoringController from "./monitoring.controllers";
import validateRequest from "../../middleware/validateRequest";
import Recorded_Monitoring_Validation from "./monitoring.validation";

const router = express.Router();
router.patch(
  "/recorded_monitoring",
  validateRequest(Recorded_Monitoring_Validation.recorded_monitoring_schema),
  UserMonitoringController.recordedUserActivity
);

router.get(
  "/find_all_monitoring",
  UserMonitoringController.allrecordedUserActivity
);

router.get(
  "/find_specific_monitoring/:id",
  UserMonitoringController.findSpecificRecord
);
router.patch(
  "/update_monitoring/:id",
  validateRequest(Recorded_Monitoring_Validation.update_monitoring_schema),
  UserMonitoringController.updateMonitoringRecord
);

router.delete("/delete_multiple_monitoring",validateRequest(Recorded_Monitoring_Validation.delete_multiple_monitoring_schema),UserMonitoringController.deleteMultipleMonitoringRecords)

const UserMonitoringRoutes = router;
export default UserMonitoringRoutes;
