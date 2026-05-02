import { RequestHandler } from "express";
import catchAsync from "../../shared/catchAsync";
import UsersServices from "./users.services";
import sendRespone from "../../shared/sendRespone";
import httpStatus from "http-status";
import { userFilterableFields } from "./users.constant";
import ApiError from "../../error/ApiError";
import pick from "../../shared/pick";
import { TUserFilterRequest } from "./users.interface";
import {
  FilterList,
  TimePeriod,
  TimePeriodList,
} from "../../shared/common/commontypes";

const createUser: RequestHandler = catchAsync(async (req, res) => {
  const result = await UsersServices.createUserIntoDb(req.body);
  sendRespone(res, {
    success: true,
    status: httpStatus.CREATED,
    message: "Checked Your Email Box Or Spam",
    data: result,
  });
});

const chnageProfileStatus: RequestHandler = catchAsync(async (req, res) => {
  const result = await UsersServices.chnageProfileStatusFromDb(
    req.body,
    req.params.userId,
    req.user.id
  );
  sendRespone(res, {
    success: true,
    status: httpStatus.OK,
    message: "Successfully Change Profile Status",
    data: result,
  });
});

const userVarificationStatusChange: RequestHandler = catchAsync(
  async (req, res) => {
    const result = await UsersServices.userVarificationStatusChangeFromDb(
      req.body
    );
    sendRespone(res, {
      success: true,
      status: httpStatus.OK,
      message: "Successfully Varified",
      data: result,
    });
  }
);

const updateMyProfile: RequestHandler = catchAsync(async (req, res) => {
  const result = await UsersServices.updateMyProfileIntoDb(req.user, req);
  sendRespone(res, {
    success: true,
    status: httpStatus.OK,
    message: "Update My Profile Successfully",
    data: result,
  });
});

const myProfile: RequestHandler = catchAsync(async (req, res) => {
  const user = req.user;
  const result = await UsersServices.myProfileFromDb(user);
  sendRespone(res, {
    success: true,
    status: httpStatus.OK,
    message: "Successfully Find My Profile",
    data: result,
  });
});

const findAllUser: RequestHandler = catchAsync(async (req, res) => {
  const timePeriod = req.query.timePeriod as TimePeriod;
  if (timePeriod && !TimePeriodList.includes(timePeriod)) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Invalid time period. Must be one of: daily, weekly, monthly, yearly",
      ""
    );
  }
  const filter = pick(
    req.query,
    userFilterableFields
  ) as Partial<TUserFilterRequest>;
  const option = pick(req.query, FilterList);

  const result = await UsersServices.findAllUserFromDb(
    filter as TUserFilterRequest,
    option
  );

  sendRespone(res, {
    success: true,
    status: httpStatus.OK,
    message: "Successfully Find All Monitoring",
    data: result,
  });
});

const socialMediaLogin: RequestHandler = catchAsync(async (req, res) => {
  const { accessToken, refreshToken } =
    await UsersServices.socialMediaLoginIntoDb(req.body);

  res.cookie("refreshToken", refreshToken, {
    secure: false,
    httpOnly: true,
  });

  sendRespone(res, {
    status: httpStatus.OK,
    success: true,
    message: "login successfull",
    data: {
      accessToken,
    },
  });
});

const UsersController = {
  createUser,
  chnageProfileStatus,
  userVarificationStatusChange,
  updateMyProfile,
  myProfile,
  findAllUser,
  socialMediaLogin,
};
export default UsersController;
