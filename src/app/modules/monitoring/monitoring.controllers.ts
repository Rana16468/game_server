import httpStatus from "http-status";
import catchAsync from "../../shared/catchAsync";
import sendRespone from "../../shared/sendRespone";
import UserMonitoringServices from "./monitoring.services";
import pick from "../../shared/pick";
import {
  FilterList,
  monitoringFilterableFields,
  TimePeriod,
  TimePeriodList,
} from "./monitoring.constant";
import { TMonitoringFilterRequest } from "./monitoring.interface";
import ApiError from "../../error/ApiError";
import { RequestHandler } from "express";

const recordedUserActivity: RequestHandler = catchAsync(async (req, res) => {
  const data = req.body;
  const result = await UserMonitoringServices.recordedUserActivityIntoDb(data);
  sendRespone(res, {
    success: true,
    status: httpStatus.OK,
    message: "Successfully Recorded",
    data: result,
  });
});

const allrecordedUserActivity: RequestHandler = catchAsync(async (req, res) => {
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
    monitoringFilterableFields
  ) as Partial<TMonitoringFilterRequest>;
  const option = pick(req.query, FilterList);

  const result = await UserMonitoringServices.allrecordedUserActivity_FromDb(
    filter as TMonitoringFilterRequest,
    option
  );

  sendRespone(res, {
    success: true,
    status: httpStatus.OK,
    message: "Successfully Find All Monitoring",
    data: result,
  });
});

const findSpecificRecord: RequestHandler = catchAsync(async (req, res) => {
  const result = await UserMonitoringServices.findSpecificRecordFromDb(
    req.params.id
  );
  sendRespone(res, {
    success: true,
    status: httpStatus.OK,
    message: "Successfully Find Specific Monitoring Data",
    data: result,
  });
});

const updateMonitoringRecord: RequestHandler = catchAsync(async (req, res) => {
  const result = await UserMonitoringServices.updateMonitoringRecordFromDb(
    req.params.id,
    req.body
  );
  sendRespone(res, {
    success: true,
    status: httpStatus.OK,
    message: "Successfully  Update Monitoring Info",
    data: result,
  });
});

const  deleteMultipleMonitoringRecords:RequestHandler=catchAsync(async(req,res)=>{
  const result=await UserMonitoringServices.deleteMultipleMonitoringRecordsFromDb(req.body.ids);
  sendRespone(res, {
    success: true,
    status: httpStatus.OK,
    message: "Successfully Delete",
    data: result,
  });
});

const UserMonitoringController = {
  recordedUserActivity,
  allrecordedUserActivity,
  findSpecificRecord,
  updateMonitoringRecord,
  deleteMultipleMonitoringRecords
};
export default UserMonitoringController;
