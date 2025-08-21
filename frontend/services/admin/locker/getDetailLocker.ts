/* eslint-disable @typescript-eslint/no-explicit-any */
import { baseUrl } from '@/config/api';
import axiosAdminConfig from '@/services/auth/auth.config';
import { ErrorResponse } from '@/types/error';
import { LockerResponse } from '@/types/locker.type';
import { AxiosError } from 'axios';

export const getDetailLockerService = async ({
  lockerId,
}: {
  lockerId: string;
}): Promise<LockerResponse | ErrorResponse> => {
  const token = localStorage.getItem('access_token');

  try {
    const response = await axiosAdminConfig.get(
      `${baseUrl}/admin/get-detail-locker/${lockerId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      }
    );

    if (response.status === 200) {
      return response.data as LockerResponse;
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
