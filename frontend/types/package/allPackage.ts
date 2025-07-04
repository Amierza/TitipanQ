import { meta, SuccessResponse } from "../sucess";

export type Package = {
  package_id: string;
  package_description: string;
  package_image: string;
  package_type: string;
  package_status: string;
  package_received_at: string;
  package_delivered_at: string | null;
  package_expired_at: string;
  user_id: string;
};

export type PackageResponse = SuccessResponse<Package>;

export type AllPackageResponse = SuccessResponse<Package[]> & {
  meta: meta;
};
