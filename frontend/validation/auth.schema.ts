import { z } from "zod";

const phoneNumberRegex = /^(?:\+62|62|0)8[1-9][0-9]{6,10}$/;

export const LoginSchema = z.object({
  user_email: z.string().email({ message: "Email is not valid" }),
  user_password: z.string().min(3, "Password must have at least 3 characters"),
});

export const RegisterSchema = z.object({
  user_name: z.string().min(3, "Name must have at least 3 characters"),
  user_email: z.string().email({ message: "Email is not valid" }),
  user_phone_number: z
    .string()
    .regex(phoneNumberRegex, "Phone number format is not valid"),
  user_password: z.string().min(3, "Password must have at least 3 characters"),
  user_address: z
    .string({ required_error: "Address is required" })
    .min(5, "Address must have at least 5 characters"),
  company_id: z.string({ required_error: "Company is required" }),
});
