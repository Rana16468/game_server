import donenv from "dotenv";
import path from "path";
donenv.config({ path: path.join(process.cwd(), ".env") });
export default {
  NODE_ENV: process.env.NODE_ENV,
  port: process.env.PORT,
  bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS,
  jwt_access_srcret: process.env.JWT_ACCESS_SECRET,
  jwt_refeesh_srcret: process.env.JWT_REFRESH_TOKEN,
  token_expire_in: process.env.EXPIRES_IN,
  refresh_token_expire_in: process.env.REFRESH_TOKEN_EXPIRES_IN,
  email_sender: {
    email: process.env.NODEMAILER_EMAIL || undefined,
    app_password: process.env.NODEMAILER_PASSWORD || undefined,
  },
  ipaddress_tracker: process.env.IPADDRESS_TRACKER,
  redis_url: process.env.REDIAS_URL,
  cloudinary: {
    cloudinary_cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    cloudinary_api_key: process.env.CLOUDINARY_API_KEY,
    cloudinary_api_secret: process.env.CLOUDINARY_API_SECRET,
  },
  frontend_link: process.env.FRONTEND_LINK,
  company_logo: process.env.COMPANYLOGO,
  social_links: {
    youtube: process.env.YOUTUBE,
    youtube_icon: process.env.YOUTUBE_ICON,
    linkedin: process.env.LINKEDIN,
    linkedin_icon: process.env.LINKEDIN_ICON,
    instagram: process.env.INSTAGRAM,
    instagram_icon: process.env.INSTRAGRAM_ICON,
  },
  company_email: process.env.COMPANY_EMAIL,
  company_info: {
    company_phone_number: process.env.COMPANY_PHONE_NUMBER,
    company_location: process.env.COMPANY_LOCATION,
  },
  jwt_reset_token: process.env.JWT_RESET_TOKEN,
  forgot_token_expries_in: process.env.FORGOT_TOKEN_EXPIRES_IN
};
