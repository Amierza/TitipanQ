/* eslint-disable @typescript-eslint/no-explicit-any */
import { baseUrl } from "@/config/api";
import axiosAdminConfig from "@/services/auth/auth.config";
import { ErrorResponse } from "@/types/error";
import { AllHistoryPackageResponse } from "@/types/package.type";
import { AxiosError } from "axios";

export const getAllHistoryPackageService = async ( packageId: string ): Promise<AllHistoryPackageResponse | ErrorResponse> => {
  const token = localStorage.getItem("access_token");
  try {
    const response = await axiosAdminConfig.get(
      `${baseUrl}/admin/get-all-package-history/${packageId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      }
    );

    if (response.status === 200) {
      return response.data as AllHistoryPackageResponse;
    } else {
      return response.data as ErrorResponse;
    }
  } catch (error) {
    const axiosError = error as AxiosError<any>;

    return {
      status: false,
      message:
        axiosError.response?.data?.message ||
        "Terjadi kesalahan saat melakukan pengambilan data history paket.",
      timestamp: new Date().toISOString(),
      error: axiosError.message || "Unknown error",
    };
  }
};