"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
// User Role Validation
const UserRoleSchema = zod_1.z.enum([
    client_1.UserRole.ADMIN,
    client_1.UserRole.EMPLOYEE,
    client_1.UserRole.USER,
]);
// User Status Validation
const UserStatusSchema = zod_1.z.enum([
    client_1.UserStatus.ACTIVE,
    client_1.UserStatus.BLOCK,
    client_1.UserStatus.DELETED,
]);
// User Validation Schema
const UserSchema = zod_1.z.object({
    body: zod_1.z.object({
        username: zod_1.z
            .string({ required_error: "User name is required" })
            .min(3, { message: "Username must be at least 3 characters long" })
            .max(20, { message: "Username must be at most 20 characters long" }),
        email: zod_1.z
            .string({ required_error: "Email is required" })
            .email({ message: "Invalid email address" })
            .min(5, { message: "Email must be at least 5 characters long" })
            .max(50, { message: "Email must be at most 50 characters long" }),
        password: zod_1.z
            .string({ required_error: "Password is required" })
            .min(6, { message: "Password must be at least 6 characters long" })
            .max(15, { message: "Password must be at most 15 characters long" }),
        ipaddress: zod_1.z
            .string({ required_error: "IP address is required" })
            .ip({ message: "Invalid IP address" }),
        phonenumber: zod_1.z
            .string({ required_error: "Phone number is required" })
            .regex(/^\+?[1-9]\d{1,14}$/, "Phone number must be in E.164 format (e.g., +1234567890)").optional(),
        role: UserRoleSchema.default(client_1.UserRole.USER),
        photo: zod_1.z.string().url("Invalid URL").optional(),
        isVerified: zod_1.z.boolean().default(false),
        status: UserStatusSchema.default(client_1.UserStatus.ACTIVE),
        os: zod_1.z
            .string()
            .min(1, { message: "OS name must be at least 2 characters" })
            .max(20, { message: "max 20 character for os" }),
        browser: zod_1.z
            .string()
            .min(1, { message: "Browser name must be at least 2 characters" })
            .max(20, { message: "max 20 character for browser" }),
        device: zod_1.z
            .string()
            .min(1, { message: "Device name must be at least 2 characters" })
            .max(20, {
            message: "max 20 character for  device",
        }),
    }),
});
const UserVarificationSchema = zod_1.z.object({
    body: zod_1.z.object({
        id: zod_1.z
            .string({ required_error: "id is required" })
            .uuid({ message: "uuid acepted only" }),
        email: zod_1.z
            .string({ required_error: "Email is required" })
            .email({ message: "Invalid email address" })
            .min(5, { message: "Email must be at least 5 characters long" })
            .max(50, { message: "Email must be at most 50 characters long" }),
    }),
});
const ChangeProfileStatusSchema = zod_1.z.object({
    body: zod_1.z.object({
        role: UserRoleSchema,
    }),
});
const updateUserProfileSchema = zod_1.z
    .object({
    body: zod_1.z
        .object({
        username: zod_1.z
            .string({ required_error: "User name is required" })
            .min(3, { message: "Username must be at least 3 characters long" })
            .max(20, { message: "Username must be at most 20 characters long" }),
    })
        .optional(),
    phonenumber: zod_1.z
        .string({ required_error: "Phone number is required" })
        .regex(/^\+?[1-9]\d{1,14}$/, "Phone number must be in E.164 format (e.g., +1234567890)")
        .optional(),
    photo: zod_1.z.string({ message: "photo is required" }).optional()
});
const UserValidationSchema = {
    UserSchema,
    UserVarificationSchema,
    ChangeProfileStatusSchema,
    updateUserProfileSchema
};
exports.default = UserValidationSchema;
