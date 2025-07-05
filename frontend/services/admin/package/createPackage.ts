/* eslint-disable @typescript-eslint/no-explicit-any */
import { baseUrl } from "@/config/api";
import { ErrorResponse } from "@/types/error";
import { PackageResponse } from "@/types/package.type";
import { PackageSchema } from "@/validation/package.schema";
import axios, { AxiosError } from "axios";
import { z } from "zod";

export const createPackageService = async (
  data: z.infer<typeof PackageSchema>
): Promise<PackageResponse | ErrorResponse> => {
  const token = localStorage.getItem("access_token");
  try {
    const response = await axios.post(`${baseUrl}/admin/create-package`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
        Accept: "application/json",
      },
    });

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
        "Terjadi kesalahan saat melakukan pembuatan data paket.",
      timestamp: new Date().toISOString(),
      error: axiosError.message || "Unknown error",
    };
  }
};
