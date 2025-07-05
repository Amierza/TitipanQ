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
import { PackageSchema, PackageType } from "@/validation/package.schema";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createPackageService } from "@/services/admin/package/createPackage";
import { toast } from "sonner";

interface PackageFormProps {
  users: { id: string; name: string }[];
}

type PackageSchemaType = z.infer<typeof PackageSchema>;

export default function PackageForm({ users }: PackageFormProps) {
  const methods = useForm<PackageSchemaType>({
    resolver: zodResolver(PackageSchema),
    defaultValues: {
      package_description: "",
      package_type: PackageType.Document,
      package_image: undefined as unknown as File,
      user_id: "",
    },
  });

  const { control, handleSubmit, watch, reset } = methods;
  const image = watch("package_image");

  const onSubmit = async (data: PackageSchemaType) => {
    const result = await createPackageService(data);

    if (result.status === true) {
      toast.success(result.message);
      reset();
    } else {
      toast.error(result.error);
    }
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
}
