"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = require("zod");
const recorded_monitoring_schema = zod_1.z.object({
    body: zod_1.z.object({
        ipaddress: zod_1.z.string().ip("Invalid IP address"),
        os: zod_1.z
            .string()
            .min(1, "OS name must be at least 2 characters")
            .max(20, { message: "max 20 character for os" }),
        browser: zod_1.z
            .string()
            .min(1, "Browser name must be at least 2 characters")
            .max(20, { message: "max 20 character for browser" }),
        device: zod_1.z
            .string()
            .min(1, "Device name must be at least 2 characters")
            .max(20, { message: "max 20 character for device" }),
    }),
});
const update_monitoring_schema = zod_1.z.object({
    body: zod_1.z.object({
        country: zod_1.z
            .string({ required_error: "country is required" })
            .min(1, {
            message: "min 1 character needed",
        })
            .max(20, { message: "max 20 character accepted" }),
    }),
});
const delete_multiple_monitoring_schema = zod_1.z.object({
    body: zod_1.z.object({
        ids: zod_1.z.array(zod_1.z.string().uuid()).nonempty("At least one ID is required.")
    })
});
const Recorded_Monitoring_Validation = {
    recorded_monitoring_schema,
    update_monitoring_schema,
    delete_multiple_monitoring_schema
};
exports.default = Recorded_Monitoring_Validation;
