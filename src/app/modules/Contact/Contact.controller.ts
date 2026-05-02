import httpStatus from "http-status";
import catchAsync from "../../shared/catchAsync";
import sendRespone from "../../shared/sendRespone";
import { ContactService } from "./Contact.services";

const Contact = catchAsync(async (req, res) => {
  const result = await ContactService.ContactIntoDb(req.body);
  sendRespone(res, {
    success: true,
    status: httpStatus.CREATED,
    message: "Create successfully Profile",
    data: result,
  });
});

const FindAllContractList=catchAsync(async(req,res)=>{
    const result=await ContactService.FindAllContractListFromDb();
    sendRespone(res, {
        success: true,
        status: httpStatus.OK,
        message: "Successfully Find All Contact List",
        data: result,
      });

});

const DeleteContact=catchAsync(async(req,res)=>{

    const result=await ContactService.DeleteContactFromDb(Number(req.params.id));
    sendRespone(res, {
        success: true,
        status: httpStatus.OK,
        message: "Successfully Delete Contact Information",
        data: result,
      });

});

const SendSMS=catchAsync((async(req,res)=>{
  const result=await ContactService.SendSMS();
  sendRespone(res, {
    success: true,
    status: httpStatus.OK,
    message: "Successfully Send SMS",
    data: result,
  });
}))

export const ContactController = {
  Contact,
  FindAllContractList,
  DeleteContact,
  SendSMS
};
