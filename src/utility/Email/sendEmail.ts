import nodemailer from "nodemailer";
import config from "../../app/config";
import ApiError from "../../app/error/ApiError";
import httpStatus from "http-status";

const sendEmail = async (
  to: string,
  senddata: { html: string; subject: string; text: string }
) => {

  

  try {
    const senderEmail = config.email_sender.email as string;
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com.",
      port: 587,
      secure: config.NODE_ENV === "production",
      auth: {
        user: senderEmail,
        pass: config.email_sender.app_password,
      },
      tls: {
        minVersion: "TLSv1.2",
      },
    });

    await transporter.verify();

    await transporter.sendMail({
      from: {
        name: "Rate My Plate",
        address: senderEmail,
      },
      to,
      subject: senddata.subject,
      text: senddata.text,
      html: senddata.html,
      headers: {
        "X-Entity-Ref-ID": `${Date.now()}`,
        "List-Unsubscribe": `<mailto:${senderEmail}?subject=unsubscribe>`,
        "Message-ID": `<${Date.now()}.${Math.random()
          .toString(36)
          .substring(2)}@${senderEmail.split("@")[1]}>`,
      },
    });
  } catch (error: any) {
    throw new ApiError(
      httpStatus.SERVICE_UNAVAILABLE,
      "Email Engine Issues",
      error?.message
    );
  }
};
export default sendEmail;
