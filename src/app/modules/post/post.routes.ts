import express, { NextFunction, Request, Response } from "express";
import auth from "../../middleware/auth";
import { UserRole } from "@prisma/client";
import upload from "../../../utility/Image/storage";
import validateRequest from "../../middleware/validateRequest";
import RateMyPlateValidation from "./post.validation";
import RateMyPlateController from "./post.controllers";

const router = express.Router();
router.post(
  "/post_rate_my_plate",
  auth(UserRole.USER),
  upload.array("file"),
  (req: Request, res: Response, next: NextFunction) => {

    req.body = JSON.parse(req.body.data);
    console.log(req.body.data);

    next();
  },
  validateRequest(RateMyPlateValidation.RateMyPlateSchema),
  RateMyPlateController.post_rate_my_plate
);

router.get("/find_all_post", auth(UserRole.USER), RateMyPlateController.find_all_RateMyPlatePost);
//user_Behavior_Analysis_RateMyPlatePost
router.get("/find_user_behavior/:userId",RateMyPlateController.user_Behavior_Analysis_RateMyPlatePost);
// router.post(
//   "/dummy_data",
//   auth(UserRole.USER),
//   validateRequest(RateMyPlateValidation.DummyRateMyPlateSchema),
//   RateMyPlateController.addedDammyData
// );
router.patch(
  "/store_rating",
  auth(UserRole.USER),
  validateRequest(RateMyPlateValidation.RatingSchema),
  RateMyPlateController.rating_record
);
router.patch(
  "/store_view",
  auth(UserRole.USER),
  validateRequest(RateMyPlateValidation.ViewSchema),
  RateMyPlateController.view_record
);
router.patch(
  "/update_rate_my_plate/:id",
  auth(UserRole.ADMIN, UserRole.EMPLOYEE, UserRole.USER),
  upload.array("file"),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = JSON.parse(req.body.data);
    next();
  },
  validateRequest(RateMyPlateValidation.UpdateRateMyPlateSchema),
  RateMyPlateController.updateRateMyPlate
);
const PostsRoutes = router;
export default PostsRoutes;
