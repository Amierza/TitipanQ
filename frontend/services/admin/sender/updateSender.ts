/* eslint-disable @typescript-eslint/no-explicit-any */
import { baseUrl } from '@/config/api';
import { ErrorResponse } from '@/types/error';
import { AxiosError } from 'axios';
import { z } from 'zod';
import axiosAdminConfig from '@/services/auth/auth.config';
import { SenderSchema } from '@/validation/sender.schema';
import { SenderResponse } from '@/types/sender.type';

export const updateSenderService = async ({
  senderId,
  data,
}: {
  senderId: string;
  data: Partial<z.infer<typeof SenderSchema>>;
}): Promise<SenderResponse | ErrorResponse> => {
  const token = localStorage.getItem('access_token');
  try {
    const response = await axiosAdminConfig.patch(
      `${baseUrl}/admin/update-sender/${senderId}`,
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
      return response.data as SenderResponse;
    } else {
      return response.data as ErrorResponse;
    }
  } catch (error) {
    const axiosError = error as AxiosError<any>;

    return {
      status: false,
      message:
        axiosError.response?.data?.message ||
        'Terjadi kesalahan saat melakukan pembaruan data sender.',
      timestamp: new Date().toISOString(),
      error: axiosError.message || 'Unknown error',
    };
  }
};
