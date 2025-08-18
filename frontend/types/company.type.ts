import { Meta, SuccessResponse } from "./sucess";

export type Company = {
  company_id: string;
  company_name: string;
  company_address: string;
};

export type UserCompany = {
  id: string;
  user_id: string;
  company_id: string;
  company: Company;
};

export type CompanyResponse = SuccessResponse<Company>;

export type AllCompanyResponse = SuccessResponse<Company[]> & {
  meta: Meta;
};
