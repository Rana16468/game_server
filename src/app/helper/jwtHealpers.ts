import { ERROR_CODES } from "./../middleware/errorcode.constant";
import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import { AppError } from "../middleware/golobalErrorHnadelar";
import httpStatus from "http-status";

const generateToken = (
  payload: { email: string | undefined; role: string | undefined; id: string | undefined },
  srcret: string,
  expiresIn: string
) => {
  try {
    const token = jwt.sign(payload, srcret, { algorithm: "HS256", expiresIn });
    return token;
  } catch (error: any) {
    throw new AppError(
      httpStatus.NOT_ACCEPTABLE,
      "Generate Token is Not Acceptable",
      error?.message
    );
  }
};

const varifyToken = (token: string, refeesh_srcret: Secret) => {
  try {
    return jwt.verify(token, refeesh_srcret) as JwtPayload;
  } catch (error: any) {
    throw new AppError(
      httpStatus.NOT_ACCEPTABLE,
      "Varify Token is Not Acceptable",
      error?.message
    );
  }
};

export const jwtHalpers = {
  generateToken,
  varifyToken,
};
