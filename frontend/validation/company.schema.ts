import { z } from "zod";

export const CompanySchema = z.object({
  company_name: z.string().min(5, "Company name at least 5 character"),
  company_address: z.string().min(8, "Company address at least 8 characters"),
});
