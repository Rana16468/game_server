import { UserRole, UserStatus } from "@prisma/client";
import prisma from "../prisma";
import { AppError } from "../../middleware/golobalErrorHnadelar";
import httpStatus from "http-status";

const CheckedUser = async (payload: { id: string; role: UserRole }) => {
  try {
    const isExist = await prisma.user.findFirstOrThrow({
      where: {
        AND: [
          {
            id: payload.id,
            isVerified: true,
            status: UserStatus.ACTIVE,
            role: payload.role,
          },
        ],
      },
      select: {
        isVerified: true,
      },
    });
    return isExist;
  } catch (error: any) {
    throw new AppError(
      httpStatus.SERVICE_UNAVAILABLE,
      "Checked User Exist Issues",
      error
    );
  }
};

export default CheckedUser;
