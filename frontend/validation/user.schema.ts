import { z } from "zod";

export const UserSchema = z.object({
  user_name: z
    .string()
    .min(2, { message: "Nama harus terdiri dari minimal 2 karakter" }),
  user_email: z.string().email({ message: "Email tidak valid" }),
  user_password: z
    .string()
    .min(6, { message: "Password harus terdiri dari minimal 6 karakter" }),
  user_phone_number: z.string().regex(/^08[0-9]{8,11}$/, {
    message: "Nomor telepon harus dimulai dengan 08 dan berisi 10-13 digit",
  }),
  user_address: z.string().min(5, { message: "Alamat terlalu pendek" }),
  company_id: z.string().min(1, { message: "User harus menyertakan company" }),
});
