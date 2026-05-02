import { Contact } from "@prisma/client";
import prisma from "../../shared/prisma";
import { AppError } from "../../middleware/golobalErrorHnadelar";
import httpStatus from "http-status";

// import sendEmail from "../../../utility/Email/sendEmail";
import sendMessage from "../../../utility/Message/sendMessage";


const ContactIntoDb = async (payload: Contact) => {
  try {
    const result = await prisma.contact.create({
      data: payload,
    });
    return result;
  } catch (error: any) {
    throw new AppError(
      httpStatus.NOT_ACCEPTABLE,
      "Not Acceptable this contract data",
      error?.message
    );
  }
};

const FindAllContractListFromDb = async () => {
  try {
    const result = await prisma.contact.findMany({});
    return result;
  } catch (error: any) {
    throw new AppError(
      httpStatus.NOT_ACCEPTABLE,
      "Not Acceptable this contract data",
      error?.message
    );
  }
};


const DeleteContactFromDb = async (id: number) => {
  try {
    const deleteResult = await prisma.contact.delete({
      where: {
        id: id,
      },
    });
    if (deleteResult) {
      return {
        deleteId: deleteResult?.id,
        message: "server site data delete successfully",
      };
    }
  } catch (error: any) {
    throw new AppError(
      httpStatus.NOT_ACCEPTABLE,
      "Not Acceptable this contract data",
      error?.message
    );
  }
};

const SendSMS=async()=>{

  console.log("Sohel")

  const phoneNumber = "+8801722305054"; // Replace with a real phone number
const carrier = "grameenphone"; // Supported carriers: att, verizon, tmobile, sprint
const message = "Hello, this is a test SMS from my Node.js app! My Name Sohel";

//  sendEmail('amsr215019@gmail.com',{
//   html:"the quick Box Jumps Over the Lazy Dog",
//   subject:"Auth",
//   text:"10 min "
//  })

    sendMessage(phoneNumber, carrier, message);

  return "Successfully Send SMS"

}

export const ContactService = {
  ContactIntoDb,
  FindAllContractListFromDb,
  DeleteContactFromDb,
  SendSMS
};
