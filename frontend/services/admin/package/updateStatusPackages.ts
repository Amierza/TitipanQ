/* eslint-disable @typescript-eslint/no-explicit-any */
import { baseUrl } from '@/config/api';
import { ErrorResponse } from '@/types/error';
import { AxiosError } from 'axios';
import axiosAdminConfig from '@/services/auth/auth.config';
import { SuccessResponse } from '@/types/sucess';
import z from 'zod';
import { UpdateStatusPackagesSchema } from '@/validation/package.schema';

export const updateStatusPackagesService = async (
  data: z.infer<typeof UpdateStatusPackagesSchema>
): Promise<SuccessResponse | ErrorResponse> => {
  const token = localStorage.getItem('access_token');

  try {
    const formData = new FormData();

    // 🧠 Append array tanpa "[]"
    data.package_ids.forEach((id) => {
      formData.append('package_ids', id);
    });

    if (data.proof_image) {
      formData.append('proof_image', data.proof_image);
    }

    formData.append('recipient_id', data.recipient_id);

    const response = await axiosAdminConfig.patch(
      `${baseUrl}/admin/update-status-packages`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      }
    );

    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<any>;

    return {
      status: false,
      message:
        axiosError.response?.data?.message ||
        'Terjadi kesalahan saat melakukan pembaruan status data paket.',
      timestamp: new Date().toISOString(),
      error: axiosError.message || 'Unknown error',
    };
  }
};
