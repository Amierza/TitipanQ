export type PackageType = "document" | "package" | "other";

export interface PackageItem {
  package_id: string;
  package_description: string;
  package_image: string;
  package_type: string;
  package_status: "received" | "delivered" | "completed" | "expired";
  package_delivered_at: string;
  package_expired_at: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface PackageFormData {
  userId: string;
  type: PackageType;
  description: string;
  photo: File | null;
}
