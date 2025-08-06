import z from 'zod';

export enum PackageType {
  Document = 'document',
  Item = 'item',
  Other = 'other',
}

export enum PackageStatus {
  Received = 'received',
  Completed = 'completed',
  Expired = 'expired',
  Deleted = 'deleted',
}

const phoneNumberRegex = /^(?:\+62|62|0)8[1-9][0-9]{6,10}$/;

export const PackageSchema = z.object({
  package_tracking_code: z
    .string()
    .min(1, 'Kode resi paket tidak boleh kosong'),
  package_description: z
    .string()
    .min(1, { message: 'Deskripsi paket tidak boleh kosong' }),
  package_image: z
    .instanceof(File)
    .refine((file) => file.size > 0, {
      message: 'Gambar tidak boleh kosong',
    })
    .refine((file) => file.size <= 5 * 1024 * 1024, {
      message: 'Ukuran gambar maksimal 5MB',
    }),
  package_type: z.nativeEnum(PackageType, {
    required_error: 'Tipe paket harus diisi',
  }),
  package_quantity: z
    .string()
    .min(1, 'Quantity wajib diisi')
    .regex(
      /^[1-9][0-9]*$/,
      'Quantity harus berupa angka positif tanpa nol di depan'
    ),
  package_sender_name: z.string().min(1, 'Nama pengirim tidak boleh kosong'),
  package_sender_phone_number: z
    .string()
    .regex(phoneNumberRegex, 'Nomer telepon tidak valid'),
  package_sender_address: z.string().min(1, 'Alamat pengirim harus diisi'),
  user_id: z.string().uuid({ message: 'User ID harus berupa UUID yang valid' }),
  locker_id: z
    .string()
    .uuid({ message: 'Locker ID harus berupa UUID yang valid' }),
});

export const UpdatePackageSchema = z.object({
  package_tracking_code: z
    .string()
    .min(1, 'Kode resi paket tidak boleh kosong'),
  package_description: z
    .string()
    .min(1, { message: 'Deskripsi paket tidak boleh kosong' }),
  package_type: z.nativeEnum(PackageType, {
    required_error: 'Tipe paket harus diisi',
  }),
  package_status: z.nativeEnum(PackageStatus, {
    required_error: 'Status paket harus diisi',
  }),
  package_quantity: z
    .string()
    .min(1, 'Quantity wajib diisi')
    .regex(
      /^[1-9][0-9]*$/,
      'Quantity harus berupa angka positif tanpa nol di depan'
    ),
  package_sender_name: z.string().min(1, 'Nama pengirim tidak boleh kosong'),
  package_sender_phone_number: z
    .string()
    .regex(phoneNumberRegex, 'Nomer telepon tidak valid'),
  package_sender_address: z.string().min(1, 'Alamat pengirim harus diisi'),
  user_id: z.string().uuid({ message: 'User ID harus berupa UUID yang valid' }),
});

export const UpdateStatusPackages = z.object({
  package_ids: z
    .array(z.string(), {
      required_error: 'Package IDs wajib ada',
    })
    .min(1, { message: 'Paket yang diperbarui setidaknya berjumlah 1' }),
});
