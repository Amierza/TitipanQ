/* eslint-disable @typescript-eslint/no-explicit-any */
import { baseUrl } from '@/config/api';
import axiosAdminConfig from '@/services/auth/auth.config';
import { ErrorResponse } from '@/types/error';
import { AllRecipientResponse } from '@/types/recipient.type';
import { AxiosError } from 'axios';

export const getAllRecipientService = async ({
  page,
  pagination = true,
}: {
  page?: number;
  pagination?: boolean;
} = {}): Promise<AllRecipientResponse | ErrorResponse> => {
  const token = localStorage.getItem('access_token');

  try {
    const queryParams = pagination ? `?page=${page || 1}` : `?pagination=false`;

    const response = await axiosAdminConfig.get(
      `${baseUrl}/admin/get-all-recipients${queryParams}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      }
    );

    if (response.status === 200) {
      return response.data as AllRecipientResponse;
    } else {
      return response.data as ErrorResponse;
    }
  } catch (error) {
    const axiosError = error as AxiosError<any>;

    return {
      status: false,
      message:
        axiosError.response?.data?.message ||
        'Terjadi kesalahan saat melakukan pengambilan data penerima.',
      timestamp: new Date().toISOString(),
      error: axiosError.message || 'Unknown error',
    };
  }
};
