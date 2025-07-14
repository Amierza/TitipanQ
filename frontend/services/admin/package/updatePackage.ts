/* eslint-disable @typescript-eslint/no-explicit-any */
import { baseUrl } from "@/config/api";
import { PackageResponse } from "@/types/package.type";
import { ErrorResponse } from "@/types/error";
import { PackageSchema } from "@/validation/package.schema";
import { AxiosError } from "axios";
import { z } from "zod";
import axiosAdminConfig from "@/services/auth/auth.config";

export const updatePackageService = async (
  packageId: string,
  data: Partial<z.infer<typeof PackageSchema>>
): Promise<PackageResponse | ErrorResponse> => {
  const token = localStorage.getItem("access_token");
  try {
    const response = await axiosAdminConfig.patch(
      `${baseUrl}/admin/update-package/${packageId}`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
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
        "Terjadi kesalahan saat melakukan pembaruan data paket.",
      timestamp: new Date().toISOString(),
      error: axiosError.message || "Unknown error",
    };
  }
};
