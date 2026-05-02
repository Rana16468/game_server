import { RequestHandler } from "express";
import catchAsync from "../../shared/catchAsync";
import FootCategoryServices from "./food_category.services";
import sendRespone from "../../shared/sendRespone";
import httpStatus from "http-status";
import {
  FilterList,
  TimePeriod,
  TimePeriodList,
} from "../../shared/common/commontypes";
import ApiError from "../../error/ApiError";
import pick from "../../shared/pick";
import { TFootCategoryFilterRequest } from "./food_category.interface";
import { footcategoryFilterableFields } from "./food_category.constant";

const create_foodCategory: RequestHandler = catchAsync(async (req, res) => {
  const result = await FootCategoryServices.create_foodCategory_IntoDb(
    req.user,
    req.body
  );
  sendRespone(res, {
    success: true,
    status: httpStatus.CREATED,
    message: "Successfully create food category",
    data: result,
  });
});

const findAllCategory: RequestHandler = catchAsync(async (req, res) => {
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
    footcategoryFilterableFields
  ) as Partial<TFootCategoryFilterRequest>;

  const option = pick(req.query, FilterList);

  const result = await FootCategoryServices.findAllCategoryFromDb(
    filter as TFootCategoryFilterRequest,
    option
  );

  sendRespone(res, {
    success: true,
    status: httpStatus.OK,
    message: "Successfully Find All Category",
    data: result,
  });
});

const find_specific_foodCategory: RequestHandler = catchAsync(
  async (req, res) => {
    const result = await FootCategoryServices.find_specific_foodCategoryFromDb(
      req.params.id
    );
    sendRespone(res, {
      success: true,
      status: httpStatus.OK,
      message: "Successfully find specific food  category",
      data: result,
    });
  }
);

const updateSpecificFoodCategory: RequestHandler = catchAsync(
  async (req, res) => {
    const result = await FootCategoryServices.updateSpecificFoodCategoryIntoDb(
      req.params.id,
      req.body,
      req.user
    );
    sendRespone(res, {
      success: true,
      status: httpStatus.OK,
      message: "Successfully update food  category",
      data: result,
    });
  }
);

const FoodCategoryController = {
  create_foodCategory,
  findAllCategory,
  find_specific_foodCategory,
  updateSpecificFoodCategory,
};
export default FoodCategoryController;
