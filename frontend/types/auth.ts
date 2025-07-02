import { Company, Role } from "./general";
import { SuccessResponse } from "./sucess";

export type RegisterResponseData = {
  user_id: string;
  user_name: string;
  user_email: string;
  user_password: string;
  user_phone_number: string;
  user_address: string;
  company: Company;
  role: Role;
};

export type LoginResponseData = {
  access_token: string;
  refresh_token: string;
};

export type RegisterResponse = SuccessResponse<RegisterResponseData>;
export type LoginResponse = SuccessResponse<LoginResponseData>;
