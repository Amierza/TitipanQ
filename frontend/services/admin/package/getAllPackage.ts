/* eslint-disable @typescript-eslint/no-explicit-any */
import { baseUrl } from "@/config/api";
import axiosAdminConfig from "@/services/auth/auth.config";
import { ErrorResponse } from "@/types/error";
import { AllPackageResponse } from "@/types/package.type";
import { AxiosError } from "axios";

export const getAllPackageService = async (): Promise<
  AllPackageResponse | ErrorResponse
> => {
  const token = localStorage.getItem("access_token");
  try {
    const response = await axiosAdminConfig.get(`${baseUrl}/admin/get-all-package`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    if (response.status === 200) {
      console.log("Access token: ", localStorage.getItem("access_token"))
      console.log("Refresh token: ", localStorage.getItem("refresh_token"))
      return response.data as AllPackageResponse;
    } else {
      return response.data as ErrorResponse;
    }
  } catch (error) {
    const axiosError = error as AxiosError<any>;

    return {
      status: false,
      message:
        axiosError.response?.data?.message ||
        "Terjadi kesalahan saat melakukan pengambilan data paket.",
      timestamp: new Date().toISOString(),
      error: axiosError.message || "Unknown error",
    };
  }
};
