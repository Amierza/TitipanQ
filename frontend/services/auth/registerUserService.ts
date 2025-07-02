/* eslint-disable @typescript-eslint/no-explicit-any */
import { RegisterResponse } from "@/types/auth";
import { ErrorResponse } from "@/types/error";
import { RegisterSchema } from "@/validation/auth.schema";
import { z } from "zod";
import axios, { AxiosError } from "axios";
import { baseUrl } from "@/config/api";

export const registerUserService = async (
  data: z.infer<typeof RegisterSchema>
): Promise<RegisterResponse | ErrorResponse> => {
  try {
    const response = await axios.post(`${baseUrl}/user/register`, data, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.status === 200) {
      return response.data as RegisterResponse;
    } else {
      return response.data as ErrorResponse;
    }
  } catch (error) {
    const axiosError = error as AxiosError<any>;

    return {
      status: false,
      message:
        axiosError.response?.data?.message ||
        "Terjadi kesalahan saat melakukan registrasi.",
      timestamp: new Date().toISOString(),
      error: axiosError.message || "Unknown error",
    };
  }
};
