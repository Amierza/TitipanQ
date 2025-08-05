/* eslint-disable @typescript-eslint/no-explicit-any */
import { baseUrl } from '@/config/api';
import axiosAdminConfig from '@/services/auth/auth.config';
import { ErrorResponse } from '@/types/error';
import { AllLockerResponse } from '@/types/locker.type';
import { AxiosError } from 'axios';

export const getAllLockerService = async ({
  page,
  pagination = true,
}: {
  page?: number;
  pagination?: boolean;
} = {}): Promise<AllLockerResponse | ErrorResponse> => {
  const token = localStorage.getItem('access_token');

  try {
    const queryParams = pagination ? `?page=${page || 1}` : `?pagination=false`;

    const response = await axiosAdminConfig.get(
      `${baseUrl}/admin/get-all-locker${queryParams}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      }
    );

    if (response.status === 200) {
      return response.data as AllLockerResponse;
    } else {
      return response.data as ErrorResponse;
    }
  } catch (error) {
    const axiosError = error as AxiosError<any>;

    return {
      status: false,
      message:
        axiosError.response?.data?.message ||
        'Terjadi kesalahan saat melakukan pengambilan data loker.',
      timestamp: new Date().toISOString(),
      error: axiosError.message || 'Unknown error',
    };
  }
};
