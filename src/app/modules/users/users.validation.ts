import { z } from "zod";
import { UserRole, UserStatus } from "@prisma/client";

// User Role Validation
const UserRoleSchema = z.enum([
  UserRole.ADMIN,
  UserRole.EMPLOYEE,
  UserRole.USER,
]);

// User Status Validation
const UserStatusSchema = z.enum([
  UserStatus.ACTIVE,
  UserStatus.BLOCK,
  UserStatus.DELETED,
]);

// User Validation Schema
const UserSchema = z.object({
  body: z.object({
    username: z
      .string({ required_error: "User name is required" })
      .min(3, { message: "Username must be at least 3 characters long" })
      .max(20, { message: "Username must be at most 20 characters long" }),

    email: z
      .string({ required_error: "Email is required" })
      .email({ message: "Invalid email address" })
      .min(5, { message: "Email must be at least 5 characters long" })
      .max(50, { message: "Email must be at most 50 characters long" }),

    password: z
      .string({ required_error: "Password is required" })
      .min(6, { message: "Password must be at least 6 characters long" })
      .max(15, { message: "Password must be at most 15 characters long" }),

    ipaddress: z
      .string({ required_error: "IP address is required" })
      .ip({ message: "Invalid IP address" }),

    phonenumber: z
      .string({ required_error: "Phone number is required" })
      .regex(
        /^\+?[1-9]\d{1,14}$/,
        "Phone number must be in E.164 format (e.g., +1234567890)"
      ).optional(),

    role: UserRoleSchema.default(UserRole.USER),
    photo: z.string().url("Invalid URL").optional(),
    isVerified: z.boolean().default(false),
    status: UserStatusSchema.default(UserStatus.ACTIVE),
    os: z
      .string()
      .min(1, { message: "OS name must be at least 2 characters" })
      .max(20, { message: "max 20 character for os" }),
    browser: z
      .string()
      .min(1, { message: "Browser name must be at least 2 characters" })
      .max(20, { message: "max 20 character for browser" }),
    device: z
      .string()
      .min(1, { message: "Device name must be at least 2 characters" })
      .max(20, {
        message: "max 20 character for  device",
      }),
  }),
});

const UserVarificationSchema = z.object({
  body: z.object({
    id: z
      .string({ required_error: "id is required" })
      .uuid({ message: "uuid acepted only" }),
    email: z
      .string({ required_error: "Email is required" })
      .email({ message: "Invalid email address" })
      .min(5, { message: "Email must be at least 5 characters long" })
      .max(50, { message: "Email must be at most 50 characters long" }),
  }),
});
const ChangeProfileStatusSchema = z.object({
  body: z.object({
    role: UserRoleSchema,
  }),
});

const updateUserProfileSchema = z
  .object({
    body: z
      .object({
        username: z
          .string({ required_error: "User name is required" })
          .min(3, { message: "Username must be at least 3 characters long" })
          .max(20, { message: "Username must be at most 20 characters long" }),
      })
      .optional(),
    phonenumber: z
      .string({ required_error: "Phone number is required" })
      .regex(
        /^\+?[1-9]\d{1,14}$/,
        "Phone number must be in E.164 format (e.g., +1234567890)"
      )
      .optional(),
    photo: z.string({ message: "photo is required" }).optional()
  })



const UserValidationSchema = {
  UserSchema,
  UserVarificationSchema,
  ChangeProfileStatusSchema,
  updateUserProfileSchema
};
export default UserValidationSchema;
