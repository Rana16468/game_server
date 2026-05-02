"use strict";
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
const cloudinary_1 = require("cloudinary");
const promises_1 = __importDefault(require("fs/promises"));
const config_1 = __importDefault(require("../../app/config"));
const golobalErrorHnadelar_1 = require("../../app/middleware/golobalErrorHnadelar");
const http_status_1 = __importDefault(require("http-status"));
// Configure Cloudinary
cloudinary_1.v2.config({
    cloud_name: config_1.default.cloudinary.cloudinary_cloud_name,
    api_key: config_1.default.cloudinary.cloudinary_api_key,
    api_secret: config_1.default.cloudinary.cloudinary_api_secret,
});
/**
 * Uploads an image to Cloudinary and deletes the local file.
 * @param imageName - The public ID for the Cloudinary image.
 * @param path - The local file path.
 * @returns {Promise<object>} - The Cloudinary response object.
 */
const sendImageToCloudinary = (imageName, path) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield cloudinary_1.v2.uploader.upload(path, {
            public_id: imageName,
        });
        if (result) {
            promises_1.default.unlink(path).catch((err) => {
                throw new golobalErrorHnadelar_1.AppError(http_status_1.default.BAD_GATEWAY, `Failed to delete file: ${path}`, err);
            });
        }
        return result;
    }
    catch (error) {
        throw new golobalErrorHnadelar_1.AppError(http_status_1.default.BAD_GATEWAY, `Cloudinary Upload Error`, error);
    }
});
exports.default = sendImageToCloudinary;
