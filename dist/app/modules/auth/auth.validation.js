"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = require("zod");
const userLoginSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z
            .string({ required_error: "Email is required" })
            .email({ message: "Invalid email address" })
            .min(5, { message: "Email must be at least 5 characters long" })
            .max(50, { message: "Email must be at most 50 characters long" }),
        password: zod_1.z
            .string({ required_error: "Password is required" })
            .min(6, { message: "Password must be at least 6 characters long" })
            .max(15, { message: "Password must be at most 15 characters long" }),
    }),
});
const changePasswordSchema = zod_1.z.object({
    body: zod_1.z.object({
        newPassword: zod_1.z
            .string({ required_error: "new password is required" })
            .min(6, { message: "new password must be at least 6 characters long" })
            .max(15, { message: "new password must be at most 15 characters long" }),
        oldPassword: zod_1.z
            .string({ required_error: "old password is required" })
            .min(6, { message: "old password must be at least 6 characters long" })
            .max(15, { message: "old password must be at most 15 characters long" }),
    }),
});
const forgotPasswordSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z
            .string({ required_error: "Email is required" })
            .email({ message: "Invalid email address" })
            .min(5, { message: "Email must be at least 5 characters long" })
            .max(50, { message: "Email must be at most 50 characters long" }),
    }),
});
const resetPasswordSchema = zod_1.z.object({
    body: zod_1.z.object({
        id: zod_1.z
            .string({ message: "id is required" })
            .uuid({ message: "uuid is required" }),
        password: zod_1.z
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
exports.default = AuthValidationSchema;
