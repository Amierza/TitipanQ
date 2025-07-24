import { Meta, SuccessResponse } from "./sucess";
import { User } from "./user.type";

export type Package = {
  package_id: string;
  package_tracking_code: string;
  package_description: string;
  package_image: string;
  package_barcode_image: string;
  package_type: string;
  package_status: string;
  package_delivered_at: string;
  package_expired_at: string;
  user: User
  created_at: string
  updated_at: string;
  deleted_at: null;
};

export type HistoryPackage = {
  history_id: string,
  history_status: string,
  changed_by: {
    user_id: string,
    user_name: string,
    user_email: string
  },
  created_at: string
};

export type PackageResponse = SuccessResponse<Package>;

export type AllPackageResponse = SuccessResponse<Package[]> & {
  meta: Meta;
};

export type AllHistoryPackageResponse = SuccessResponse<HistoryPackage[]> & {
  meta: Meta;
}
