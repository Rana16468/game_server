import { RequestHandler } from "express";
import catchAsync from "../../shared/catchAsync";
import RatingServices from "./rating.services";
import sendRespone from "../../shared/sendRespone";
import httpStatus from "http-status";



const find_all_rating:RequestHandler=catchAsync(async(req,res)=>{

    const result=await RatingServices.find_all_ratingFromDb();
    sendRespone(res, {
        success: true,
        status: httpStatus.OK,
        message: "Successfully Find All Rating",
        data: result,
      });

});

const RatingController={
    find_all_rating
}
export default RatingController;
