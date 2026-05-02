import express from "express";
import validateRequest from "../../middleware/validateRequest";
import AuthValidationSchema from "./auth.validation";
import AuthController from "./auth.controller";
import auth from "../../middleware/auth";
import { UserRole } from "@prisma/client";

const router = express.Router();

router.post(
  "/login",
  validateRequest(AuthValidationSchema.userLoginSchema),
  AuthController.loginUser
);
router.post("/refresh_token", AuthController.refreshToken);
router.post(
  "/change_password",
  auth(UserRole.ADMIN, UserRole.EMPLOYEE, UserRole.USER),
  validateRequest(AuthValidationSchema.changePasswordSchema),
  AuthController.changePassword
);
router.post(
  "/forgot_password",
  validateRequest(AuthValidationSchema.forgotPasswordSchema),
  AuthController.forgotPassword
);
router.post(
  "/reset_password",
  validateRequest(AuthValidationSchema.resetPasswordSchema),
  AuthController.resetPassword
);

const AuthRoutes = router;
export default AuthRoutes;
