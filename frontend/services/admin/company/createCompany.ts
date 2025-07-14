/* eslint-disable @typescript-eslint/no-explicit-any */
import { baseUrl } from "@/config/api";
import axiosAdminConfig from "@/services/auth/auth.config";
import { CompanyResponse } from "@/types/company.type";
import { ErrorResponse } from "@/types/error";
import { CompanySchema } from "@/validation/company.schema";
import { AxiosError } from "axios";
import { z } from "zod";

export const createCompanyService = async (
  data: z.infer<typeof CompanySchema>
): Promise<CompanyResponse | ErrorResponse> => {
  const token = localStorage.getItem("access_token");
  try {
    const response = await axiosAdminConfig.post(`${baseUrl}/admin/create-company`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    if (response.status === 200) {
      return response.data as CompanyResponse;
    } else {
      return response.data as ErrorResponse;
    }
  } catch (error) {
    const axiosError = error as AxiosError<any>;

    return {
      status: false,
      message:
        axiosError.response?.data?.message ||
        "Terjadi kesalahan saat melakukan pembuatan data perusahaan.",
      timestamp: new Date().toISOString(),
      error: axiosError.message || "Unknown error",
    };
  }
};
