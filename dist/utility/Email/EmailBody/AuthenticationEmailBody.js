"use strict";
// AuthenticationEmailBody;
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = __importDefault(require("../../../app/config"));
const AuthenticationEmailBody = (userData, varified_authenticationLink) => __awaiter(void 0, void 0, void 0, function* () {
    const currentDate = new Date().toLocaleDateString("en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
    const senddata = {
        html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; background-color: #f8f9fa; padding: 20px;">
        <!-- Header -->
        <div style="background-color: white; padding: 20px; margin-bottom: 20px; border-radius: 8px;">
          <img src="${config_1.default.company_logo}" alt="Rate My Plate" style="height: 40px; margin-bottom: 10px;">
          <div style="text-align: right; color: #6c757d; font-size: 14px;">
            ${currentDate}
          </div>
        </div>
    
        <!-- Main Content -->
        <div style="background-color: white; padding: 30px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #1a237e; margin: 0 0 20px 0; font-size: 24px;">Rate My Plate Varified Link</h2>
          
          <p style="color: #333; margin-bottom: 15px;">Dear ${(userData === null || userData === void 0 ? void 0 : userData.username) || "User"},</p>
          
          <p style="color: #333; margin-bottom: 25px;">Here is your authentication link to securely varified your Rate My Plate account :</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${varified_authenticationLink}" 
               style="background-color: #4a148c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              Click And Varified 
            </a>
          </div>
    
          <p style="color: #666; font-size: 14px; margin-bottom: 5px;">Note: This reset link is valid for 15 minutes.</p>
          
          <p style="color: #666; font-size: 14px; margin-bottom: 20px;">If you did not request this authentication link, please disregard this email or contact our support team.</p>
          
          <p style="color: #333; margin-bottom: 5px;">Thank you for using Rate My Plate!</p>
        </div>
    
        <!-- Footer -->
        <div style="text-align: center; padding: 20px;">
          <p style="color: #666; margin-bottom: 15px;">Team Rate My Plate</p>
          <!-- Contact Info -->
          <div style="font-size: 12px; color: #666;">
            <p style="margin: 5px 0;">
              Email: ${config_1.default.company_email}
            </p>
            <p style="margin: 5px 0;">
              Phone: ${config_1.default.company_info.company_phone_number}
            </p>
            <p style="margin: 5px 0;">
              Address: ${config_1.default.company_info.company_location}
            </p>
          </div>
        </div>
      </div>
    `,
        subject: "Varified Rate My Plate Registed User",
        text: "Varified your Rate My Plate account",
    };
    return senddata;
});
exports.default = AuthenticationEmailBody;
