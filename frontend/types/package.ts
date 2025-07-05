export type PackageType = "document" | "package" | "other";

export interface PackageItem {
  id: string;
  userId: string;
  userName: string;
  type: PackageType;
  description: string;
  photoUrl?: string;
}


export interface PackageFormData {
  userId: string;
  type: PackageType;
  description: string;
  photo: File | null;
}
