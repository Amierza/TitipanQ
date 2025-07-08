// services/client/get-user-packages.ts
import axiosUserConfig from "@/services/auth/axiosUserConfig";
import { PackageItem } from "@/types/package";

export const getUserPackages = async (userId: string): Promise<PackageItem[]> => {
  const response = await axiosUserConfig.get("/user/get-all-package", {
    params: { user_id: userId },
  });

  if (!response.data?.status) {
    throw new Error(response.data?.message || "Gagal mengambil data paket");
  }

  return response.data.data as PackageItem[];
};
