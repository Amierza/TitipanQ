/* eslint-disable @typescript-eslint/no-explicit-any */
import { ErrorResponse } from "@/types/error";
import { z } from "zod";
import axios, { AxiosError } from "axios";
import { baseUrl } from "@/config/api";
import { LoginResponse } from "@/types/auth";
import { LoginSchema } from "@/validation/auth.schema";

export const loginUserService = async (
  data: z.infer<typeof LoginSchema>
): Promise<LoginResponse | ErrorResponse> => {
  try {
    const response = await axios.post(`${baseUrl}/user/login`, data, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.status === 200) {
      const successResponse = response.data as LoginResponse;
      localStorage.setItem("access_token", successResponse.data.access_token);
      localStorage.setItem("refresh_token", successResponse.data.refresh_token);
      return response.data as LoginResponse;
    } else {
      return response.data as ErrorResponse;
    }
  } catch (error) {
    const axiosError = error as AxiosError<any>;

    return {
      status: false,
      message:
        axiosError.response?.data?.message ||
        "Terjadi kesalahan saat melakukan login.",
      timestamp: new Date().toISOString(),
      error: axiosError.message || "Unknown error",
    };
  }
};
