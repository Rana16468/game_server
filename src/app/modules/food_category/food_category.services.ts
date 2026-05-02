import { FoodCategory, Prisma } from "@prisma/client";
import { JwtPayload } from "jsonwebtoken";
import prisma from "../../shared/prisma";
import { AppError } from "../../middleware/golobalErrorHnadelar";
import httpStatus from "http-status";
import { TimePeriod } from "../../shared/common/commontypes";
import { IPaginationOptions } from "../../interfaces/pagination";
import calculatePagination from "../../helper/paginationHelper";
import getDateRangeForPeriod from "../../../utility/DateRange/getDateRangeForPeriod";
import ApiError from "../../error/ApiError";
import CheckedUser from "../../shared/CheckedUser/CheckedUser";
import NodeCache from "node-cache";
import { TFootCategoryFilterRequest } from "../food_category/food_category.interface";
import { footcategorySearchableFields } from "../food_category/food_category.constant";

const cache = new NodeCache({ stdTTL: 600, checkperiod: 120 });

const create_foodCategory_IntoDb = async (
  user: JwtPayload,
  payload: FoodCategory
) => {
  try {
    const result = await prisma.foodCategory.create({
      data: { userId: user.id, categorieName: payload.categorieName },
      select: {
        id: true,
      },
    });
    cache.del("all_food_categories");
    return result ? { message: "successfully recorded category" } : null;
  } catch (error: any) {
    throw new AppError(
      httpStatus.SERVICE_UNAVAILABLE,
      "food category recorded section server issues",
      error
    );
  }
};

const findAllCategoryFromDb = async (
  filters: TFootCategoryFilterRequest & { timePeriod?: TimePeriod },
  options: IPaginationOptions
) => {
  const cachedData = cache.get("all_food_categories");
  if (cachedData) return cachedData;

  const { limit, page, skip } = calculatePagination(options);
  const { searchTerm, timePeriod, ...filterData } = filters;
  const andConditions: Prisma.FoodCategoryWhereInput[] = [];

  if (searchTerm) {
    andConditions.push({
      OR: footcategorySearchableFields?.map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  if (timePeriod) {
    const dateRange = getDateRangeForPeriod(timePeriod);
    andConditions.push({
      updatedAt: dateRange,
    });
  }

  if (Object.keys(filterData).length > 0) {
    const filterConditions = Object.keys(filterData).map((key) => ({
      [key]: {
        equals: (filterData as any)[key],
      },
    }));
    andConditions.push(...filterConditions);
  }
  const whereConditions: Prisma.FoodCategoryWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  try {
    const [result, total] = await Promise.all([
      prisma.foodCategory.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy:
          options.sortBy && options.orderBy
            ? { [options.sortBy]: options.orderBy }
            : { updatedAt: "desc" },
        include: {
          posts: true,
          user: true,
        },
      }),
      prisma.foodCategory.count({
        where: whereConditions,
      }),
    ]);

    const response = {
      meta: {
        total,
        page,
        limit,
      },
      data: result,
    };

    cache.set("all_food_categories", response);
    return response;
  } catch (error: any) {
    throw new ApiError(
      httpStatus.SERVICE_UNAVAILABLE,
      "All food category activity issues",
      error
    );
  }
};

const find_specific_foodCategoryFromDb = async (id: string) => {
  const cachedData = cache.get(`food_category_${id}`);
  if (cachedData) return cachedData;

  try {
    const result = await prisma.foodCategory.findUniqueOrThrow({
      where: { id },
      include: {
        user: {
          select: {
            username: true,
            email: true,
            phonenumber: true,
            photo: true,
          },
        },
      },
    });
    cache.set(`food_category_${id}`, result);
    return result;
  } catch (error: any) {
    throw new ApiError(
      httpStatus.SERVICE_UNAVAILABLE,
      "specific food category activity issues",
      error
    );
  }
};

const updateSpecificFoodCategoryIntoDb = async (
  id: string | undefined,
  payload: FoodCategory,
  user: JwtPayload
) => {
  const isAdmin = await CheckedUser({ id: user.id, role: user.role });
  if (!isAdmin.isVerified) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "only admin can be accessible",
      ""
    );
  }

  const isCategoryExist = await prisma.foodCategory.findUniqueOrThrow({
    where: {
      id,
      categorieName: payload.categorieName,
    },
    select: {
      updatedAt: true,
    },
  });

  if (!isCategoryExist) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "this category not accepted by Rate My Plate server",
      ""
    );
  }

  try {
    const result = await prisma.foodCategory.update({
      where: {
        id,
      },
      data: payload,
      select: {
        updatedAt: true,
      },
    });
    cache.del("all_food_categories");
    cache.del(`food_category_${id}`);
    return result ? { message: "update recorded in the server" } : null;
  } catch (error: any) {
    throw new ApiError(
      httpStatus.SERVICE_UNAVAILABLE,
      "update food category activity issues",
      error
    );
  }
};

const FootCategoryServices = {
  create_foodCategory_IntoDb,
  findAllCategoryFromDb,
  find_specific_foodCategoryFromDb,
  updateSpecificFoodCategoryIntoDb,
};

export default FootCategoryServices;
