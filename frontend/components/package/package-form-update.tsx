/* eslint-disable @typescript-eslint/no-explicit-any */
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
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { z } from "zod";
import {
  PackageStatus,
  PackageType,
  UpdatePackageSchema,
} from "@/validation/package.schema";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { updatePackageService } from "@/services/admin/package/updatePackage";
import { getPackageService } from "@/services/admin/package/getDetailPackage";
import { Package } from "lucide-react";
import { imageUrl } from "@/config/api";
import { useRouter } from "next/navigation";

interface PackageFormProps {
  users: { id: string; name: string }[];
  initialPackage?: Partial<PackageSchemaType> & { package_id?: string };
}

type PackageSchemaType = z.infer<typeof UpdatePackageSchema>;

const PackageFormUpdate = ({ users, initialPackage }: PackageFormProps) => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const methods = useForm<PackageSchemaType>({
    resolver: zodResolver(UpdatePackageSchema),
    defaultValues: {
      package_description: initialPackage?.package_description || "",
      package_type: initialPackage?.package_type || PackageType.Document,
      user_id: initialPackage?.user_id || "",
      package_status: initialPackage?.package_status || PackageStatus.Received,
    },
  });

  const { control, handleSubmit } = methods;
  const packageId = initialPackage?.package_id as string;

  const { data: packageData } = useQuery({
    queryKey: ["package", packageId],
    queryFn: () => getPackageService(packageId),
    enabled: !!packageId,
  });

  const getFullImageUrl = (imagePath: string) => {
    if (!imagePath) return "/Images/default_image.jpg";
    return `${imageUrl}/package/${imagePath}`;
  };

  const updateMutation = useMutation({
    mutationFn: (data: { id: string; payload: PackageSchemaType }) =>
      updatePackageService(data.id, data.payload),
    onSuccess: (result) => {
      if (result.status) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
      queryClient.invalidateQueries({ queryKey: ["package"] });
      router.back();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  if (!packageData) return <p>Data tidak ditemukan</p>;
  if (packageData?.status === false) return <p>Gagal fetch data</p>;

  const onSubmit = (data: PackageSchemaType) => {
    const updatedPayload: Partial<PackageSchemaType> = {};

    for (const key in data) {
      const typedKey = key as keyof PackageSchemaType;
      const newValue = data[typedKey];
      const oldValue = initialPackage?.[typedKey];

      if (newValue !== oldValue) {
        if (typedKey === "package_status" && typeof newValue === "string") {
          updatedPayload[typedKey] = newValue as PackageStatus;
        } else if (
          typedKey === "package_type" &&
          typeof newValue === "string"
        ) {
          updatedPayload[typedKey] = newValue as PackageType;
        } else {
          updatedPayload[typedKey] = newValue as any;
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
        <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
          {packageData.data.package_image ? (
            <Image
              src={getFullImageUrl(packageData.data.package_image)}
              alt={`Photo of ${packageData.data.package_description}`}
              width={120}
              height={120}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="h-8 w-8 text-gray-400" />
            </div>
          )}
        </div>

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

        <div className="grid grid-cols-2">
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
                    <SelectItem value={PackageType.Document}>
                      Document
                    </SelectItem>
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
            name="package_status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Package Status</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Package Status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={PackageStatus.Received}>
                      Received
                    </SelectItem>
                    <SelectItem value={PackageStatus.Delivered}>
                      Delivered
                    </SelectItem>
                    <SelectItem value={PackageStatus.Completed}>
                      Completed
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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
