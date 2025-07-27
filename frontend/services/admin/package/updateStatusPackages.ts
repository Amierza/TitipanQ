/* eslint-disable @typescript-eslint/no-explicit-any */
import { baseUrl } from "@/config/api";
import { ErrorResponse } from "@/types/error";
import { AxiosError } from "axios";
import axiosAdminConfig from "@/services/auth/auth.config";
import { SuccessResponse } from "@/types/sucess";
import z from "zod";
import { UpdateStatusPackages } from "@/validation/package.schema";

export const updateStatusPackagesService = async (
  data: z.infer<typeof UpdateStatusPackages>,
): Promise<SuccessResponse | ErrorResponse> => {
  const token = localStorage.getItem("access_token");
  try {
    const response = await axiosAdminConfig.patch(
      `${baseUrl}/admin/update-status-packages`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      }
    );

    if (response.status === 200) {
      return response.data as SuccessResponse;
    } else {
      return response.data as ErrorResponse;
    }
  } catch (error) {
    const axiosError = error as AxiosError<any>;

    return {
      status: false,
      message:
        axiosError.response?.data?.message ||
        "Terjadi kesalahan saat melakukan pembaruan status data paket.",
      timestamp: new Date().toISOString(),
      error: axiosError.message || "Unknown error",
    };
  }
};
