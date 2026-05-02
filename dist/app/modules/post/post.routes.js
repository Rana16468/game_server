"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middleware/auth"));
const client_1 = require("@prisma/client");
const storage_1 = __importDefault(require("../../../utility/Image/storage"));
const validateRequest_1 = __importDefault(require("../../middleware/validateRequest"));
const post_validation_1 = __importDefault(require("./post.validation"));
const post_controllers_1 = __importDefault(require("./post.controllers"));
const router = express_1.default.Router();
router.post("/post_rate_my_plate", (0, auth_1.default)(client_1.UserRole.USER), storage_1.default.array("file"), (req, res, next) => {
    req.body = JSON.parse(req.body.data);
    console.log(req.body.data);
    next();
}, (0, validateRequest_1.default)(post_validation_1.default.RateMyPlateSchema), post_controllers_1.default.post_rate_my_plate);
router.get("/find_all_post", (0, auth_1.default)(client_1.UserRole.USER), post_controllers_1.default.find_all_RateMyPlatePost);
//user_Behavior_Analysis_RateMyPlatePost
router.get("/find_user_behavior/:userId", post_controllers_1.default.user_Behavior_Analysis_RateMyPlatePost);
// router.post(
//   "/dummy_data",
//   auth(UserRole.USER),
//   validateRequest(RateMyPlateValidation.DummyRateMyPlateSchema),
//   RateMyPlateController.addedDammyData
// );
router.patch("/store_rating", (0, auth_1.default)(client_1.UserRole.USER), (0, validateRequest_1.default)(post_validation_1.default.RatingSchema), post_controllers_1.default.rating_record);
router.patch("/store_view", (0, auth_1.default)(client_1.UserRole.USER), (0, validateRequest_1.default)(post_validation_1.default.ViewSchema), post_controllers_1.default.view_record);
router.patch("/update_rate_my_plate/:id", (0, auth_1.default)(client_1.UserRole.ADMIN, client_1.UserRole.EMPLOYEE, client_1.UserRole.USER), storage_1.default.array("file"), (req, res, next) => {
    req.body = JSON.parse(req.body.data);
    next();
}, (0, validateRequest_1.default)(post_validation_1.default.UpdateRateMyPlateSchema), post_controllers_1.default.updateRateMyPlate);
const PostsRoutes = router;
exports.default = PostsRoutes;
