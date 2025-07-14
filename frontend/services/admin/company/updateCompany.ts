/* eslint-disable @typescript-eslint/no-explicit-any */
import { baseUrl } from "@/config/api";
import { ErrorResponse } from "@/types/error";
import { AxiosError } from "axios";
import { z } from "zod";
import axiosAdminConfig from "@/services/auth/auth.config";
import { CompanySchema } from "@/validation/company.schema";
import { CompanyResponse } from "@/types/company.type";

export const updatePackageService = async (
  companyId: string,
  data: Partial<z.infer<typeof CompanySchema>>
): Promise<CompanyResponse | ErrorResponse> => {
  const token = localStorage.getItem("access_token");
  try {
    const response = await axiosAdminConfig.patch(
      `${baseUrl}/admin/update-company/${companyId}`,
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
        "Terjadi kesalahan saat melakukan pembaruan data perusahaan.",
      timestamp: new Date().toISOString(),
      error: axiosError.message || "Unknown error",
    };
  }
};
