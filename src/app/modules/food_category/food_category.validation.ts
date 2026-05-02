import { z } from "zod";

const FoodCategorySchema = z.object({
  body: z.object({
    categorieName: z
      .string({ required_error: "categorie name is required" })
      .min(1, {
        message: "categorie name min limit 1",
      })
      .max(30, {
        message: "categorie name max limit 30",
      }),
  }),
});

const UpdateFoodCategorySchema = z.object({
  body: z.object({
    categorieName: z
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
export default FoodCategoryValidation;
