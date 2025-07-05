/* eslint-disable @typescript-eslint/no-explicit-any */
import { baseUrl } from "@/config/api";
import { ErrorResponse } from "@/types/error";
import { UserResponse } from "@/types/user.type";
import axios, { AxiosError } from "axios";

export const getDetailUserService = async (
  userId: string
): Promise<UserResponse | ErrorResponse> => {
  const token = localStorage.getItem("access_token");
  try {
    const response = await axios.get(
      `${baseUrl}/admin/get-detail-user/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
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
        "Terjadi kesalahan saat melakukan pengambilan data user.",
      timestamp: new Date().toISOString(),
      error: axiosError.message || "Unknown error",
    };
  }
};
