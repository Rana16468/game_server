"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactValidation = void 0;
const zod_1 = require("zod");
const createContactValidation = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z
            .string({ required_error: "name is Required" })
            .min(1, { message: "Minimun 100 Character Needeed" })
            .max(100, { message: "Maximun 100 Character Accepted" }),
        email: zod_1.z
            .string({ required_error: "email is Required" })
            .min(11, { message: "Minimun 100 Character Needeed" })
            .max(100, { message: "Maximun 100 Character Accepted" }),
        message: zod_1.z
            .string({ required_error: "message is Required" })
            .min(1, { message: "Minimun 100 Character Needeed" })
            .max(100, { message: "Maximun 100 Character Accepted" }),
    }),
});
exports.ContactValidation = {
    createContactValidation,
};
