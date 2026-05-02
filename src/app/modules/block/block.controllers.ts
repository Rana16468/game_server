import { RequestHandler } from "express";
import catchAsync from "../../shared/catchAsync";
import BlockServices from "./block.services";
import sendRespone from "../../shared/sendRespone";
import httpStatus from "http-status";



const createBlock:RequestHandler=catchAsync(async(req,res)=>{

     const result=await BlockServices.createBlockIntoDb();
     sendRespone(res, {
        success: true,
        status: httpStatus.CREATED,
        message: "Successfully Your Block Plate Recorded",
        data: result,
      });

});

const BlockController={
    createBlock
}
export default BlockController;
