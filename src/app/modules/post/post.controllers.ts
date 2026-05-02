import { RequestHandler } from "express";
import catchAsync from "../../shared/catchAsync";
import RateMyPlateServices from "./post.services";
import sendRespone from "../../shared/sendRespone";
import httpStatus from "http-status";

const post_rate_my_plate: RequestHandler = catchAsync(async (req, res) => {
  const result = await RateMyPlateServices.createRateMyPlatePost(req, req.user);
  sendRespone(res, {
    success: true,
    status: httpStatus.CREATED,
    message: "Successfully Uploded",
    data: result,
  });
});

const find_all_RateMyPlatePost: RequestHandler = catchAsync(
  async (req, res) => {
    const result = await RateMyPlateServices.find_all_RateMyPlatePostFromDb(req.user.id);
    sendRespone(res, {
      success: true,
      status: httpStatus.CREATED,
      message: "Successfully Find All Post Data",
      data: result,
    });
  }
);

const user_Behavior_Analysis_RateMyPlatePost:RequestHandler=catchAsync(async(req,res)=>{

  const result=await RateMyPlateServices.user_Behavior_Analysis_RateMyPlatePostFromDb(req.params.userId);
  sendRespone(res, {
    success: true,
    status: httpStatus.CREATED,
    message: "Successfully Find Behavior Analysis Report",
    data: result,
  });

});

// const addedDammyData: RequestHandler = catchAsync(async (req, res) => {
//   const result = await RateMyPlateServices.addedDammyDataIntoDb(
//     req.body,
//     req.user
//   );
//   sendRespone(res, {
//     success: true,
//     status: httpStatus.CREATED,
//     message: "Successfully recorded",
//     data: result,
//   });
// });

const rating_record: RequestHandler = catchAsync(async (req, res) => {
  const result = await RateMyPlateServices.rating_recordIntoDb(
    req.user,
    req.body
  );
  sendRespone(res, {
    success: true,
    status: httpStatus.OK,
    message: "Successfully recorded Rating",
    data: result,
  });
});

const  view_record:RequestHandler=catchAsync(async(req,res)=>{

  const result=await RateMyPlateServices.view_recordIntoDb(req.user,req.body);
  sendRespone(res, {
    success: true,
    status: httpStatus.OK,
    message: "Successfully recorded view",
    data: result,
  });
});

const updateRateMyPlate:RequestHandler=catchAsync(async(req,res)=>{
  
   const result=await RateMyPlateServices.updateRateMyPlateIntoDb(req,req.user,req.params.id);
   sendRespone(res, {
    success: true,
    status: httpStatus.OK,
    message: "Successfully Update Recorded",
    data: result,
  });

});

const RateMyPlateController = {
  post_rate_my_plate,
  find_all_RateMyPlatePost,
  rating_record,
  view_record,
  updateRateMyPlate,
  user_Behavior_Analysis_RateMyPlatePost
};
export default RateMyPlateController;
