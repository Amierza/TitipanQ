/* eslint-disable @typescript-eslint/no-explicit-any */
import { baseUrl } from "@/config/api";
import { ErrorResponse } from "@/types/error";
import { AxiosError } from "axios";
import { z } from "zod";
import { UserSchema } from "@/validation/user.schema";
import { UserResponse } from "@/types/user.type";
import axiosAdminConfig from "@/services/auth/auth.config";

export const updateUserService = async (
  userId: string,
  data: Partial<z.infer<typeof UserSchema>>
): Promise<UserResponse | ErrorResponse> => {
  const token = localStorage.getItem("access_token");
  try {
    const response = await axiosAdminConfig.patch(
      `${baseUrl}/admin/update-user/${userId}`,
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
      return response.data as UserResponse;
    } else {
      return response.data as ErrorResponse;
    }
  } catch (error) {
    const axiosError = error as AxiosError<any>;

    return {
      status: false,
      message:
        axiosError.response?.data?.message ||
        "Terjadi kesalahan saat melakukan pembaruan data user.",
      timestamp: new Date().toISOString(),
      error: axiosError.message || "Unknown error",
    };
  }
};
