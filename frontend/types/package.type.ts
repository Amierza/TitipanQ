import { Meta, SuccessResponse } from "./sucess";
import { User } from "./user.type";

export type Package = {
  package_id: string;
  package_description: string;
  package_image: string;
  package_type: string;
  package_status: string;
  package_delivered_at: string;
  package_expired_at: string;
  user: User
  created_at: string
  updated_at: string;
  deleted_at: null;
};

export type PackageResponse = SuccessResponse<Package>;

export type AllPackageResponse = SuccessResponse<Package[]> & {
  meta: Meta;
};
