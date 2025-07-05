/* eslint-disable @typescript-eslint/no-explicit-any */
import { baseUrl } from "@/config/api";
import axiosAdminConfig from "@/services/auth/auth.config";
import { ErrorResponse } from "@/types/error";
import { PackageResponse } from "@/types/package.type";
import { AxiosError } from "axios";

export const deletePackageService = async (
  packageId: string
): Promise<PackageResponse | ErrorResponse> => {
  const token = localStorage.getItem("access_token");
  try {
    const response = await axiosAdminConfig.delete(
      `${baseUrl}/admin/delete-package/${packageId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      }
    );

    if (response.status === 200) {
      return response.data as PackageResponse;
    } else {
      return response.data as ErrorResponse;
    }
  } catch (error) {
    const axiosError = error as AxiosError<any>;

    return {
      status: false,
      message:
        axiosError.response?.data?.message ||
        "Terjadi kesalahan saat melakukan hapus data paket.",
      timestamp: new Date().toISOString(),
      error: axiosError.message || "Unknown error",
    };
  }
};
