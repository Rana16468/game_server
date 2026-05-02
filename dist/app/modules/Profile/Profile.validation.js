"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileValidation = void 0;
const zod_1 = require("zod");
const createProfileValidation = zod_1.z.object({
    body: zod_1.z.object({
        bio: zod_1.z.string({ required_error: "Bio is Required" }).min(15, { message: "Minimun 15 Character Needeed" }).max(100, { message: "Maximun 100 Character Accepted" }),
    })
});
exports.ProfileValidation = {
    createProfileValidation
};
