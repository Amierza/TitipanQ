/* eslint-disable @typescript-eslint/no-explicit-any */
import { baseUrl } from "@/config/api";
import axiosAdminConfig from "@/services/auth/auth.config";
import { AllCompanyResponse } from "@/types/company.type";
import { ErrorResponse } from "@/types/error";
import { AxiosError } from "axios";

export const getAllCompanyPaginationService = async (page?: number):
  Promise<AllCompanyResponse | ErrorResponse> => {
  const token = localStorage.getItem("access_token");
  try {
    const response = await axiosAdminConfig.get(
      `${baseUrl}/admin/get-all-company?page=${page}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      }
    );

    if (response.status === 200) {
      return response.data as AllCompanyResponse;
    } else {
      return response.data as ErrorResponse;
    }
  } catch (error) {
    const axiosError = error as AxiosError<any>;

    return {
      status: false,
      message:
        axiosError.response?.data?.message ||
        "Terjadi kesalahan saat melakukan pengambilan data perusahaan.",
      timestamp: new Date().toISOString(),
      error: axiosError.message || "Unknown error",
    };
  }
};

export const getAllCompanyService = async (): Promise<
  AllCompanyResponse | ErrorResponse
> => {
  const token = localStorage.getItem("access_token");
  try {
    const response = await axiosAdminConfig.get(
      `${baseUrl}/admin/get-all-company?pagination=false`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      }
    );

    if (response.status === 200) {
      return response.data as AllCompanyResponse;
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
