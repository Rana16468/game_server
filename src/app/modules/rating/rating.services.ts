import httpStatus from "http-status";
import { AppError } from "../../middleware/golobalErrorHnadelar";
import prisma from "../../shared/prisma";

const find_all_ratingFromDb = async () => {
  return await prisma.view
    .findMany({})
    .then((result) => result)
    .catch((error) => {
      throw new AppError(
        httpStatus.SERVICE_UNAVAILABLE,
        "Error find All Rating Issues server issues",
        error
      );
    });
};

const RatingServices = {
  find_all_ratingFromDb,
};
export default RatingServices;
