import { v2 as cloudinary } from "cloudinary";
import fs from "fs/promises";
import config from "../../app/config";
import { AppError } from "../../app/middleware/golobalErrorHnadelar";
import httpStatus from "http-status";

// Configure Cloudinary
cloudinary.config({
  cloud_name: config.cloudinary.cloudinary_cloud_name,
  api_key: config.cloudinary.cloudinary_api_key,
  api_secret: config.cloudinary.cloudinary_api_secret,
});

/**
 * Uploads an image to Cloudinary and deletes the local file.
 * @param imageName - The public ID for the Cloudinary image.
 * @param path - The local file path.
 * @returns {Promise<object>} - The Cloudinary response object.
 */
const sendImageToCloudinary = async (
  imageName: string,
  path: string
): Promise<object> => {
  try {
    const result = await cloudinary.uploader.upload(path, {
      public_id: imageName,
    });

    if (result) {
      fs.unlink(path).catch((err) => {
        throw new AppError(
          httpStatus.BAD_GATEWAY,
          `Failed to delete file: ${path}`,
          err
        );
      });
    }

    return result;
  } catch (error: any) {
    throw new AppError(
      httpStatus.BAD_GATEWAY,
      `Cloudinary Upload Error`,
      error
    );
  }
};

export default sendImageToCloudinary;
