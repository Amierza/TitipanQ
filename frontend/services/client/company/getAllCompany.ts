/* eslint-disable @typescript-eslint/no-explicit-any */
import { baseUrl } from "@/config/api";
import { AllCompanyResponse } from "@/types/company.type";
import { ErrorResponse } from "@/types/error";
import axios, { AxiosError } from "axios";

export const getAllCompanyClientService = async (): Promise<
  AllCompanyResponse | ErrorResponse
> => {
  try {
    const response = await axios.get(`${baseUrl}/user/get-all-company`, {
      headers: {
        Accept: "application/json",
      },
    });

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
        "Terjadi kesalahan saat melakukan pengambilan data company.",
      timestamp: new Date().toISOString(),
      error: axiosError.message || "Unknown error",
    };
  }
};
