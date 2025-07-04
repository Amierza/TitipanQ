import z from "zod";

export enum PackageType {
  Document = "document",
  Item = "item",
  Other = "other",
}

export const CreatePackageSchema = z.object({
  package_description: z
    .string()
    .min(1, { message: "Deskripsi paket tidak boleh kosong" }),
  package_image: z
    .string()
    .url({ message: "Gambar paket harus berupa URL yang valid" }),
  package_type: z.nativeEnum(PackageType, {
    required_error: "Tipe paket harus diisi",
  }),
  user_id: z.string().uuid({ message: "User ID harus berupa UUID yang valid" }),
});
