import { Company } from "./company.type";
import { Role } from "./general";
import { Meta, SuccessResponse } from "./sucess";

export type User = {
  user_id: string;
  user_name: string;
  user_email: string;
  user_password: string;
  user_phone_number: string;
  user_address: string;
  company: Company;
  role: Role;
};

export type UserResponse = SuccessResponse<User>;

export type AllUserResponse = SuccessResponse<User[]> & {
  meta: Meta;
};


export interface UserProfile {
  user_id: string;
  user_name: string;
  user_email: string;
  user_phone_number: string;
  user_address: string;
  company: {
    company_id: string;
    company_name: string;
    company_address: string;
  };
  role: {
    role_id: string;
    role_name: string;
  };
}

