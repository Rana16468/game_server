"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = require("zod");
const FoodCategorySchema = zod_1.z.object({
    body: zod_1.z.object({
        categorieName: zod_1.z
            .string({ required_error: "categorie name is required" })
            .min(1, {
            message: "categorie name min limit 1",
        })
            .max(30, {
            message: "categorie name max limit 30",
        }),
    }),
});
const UpdateFoodCategorySchema = zod_1.z.object({
    body: zod_1.z.object({
        categorieName: zod_1.z
            .string({ required_error: "categorie name is required" })
            .min(1, {
            message: "categorie name min limit 1",
        })
            .max(30, {
            message: "categorie name max limit 30",
        }).optional(),
    }),
});
const FoodCategoryValidation = {
    FoodCategorySchema,
    UpdateFoodCategorySchema
};
exports.default = FoodCategoryValidation;
