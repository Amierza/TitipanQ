import axiosUserConfig from "@/services/auth/axiosUserConfig";
import { PackageHistoryItem, PackageHistoryResponse } from "@/types/package-history";
import { AxiosError } from "axios";

// Fungsi utama ambil histori 1 paket
export const getUserPackageHistory = async (
  packageId: string
): Promise<PackageHistoryItem[]> => {
  try {
    const response = await axiosUserConfig.get<PackageHistoryResponse>(
      `/user/get-all-package-history/${packageId}`
    );

    // Validasi status false dari backend
    if (!response.data.status) {
      throw new Error(response.data.message || "Gagal mengambil histori paket");
    }

    // Kembalikan hanya array histori
    return response.data.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error("❌ Error fetching package history:", axiosError.message);

    // Bisa diintegrasikan juga dengan toast / error boundary
    throw new Error("Terjadi kesalahan saat mengambil histori paket.");
  }
};
