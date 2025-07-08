"use client";

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import UploadPackagePhoto from "./package-upload-photo";
import { z } from "zod";
import { PackageType, UpdatePackageSchema } from "@/validation/package.schema";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useMutation, useQuery } from "@tanstack/react-query";
import { updatePackageService } from "@/services/admin/package/updatePackage";
import { getPackageService } from "@/services/admin/package/getDetailPackage";
import { imageUrl } from "@/config/api";

interface PackageFormProps {
  users: { id: string; name: string }[];
  initialPackage?: Partial<PackageSchemaType> & { package_id?: string };
}

type PackageSchemaType = z.infer<typeof UpdatePackageSchema>;

const PackageFormUpdate = ({ users, initialPackage }: PackageFormProps) => {
  const methods = useForm<PackageSchemaType>({
    resolver: zodResolver(UpdatePackageSchema),
    defaultValues: {
      package_description: initialPackage?.package_description || "",
      package_type: initialPackage?.package_type || PackageType.Document,
      user_id: initialPackage?.user_id || "",
      package_status: initialPackage?.package_status,
    },
  });

  const { control, handleSubmit, watch } = methods;
  const image = watch("package_image");
  const packageId = initialPackage?.package_id as string;

  const { data: packageData } = useQuery({
    queryKey: ["package", packageId],
    queryFn: () => getPackageService(packageId),
  });

  console.log("Package Data : ", packageData);
  if (packageData?.status === true) {
    const initialImageUrl = `${imageUrl}/package/${packageData.data.package_image}`;
    console.log("Image : ", initialImageUrl);
  }

  const updateMutation = useMutation({
    mutationFn: (data: { id: string; payload: PackageSchemaType }) =>
      updatePackageService(data.id, data.payload),
    onSuccess: (result) => {
      toast.success(result.message);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = (data: PackageSchemaType) => {
    const updatedPayload: Partial<PackageSchemaType> = {};

    for (const key in data) {
      const typedKey = key as keyof PackageSchemaType;
      const newValue = data[typedKey];
      const oldValue = initialPackage![typedKey];

      const isFileField = typedKey === "package_image";
      if (isFileField) {
        if (newValue instanceof File && newValue.size > 0) {
          updatedPayload[typedKey] =
            newValue as PackageSchemaType[typeof typedKey];
        }
      } else if (newValue !== oldValue) {
        if (typedKey === "package_type") {
          updatedPayload[typedKey] = newValue as PackageType;
        } else {
          updatedPayload[typedKey] =
            newValue as PackageSchemaType[typeof typedKey];
        }
      }
    }

    if (Object.keys(updatedPayload).length === 0) {
      toast.info("Tidak ada perubahan");
      return;
    }

    updateMutation.mutate({
      id: packageId,
      payload: updatedPayload as PackageSchemaType,
    });
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={control}
          name="package_image"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <UploadPackagePhoto
                  photo={image}
                  onChange={(file) => field.onChange(file)}
                  initialImageUrl={
                    typeof initialPackage?.package_image === "string"
                      ? initialPackage.package_image
                      : undefined
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="user_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Select User</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih pengguna" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="package_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Package Type</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Package Type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={PackageType.Document}>Document</SelectItem>
                  <SelectItem value={PackageType.Item}>Item</SelectItem>
                  <SelectItem value={PackageType.Other}>Other</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="package_description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Write package description here..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          disabled={
            !methods.formState.isValid || methods.formState.isSubmitting
          }
          type="submit"
        >
          {methods.formState.isSubmitting ? "Loading..." : "Submit"}
        </Button>
      </form>
    </FormProvider>
  );
};

export default PackageFormUpdate;
