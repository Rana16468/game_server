"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const users_controllers_1 = __importDefault(require("./users.controllers"));
const validateRequest_1 = __importDefault(require("../../middleware/validateRequest"));
const users_validation_1 = __importDefault(require("./users.validation"));
const auth_1 = __importDefault(require("../../middleware/auth"));
const client_1 = require("@prisma/client");
const storage_1 = __importDefault(require("../../../utility/Image/storage"));
const router = express_1.default.Router();
router.post("/create_user_account", (0, validateRequest_1.default)(users_validation_1.default.UserSchema), users_controllers_1.default.createUser);
router.patch("/chnage_profile_status/:userId", (0, validateRequest_1.default)(users_validation_1.default.ChangeProfileStatusSchema), (0, auth_1.default)(client_1.UserRole.ADMIN), users_controllers_1.default.chnageProfileStatus);
router.patch("/user_varification", (0, validateRequest_1.default)(users_validation_1.default.UserVarificationSchema), users_controllers_1.default.userVarificationStatusChange);
router.patch("/update-my-profile", (0, auth_1.default)(client_1.UserRole.ADMIN, client_1.UserRole.EMPLOYEE, client_1.UserRole.USER), storage_1.default.single("file"), (req, res, next) => {
    req.body = JSON.parse(req.body.data);
    next();
}, (0, validateRequest_1.default)(users_validation_1.default.updateUserProfileSchema), users_controllers_1.default.updateMyProfile);
router.get("/find_my_profile", (0, auth_1.default)(client_1.UserRole.ADMIN, client_1.UserRole.EMPLOYEE, client_1.UserRole.USER), users_controllers_1.default.myProfile);
router.get("/find_all_users", (0, auth_1.default)(client_1.UserRole.ADMIN, client_1.UserRole.EMPLOYEE), users_controllers_1.default.findAllUser);
router.post("/social_medial_login", (0, validateRequest_1.default)(users_validation_1.default.UserSchema), users_controllers_1.default.socialMediaLogin);
const UsersRoutes = router;
exports.default = UsersRoutes;
