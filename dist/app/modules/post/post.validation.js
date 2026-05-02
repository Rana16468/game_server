"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const RateMyPlateSchema = zod_1.z.object({
    body: zod_1.z.object({
        categoryName: zod_1.z
            .string({ required_error: "Category name is required" })
            .min(3, { message: "Minimum 3 characters required" })
            .max(30, { message: "Maximum 30 characters allowed" }),
        foodname: zod_1.z
            .string({ required_error: "Food name is required" })
            .min(3, { message: "Minimum 3 characters required" })
            .max(30, { message: "Maximum 30 characters allowed" }),
        restaurantShopName: zod_1.z
            .string({ required_error: "Restaurant shop name is required" })
            .min(3, { message: "Minimum 3 characters required" })
            .max(30, { message: "Maximum 30 characters allowed" })
            .optional(),
        restaurantShopAddress: zod_1.z
            .string({ required_error: "Restaurant shop address is required" })
            .min(3, { message: "Minimum 3 characters required" })
            .max(50, { message: "Maximum 50 characters allowed" })
            .optional(),
        mapLocation: zod_1.z
            .string({ required_error: "Map location is required" })
            .min(3, { message: "Minimum 3 characters required" })
            .max(50, { message: "Maximum 50 characters allowed" })
            .optional(),
        price: zod_1.z
            .number({ required_error: "Price is required" })
            .min(1, { message: "Price must be at least 1" })
            .max(99999, { message: "Price cannot exceed 99999" }),
        opinion: zod_1.z
            .string({ required_error: "Opinion is required" })
            .min(3, { message: "Minimum 3 characters required" })
            .max(100, { message: "Maximum 100 characters allowed" }),
        poststatus: zod_1.z.enum([client_1.PostStatus.PRIVATE, client_1.PostStatus.PUBLIC]).default(client_1.PostStatus.PRIVATE),
        photo: zod_1.z
            .array(zod_1.z.string({ required_error: "Photo is required" }))
            .nonempty({ message: "At least one photo is required" })
            .optional(),
    }),
});
const RatingSchema = zod_1.z.object({
    body: zod_1.z.object({
        postId: zod_1.z
            .string({ required_error: "postId is required" })
            .uuid({ message: "uuid is required" }),
        rating: zod_1.z
            .number({ required_error: "rating is required" })
            .min(1, { message: "minuman 1 rating accepted" })
            .max(5, {
            message: "maximun 5 rating accepted",
        }),
    }),
});
const ViewSchema = zod_1.z.object({
    body: zod_1.z.object({
        postId: zod_1.z
            .string({ required_error: "postId is required" })
            .uuid({ message: "uuid is required" }),
        view: zod_1.z
            .number({ required_error: "rating is required" })
            .min(3, { message: "minuman 1 rating accepted" })
            .max(5, {
            message: "maximun 5 rating accepted",
        }),
    }),
});
const DummyRateMyPlateSchema = zod_1.z.object({
    body: zod_1.z.object({
        categoryName: zod_1.z
            .string({ required_error: "Category name is required" })
            .min(3, { message: "Minimum 3 characters required" })
            .max(30, { message: "Maximum 30 characters allowed" }),
        foodname: zod_1.z
            .string({ required_error: "Food name is required" })
            .min(3, { message: "Minimum 3 characters required" })
            .max(30, { message: "Maximum 30 characters allowed" }),
        restaurantShopName: zod_1.z
            .string({ required_error: "Restaurant shop name is required" })
            .min(3, { message: "Minimum 3 characters required" })
            .max(30, { message: "Maximum 30 characters allowed" })
            .optional(),
        restaurantShopAddress: zod_1.z
            .string({ required_error: "Restaurant shop address is required" })
            .min(3, { message: "Minimum 3 characters required" })
            .max(50, { message: "Maximum 50 characters allowed" })
            .optional(),
        mapLocation: zod_1.z
            .string({ required_error: "Map location is required" })
            .min(3, { message: "Minimum 3 characters required" })
            .max(50, { message: "Maximum 50 characters allowed" })
            .optional(),
        price: zod_1.z
            .number({ required_error: "Price is required" })
            .min(1, { message: "Price must be at least 1" })
            .max(99999, { message: "Price cannot exceed 99999" }),
        opinion: zod_1.z
            .string({ required_error: "Opinion is required" })
            .min(3, { message: "Minimum 3 characters required" })
            .max(100, { message: "Maximum 100 characters allowed" }),
        photo: zod_1.z
            .array(zod_1.z.string({ required_error: "Photo is required" }))
            .nonempty({ message: "At least one photo is required" })
            .optional(),
    }),
});
const UpdateRateMyPlateSchema = zod_1.z.object({
    body: zod_1.z.object({
        categoryName: zod_1.z
            .string({ required_error: "Category name is required" })
            .min(3, { message: "Minimum 3 characters required" })
            .max(30, { message: "Maximum 30 characters allowed" }).optional(),
        foodname: zod_1.z
            .string({ required_error: "Food name is required" })
            .min(3, { message: "Minimum 3 characters required" })
            .max(30, { message: "Maximum 30 characters allowed" }).optional(),
        restaurantShopName: zod_1.z
            .string({ required_error: "Restaurant shop name is required" })
            .min(3, { message: "Minimum 3 characters required" })
            .max(30, { message: "Maximum 30 characters allowed" })
            .optional(),
        restaurantShopAddress: zod_1.z
            .string({ required_error: "Restaurant shop address is required" })
            .min(3, { message: "Minimum 3 characters required" })
            .max(50, { message: "Maximum 50 characters allowed" })
            .optional(),
        mapLocation: zod_1.z
            .string({ required_error: "Map location is required" })
            .min(3, { message: "Minimum 3 characters required" })
            .max(50, { message: "Maximum 50 characters allowed" })
            .optional(),
        poststatus: zod_1.z.enum([client_1.PostStatus.PRIVATE, client_1.PostStatus.PUBLIC]).default(client_1.PostStatus.PRIVATE).optional(),
        price: zod_1.z
            .number({ required_error: "Price is required" })
            .min(1, { message: "Price must be at least 1" })
            .max(99999, { message: "Price cannot exceed 99999" }).optional(),
        opinion: zod_1.z
            .string({ required_error: "Opinion is required" })
            .min(3, { message: "Minimum 3 characters required" })
            .max(100, { message: "Maximum 100 characters allowed" }).optional(),
        photo: zod_1.z
            .array(zod_1.z.string({ required_error: "Photo is required" }))
            .nonempty({ message: "At least one photo is required" })
            .optional(),
        photoIds: zod_1.z.array(zod_1.z.number({ required_error: "photoIds is required" })).optional()
    })
});
const RateMyPlateValidation = {
    RateMyPlateSchema,
    DummyRateMyPlateSchema,
    RatingSchema,
    ViewSchema,
    UpdateRateMyPlateSchema
};
exports.default = RateMyPlateValidation;
