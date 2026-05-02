import nodemailer from "nodemailer";
import config from "../../app/config";
import { AppError } from "../../app/middleware/golobalErrorHnadelar";
import httpStatus from "http-status";

const carrierGateways = {
  att: "txt.att.net",
  verizon: "vtext.com",
  tmobile: "tmomail.net",
  sprint: "messaging.sprintpcs.com",
  grameenphone: "gptexter.com",
  banglalink: "banglalinksms.com",
  robi: "robi-sms.com",
  teletalk: "teletalksms.com",
};
type CarrierKey = keyof typeof carrierGateways;

const sendMessage = async (
  phoneNumber: string,
  carrier: CarrierKey,
  message: string
) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: config.email_sender.email,
      pass: config.email_sender.app_password,
    },
  });


  if (!carrierGateways[carrier]) {
    console.error("Carrier not supported.");
    return;
  }

  const to = `${phoneNumber}@${carrierGateways[carrier]}`;

  const mailOptions = {
    from: config.email_sender.email,
    to,
    subject: "SMS Notification", // Required for some carriers
    text: message,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error: any) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, 'SMS Sending Engine Issues', error?.message)
  }
};

export default sendMessage;