/* eslint-disable @typescript-eslint/no-explicit-any */
import { baseUrl } from '@/config/api';
import axiosAdminConfig from '@/services/auth/auth.config';
import { ErrorResponse } from '@/types/error';
import { RecipientResponse } from '@/types/recipient.type';
import { RecipientSchema } from '@/validation/recipient.schema';
import { AxiosError } from 'axios';
import { z } from 'zod';

export const createRecipientService = async (
  data: z.infer<typeof RecipientSchema>
): Promise<RecipientResponse | ErrorResponse> => {
  const token = localStorage.getItem('access_token');
  try {
    const response = await axiosAdminConfig.post(
      `${baseUrl}/admin/create-recipient`,
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
      return response.data as RecipientResponse;
    } else {
      return response.data as ErrorResponse;
    }
  } catch (error) {
    const axiosError = error as AxiosError<any>;

    return {
      status: false,
      message:
        axiosError.response?.data?.message ||
        'Terjadi kesalahan saat melakukan pembuatan data penerima.',
      timestamp: new Date().toISOString(),
      error: axiosError.message || 'Unknown error',
    };
  }
};
