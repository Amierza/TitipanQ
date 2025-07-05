import z from "zod";

export enum PackageType {
  Document = "document",
  Item = "item",
  Other = "other",
}

export const PackageSchema = z.object({
  package_description: z
    .string()
    .min(1, { message: "Deskripsi paket tidak boleh kosong" }),
  package_image: z
    .instanceof(File)
    .refine((file) => file.size > 0, {
      message: "Gambar tidak boleh kosong",
    })
    .refine((file) => file.size <= 5 * 1024 * 1024, {
      message: "Ukuran gambar maksimal 5MB",
    }),
  package_type: z.nativeEnum(PackageType, {
    required_error: "Tipe paket harus diisi",
  }),
  user_id: z.string().uuid({ message: "User ID harus berupa UUID yang valid" }),
});
