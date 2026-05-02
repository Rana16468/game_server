import httpStatus from "http-status";
import prisma from "../../app/shared/prisma";
import { AppError } from "../../app/middleware/golobalErrorHnadelar";

const UnAuthUser = async (): Promise<void> => {
  try {
    await prisma.user.deleteMany({
      where: { isVerified: false },
    });
  } catch (error: any) {
    throw new AppError(
      httpStatus.SERVICE_UNAVAILABLE,
      "Unauthorized User Server Issues",
      error
    );
  } finally {
    await prisma.$disconnect();
  }
};

export default UnAuthUser;
