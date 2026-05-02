import { z } from "zod";

const recorded_monitoring_schema = z.object({
  body: z.object({
    ipaddress: z.string().ip("Invalid IP address"),
    os: z
      .string()
      .min(1, "OS name must be at least 2 characters")
      .max(20, { message: "max 20 character for os" }),
    browser: z
      .string()
      .min(1, "Browser name must be at least 2 characters")
      .max(20, { message: "max 20 character for browser" }),
    device: z
      .string()
      .min(1, "Device name must be at least 2 characters")
      .max(20, { message: "max 20 character for device" }),
  }),
});

const update_monitoring_schema = z.object({
  body: z.object({
    country: z
      .string({ required_error: "country is required" })
      .min(1, {
        message: "min 1 character needed",
      })
      .max(20, { message: "max 20 character accepted" }),
  }),
});
const delete_multiple_monitoring_schema=z.object({
   body:z.object({
    ids: z.array(z.string().uuid()).nonempty("At least one ID is required.")
   })
})
const Recorded_Monitoring_Validation = {
  recorded_monitoring_schema,
  update_monitoring_schema,
  delete_multiple_monitoring_schema
};
export default Recorded_Monitoring_Validation;
