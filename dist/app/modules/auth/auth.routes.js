"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const validateRequest_1 = __importDefault(require("../../middleware/validateRequest"));
const auth_validation_1 = __importDefault(require("./auth.validation"));
const auth_controller_1 = __importDefault(require("./auth.controller"));
const auth_1 = __importDefault(require("../../middleware/auth"));
const client_1 = require("@prisma/client");
const router = express_1.default.Router();
router.post("/login", (0, validateRequest_1.default)(auth_validation_1.default.userLoginSchema), auth_controller_1.default.loginUser);
router.post("/refresh_token", auth_controller_1.default.refreshToken);
router.post("/change_password", (0, auth_1.default)(client_1.UserRole.ADMIN, client_1.UserRole.EMPLOYEE, client_1.UserRole.USER), (0, validateRequest_1.default)(auth_validation_1.default.changePasswordSchema), auth_controller_1.default.changePassword);
router.post("/forgot_password", (0, validateRequest_1.default)(auth_validation_1.default.forgotPasswordSchema), auth_controller_1.default.forgotPassword);
router.post("/reset_password", (0, validateRequest_1.default)(auth_validation_1.default.resetPasswordSchema), auth_controller_1.default.resetPassword);
const AuthRoutes = router;
exports.default = AuthRoutes;
