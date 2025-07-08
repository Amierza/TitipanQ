// services/client/update-user.ts
import axiosUserConfig from "@/services/auth/axiosUserConfig";

export interface UpdateUserPayload {
  user_name: string;
  user_email: string;
  user_password: string;
  user_phone_number: string;
  user_address: string;
  company_id: string;
}

export async function updateUserProfile(payload: UpdateUserPayload) {
  const response = await axiosUserConfig.patch("/user/update-user", payload);
  return response.data;
}
