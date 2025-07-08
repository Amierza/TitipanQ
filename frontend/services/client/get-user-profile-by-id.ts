// services/client/get-user-profile-by-id.ts
import axiosUserConfig from "@/services/auth/axiosUserConfig";
import { UserResponse } from "@/types/user.type";

export const getUserProfileService = async (): Promise<UserResponse> => {
  const response = await axiosUserConfig.get("/user/get-detail-user");

  if (!response.data?.status) {
    throw new Error(response.data?.message || "Gagal mengambil data user");
  }

  return response.data as UserResponse;
};
