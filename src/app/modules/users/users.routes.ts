import express, { NextFunction, Request, Response } from "express";
import UsersController from "./users.controllers";
import validateRequest from "../../middleware/validateRequest";
import UserValidationSchema from "./users.validation";
import auth from "../../middleware/auth";
import { UserRole } from "@prisma/client";
import upload from "../../../utility/Image/storage";

const router = express.Router();

router.post(
  "/create_user_account",
  validateRequest(UserValidationSchema.UserSchema),
  UsersController.createUser
);
router.patch(
  "/chnage_profile_status/:userId",
  validateRequest(UserValidationSchema.ChangeProfileStatusSchema),
  auth(UserRole.ADMIN),
  UsersController.chnageProfileStatus
);
router.patch(
  "/user_varification",
  validateRequest(UserValidationSchema.UserVarificationSchema),
  UsersController.userVarificationStatusChange
);
router.patch(
  "/update-my-profile",
  auth(UserRole.ADMIN, UserRole.EMPLOYEE, UserRole.USER),
  upload.single("file"),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = JSON.parse(req.body.data);
    next();
  },
  validateRequest(UserValidationSchema.updateUserProfileSchema),
  UsersController.updateMyProfile
);

router.get(
  "/find_my_profile",
  auth(UserRole.ADMIN, UserRole.EMPLOYEE, UserRole.USER),
  UsersController.myProfile
);
router.get(
  "/find_all_users",
  auth(UserRole.ADMIN, UserRole.EMPLOYEE),
  UsersController.findAllUser
);
router.post(
  "/social_medial_login",
  validateRequest(UserValidationSchema.UserSchema),
  UsersController.socialMediaLogin
);
const UsersRoutes = router;
export default UsersRoutes;
