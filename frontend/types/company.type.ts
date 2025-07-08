import { SuccessResponse } from "./sucess";

export type Company = {
  company_id: string;
  company_name: string;
  company_address: string;
};

export type AllCompanyResponse = SuccessResponse<Company[]>