import { PostStatus } from "@prisma/client";
import { z } from "zod";

const RateMyPlateSchema = z.object({
  body: z.object({
    categoryName: z
      .string({ required_error: "Category name is required" })
      .min(3, { message: "Minimum 3 characters required" })
      .max(30, { message: "Maximum 30 characters allowed" }),
    foodname: z
      .string({ required_error: "Food name is required" })
      .min(3, { message: "Minimum 3 characters required" })
      .max(30, { message: "Maximum 30 characters allowed" }),
    restaurantShopName: z
      .string({ required_error: "Restaurant shop name is required" })
      .min(3, { message: "Minimum 3 characters required" })
      .max(30, { message: "Maximum 30 characters allowed" })
      .optional(),
    restaurantShopAddress: z
      .string({ required_error: "Restaurant shop address is required" })
      .min(3, { message: "Minimum 3 characters required" })
      .max(50, { message: "Maximum 50 characters allowed" })
      .optional(),
    mapLocation: z
      .string({ required_error: "Map location is required" })
      .min(3, { message: "Minimum 3 characters required" })
      .max(50, { message: "Maximum 50 characters allowed" })
      .optional(),
    price: z
      .number({ required_error: "Price is required" })
      .min(1, { message: "Price must be at least 1" })
      .max(99999, { message: "Price cannot exceed 99999" }),
    opinion: z
      .string({ required_error: "Opinion is required" })
      .min(3, { message: "Minimum 3 characters required" })
      .max(100, { message: "Maximum 100 characters allowed" }),
    poststatus: z.enum([PostStatus.PRIVATE, PostStatus.PUBLIC]).default(PostStatus.PRIVATE),
    photo: z
      .array(z.string({ required_error: "Photo is required" }))
      .nonempty({ message: "At least one photo is required" })
      .optional(),
  }),
});

const RatingSchema = z.object({
  body: z.object({
    postId: z
      .string({ required_error: "postId is required" })
      .uuid({ message: "uuid is required" }),
    rating: z
      .number({ required_error: "rating is required" })
      .min(1, { message: "minuman 1 rating accepted" })
      .max(5, {
        message: "maximun 5 rating accepted",
      }),
  }),
});

const ViewSchema = z.object({
  body: z.object({
    postId: z
      .string({ required_error: "postId is required" })
      .uuid({ message: "uuid is required" }),
    view: z
      .number({ required_error: "rating is required" })
      .min(3, { message: "minuman 1 rating accepted" })
      .max(5, {
        message: "maximun 5 rating accepted",
      }),
  }),
});

const DummyRateMyPlateSchema = z.object({
  body: z.object({
    categoryName: z
      .string({ required_error: "Category name is required" })
      .min(3, { message: "Minimum 3 characters required" })
      .max(30, { message: "Maximum 30 characters allowed" }),
    foodname: z
      .string({ required_error: "Food name is required" })
      .min(3, { message: "Minimum 3 characters required" })
      .max(30, { message: "Maximum 30 characters allowed" }),
    restaurantShopName: z
      .string({ required_error: "Restaurant shop name is required" })
      .min(3, { message: "Minimum 3 characters required" })
      .max(30, { message: "Maximum 30 characters allowed" })
      .optional(),
    restaurantShopAddress: z
      .string({ required_error: "Restaurant shop address is required" })
      .min(3, { message: "Minimum 3 characters required" })
      .max(50, { message: "Maximum 50 characters allowed" })
      .optional(),
    mapLocation: z
      .string({ required_error: "Map location is required" })
      .min(3, { message: "Minimum 3 characters required" })
      .max(50, { message: "Maximum 50 characters allowed" })
      .optional(),
    price: z
      .number({ required_error: "Price is required" })
      .min(1, { message: "Price must be at least 1" })
      .max(99999, { message: "Price cannot exceed 99999" }),
    opinion: z
      .string({ required_error: "Opinion is required" })
      .min(3, { message: "Minimum 3 characters required" })
      .max(100, { message: "Maximum 100 characters allowed" }),
    photo: z
      .array(z.string({ required_error: "Photo is required" }))
      .nonempty({ message: "At least one photo is required" })
      .optional(),
  }),
});

const UpdateRateMyPlateSchema = z.object({
  body: z.object({
    categoryName: z
      .string({ required_error: "Category name is required" })
      .min(3, { message: "Minimum 3 characters required" })
      .max(30, { message: "Maximum 30 characters allowed" }).optional(),
    foodname: z
      .string({ required_error: "Food name is required" })
      .min(3, { message: "Minimum 3 characters required" })
      .max(30, { message: "Maximum 30 characters allowed" }).optional(),
    restaurantShopName: z
      .string({ required_error: "Restaurant shop name is required" })
      .min(3, { message: "Minimum 3 characters required" })
      .max(30, { message: "Maximum 30 characters allowed" })
      .optional(),
    restaurantShopAddress: z
      .string({ required_error: "Restaurant shop address is required" })
      .min(3, { message: "Minimum 3 characters required" })
      .max(50, { message: "Maximum 50 characters allowed" })
      .optional(),
    mapLocation: z
      .string({ required_error: "Map location is required" })
      .min(3, { message: "Minimum 3 characters required" })
      .max(50, { message: "Maximum 50 characters allowed" })
      .optional(),
    poststatus: z.enum([PostStatus.PRIVATE, PostStatus.PUBLIC]).default(PostStatus.PRIVATE).optional(),
    price: z
      .number({ required_error: "Price is required" })
      .min(1, { message: "Price must be at least 1" })
      .max(99999, { message: "Price cannot exceed 99999" }).optional(),
    opinion: z
      .string({ required_error: "Opinion is required" })
      .min(3, { message: "Minimum 3 characters required" })
      .max(100, { message: "Maximum 100 characters allowed" }).optional(),
    photo: z
      .array(z.string({ required_error: "Photo is required" }))
      .nonempty({ message: "At least one photo is required" })
      .optional(),
    photoIds: z.array(z.number({ required_error: "photoIds is required" })).optional()
  })

});

const RateMyPlateValidation = {
  RateMyPlateSchema,
  DummyRateMyPlateSchema,
  RatingSchema,
  ViewSchema,
  UpdateRateMyPlateSchema
};

export default RateMyPlateValidation;
