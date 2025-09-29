/* eslint-disable @typescript-eslint/no-explicit-any */
import { UserEditSchema } from '@/components/user/user-edit-form';
import { baseUrl } from '@/config/api';
import axiosUserConfig from '@/services/auth/axiosUserConfig';
import { ErrorResponse } from '@/types/error';
import { UserResponse } from '@/types/user.type';
import { AxiosError } from 'axios';
import z from 'zod';

export interface UpdateUserPayload {
  user_name: string;
  user_email: string;
  user_password: string;
  user_phone_number: string;
}

export const updateUserProfile = async ({
  data,
}: {
  data: Partial<z.infer<typeof UserEditSchema>>;
}): Promise<UserResponse | ErrorResponse> => {
  const token = localStorage.getItem('access_token');
  try {
    const response = await axiosUserConfig.patch(
      `${baseUrl}/user/update-user`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
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
        'Terjadi kesalahan saat melakukan pembaruan data pengguna.',
      timestamp: new Date().toISOString(),
      error: axiosError.message || 'Unknown error',
    };
  }
};
