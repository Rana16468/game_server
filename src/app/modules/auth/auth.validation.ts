import { z } from "zod";

const userLoginSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: "Email is required" })
      .email({ message: "Invalid email address" })
      .min(5, { message: "Email must be at least 5 characters long" })
      .max(50, { message: "Email must be at most 50 characters long" }),

    password: z
      .string({ required_error: "Password is required" })
      .min(6, { message: "Password must be at least 6 characters long" })
      .max(15, { message: "Password must be at most 15 characters long" }),
  }),
});

const changePasswordSchema = z.object({
  body: z.object({
    newPassword: z
      .string({ required_error: "new password is required" })
      .min(6, { message: "new password must be at least 6 characters long" })
      .max(15, { message: "new password must be at most 15 characters long" }),
    oldPassword: z
      .string({ required_error: "old password is required" })
      .min(6, { message: "old password must be at least 6 characters long" })
      .max(15, { message: "old password must be at most 15 characters long" }),
  }),
});

const forgotPasswordSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: "Email is required" })
      .email({ message: "Invalid email address" })
      .min(5, { message: "Email must be at least 5 characters long" })
      .max(50, { message: "Email must be at most 50 characters long" }),
  }),
});

const resetPasswordSchema = z.object({
  body: z.object({
    id: z
      .string({ message: "id is required" })
      .uuid({ message: "uuid is required" }),
    password: z
      .string({ required_error: "Password is required" })
      .min(6, { message: "Password must be at least 6 characters long" })
      .max(15, { message: "Password must be at most 15 characters long" }),
  }),
});

const AuthValidationSchema = {
  userLoginSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema
};
export default AuthValidationSchema;
