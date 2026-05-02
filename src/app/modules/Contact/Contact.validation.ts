import { z } from "zod";

const createContactValidation = z.object({
  body: z.object({
    name: z
      .string({ required_error: "name is Required" })
      .min(1, { message: "Minimun 100 Character Needeed" })
      .max(100, { message: "Maximun 100 Character Accepted" }),
    email: z
      .string({ required_error: "email is Required" })
      .min(11, { message: "Minimun 100 Character Needeed" })
      .max(100, { message: "Maximun 100 Character Accepted" }),
    message: z
      .string({ required_error: "message is Required" })
      .min(1, { message: "Minimun 100 Character Needeed" })
      .max(100, { message: "Maximun 100 Character Accepted" }),
  }),
});

export const ContactValidation = {
  createContactValidation,
};
