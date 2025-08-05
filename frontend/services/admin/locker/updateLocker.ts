/* eslint-disable @typescript-eslint/no-explicit-any */
import { baseUrl } from '@/config/api';
import { ErrorResponse } from '@/types/error';
import { AxiosError } from 'axios';
import { z } from 'zod';
import axiosAdminConfig from '@/services/auth/auth.config';
import { LockerSchema } from '@/validation/locker.schema';
import { LockerResponse } from '@/types/locker.type';

export const updateLockerService = async ({
  lockerId,
  data,
}: {
  lockerId: string;
  data: Partial<z.infer<typeof LockerSchema>>;
}): Promise<LockerResponse | ErrorResponse> => {
  const token = localStorage.getItem('access_token');
  try {
    const response = await axiosAdminConfig.patch(
      `${baseUrl}/admin/update-locker/${lockerId}`,
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
        'Terjadi kesalahan saat melakukan pembaruan data loker.',
      timestamp: new Date().toISOString(),
      error: axiosError.message || 'Unknown error',
    };
  }
};
