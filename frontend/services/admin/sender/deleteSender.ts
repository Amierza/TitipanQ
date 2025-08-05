/* eslint-disable @typescript-eslint/no-explicit-any */
import { baseUrl } from '@/config/api';
import axiosAdminConfig from '@/services/auth/auth.config';
import { ErrorResponse } from '@/types/error';
import { SenderResponse } from '@/types/sender.type';
import { AxiosError } from 'axios';

export const deleteSenderService = async (
  senderId: string
): Promise<SenderResponse | ErrorResponse> => {
  const token = localStorage.getItem('access_token');
  try {
    const response = await axiosAdminConfig.delete(
      `${baseUrl}/admin/deleted-sender/${senderId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
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
        'Terjadi kesalahan saat melakukan hapus data sender.',
      timestamp: new Date().toISOString(),
      error: axiosError.message || 'Unknown error',
    };
  }
};
