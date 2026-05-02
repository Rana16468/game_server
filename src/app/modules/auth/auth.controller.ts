import { RequestHandler } from "express";
import catchAsync from "../../shared/catchAsync";
import AuthServices from "./auth.services";
import sendRespone from "../../shared/sendRespone";
import httpStatus from "http-status";

const loginUser: RequestHandler = catchAsync(async (req, res) => {
  const { accessToken, refreshToken } = await AuthServices.loginUserIntoDb(
    req.body
  );

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

const refreshToken: RequestHandler = catchAsync(async (req, res) => {
  //https://www.npmjs.com/package/cookie-parser
  const { refreshToken } = req.cookies;
  const result = await AuthServices.refreshTokenIntoDb(refreshToken);
  sendRespone(res, {
    status: httpStatus.OK,
    success: true,
    message: "Refresh Token Get Successfully",
    data: result,
  });
});

const changePassword: RequestHandler = catchAsync(async (req, res) => {
  const result = await AuthServices.changePasswordIntoDb(req.user, req.body);
  sendRespone(res, {
    status: httpStatus.OK,
    success: true,
    message: "Successfully Change Password",
    data: result,
  });
});

const forgotPassword: RequestHandler = catchAsync(async (req, res) => {
  const result = await AuthServices.forgotPasswordFromDb(req.body);
  sendRespone(res, {
    status: httpStatus.OK,
    success: true,
    message: "Checked Your Email Box Or Spam ",
    data: result,
  });
});

const resetPassword: RequestHandler = catchAsync(async (req, res) => {
  const token = req.headers.authorization || "";
console.log('token')
  console.log(token);

  const result = await AuthServices.resetPasswordFromDb(token, req.body);
  sendRespone(res, {
    status: httpStatus.OK,
    success: true,
    message: "Reset Password Successfully Executed",
    data: result,
  });
});

const AuthController = {
  loginUser,
  refreshToken,
  changePassword,
  forgotPassword,
  resetPassword
};
export default AuthController;
