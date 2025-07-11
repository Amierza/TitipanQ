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
import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from "@headlessui/react";
import { CheckIcon, ChevronDownIcon } from "@heroicons/react/20/solid";
import clsx from "clsx";
import UploadPackagePhoto from "./package-upload-photo";
import { z } from "zod";
import { PackageSchema, PackageType } from "@/validation/package.schema";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createPackageService } from "@/services/admin/package/createPackage";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { updatePackageService } from "@/services/admin/package/updatePackage";
import { useState } from "react";

interface PackageFormProps {
  users: { id: string; name: string }[];
  initialPackage?: Partial<PackageSchemaType> & { package_id?: string };
}

type PackageSchemaType = z.infer<typeof PackageSchema>;

export default function PackageForm({
  users,
  initialPackage,
}: PackageFormProps) {
  const [query, setQuery] = useState<string>("");
  const methods = useForm<PackageSchemaType>({
    resolver: zodResolver(PackageSchema),
    defaultValues: {
      package_description: initialPackage?.package_description || "",
      package_type: initialPackage?.package_type || PackageType.Document,
      package_image: undefined as unknown as File,
      user_id: initialPackage?.user_id || "",
    },
  });

  const { control, handleSubmit, watch, reset } = methods;
  const image = watch("package_image");

  const createMutation = useMutation({
    mutationFn: createPackageService,
    onSuccess: (result) => {
      if (result.status) {
        toast.success(result.message);
        reset();
      } else {
        toast.error(result.message);
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  console.log(initialPackage?.package_image);

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
    if (initialPackage?.package_id) {
      const updatedPayload: Partial<PackageSchemaType> = {};

      for (const key in data) {
        const typedKey = key as keyof PackageSchemaType;
        const newValue = data[typedKey];
        const oldValue = initialPackage[typedKey];

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
        id: initialPackage.package_id,
        payload: updatedPayload as PackageSchemaType,
      });
    } else {
      createMutation.mutate(data);
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
          render={({ field }) => {
            const selectedUser =
              users.find((u) => u.id === field.value) ?? null;

            return (
              <FormItem>
                <FormLabel>Select user</FormLabel>

                <Combobox<{ id: string; name: string } | null>
                  value={selectedUser}
                  onChange={(user) => {
                    field.onChange(user?.id ?? "");
                    setQuery(user?.name ?? "");
                  }}
                >
                  <div className="relative">
                    <ComboboxInput
                      className="w-full rounded-lg border px-3 py-2 text-sm"
                      displayValue={(
                        user: { id: string; name: string } | null
                      ) => (user ? user.name : "")}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search user…"
                    />
                    <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-2">
                      <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                    </ComboboxButton>
                  </div>

                  {/* List */}
                  <ComboboxOptions className="mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-sm shadow-lg ring-1 ring-black/5 focus:outline-none">
                    {users
                      .filter((u) =>
                        u.name.toLowerCase().includes(query.toLowerCase())
                      )
                      .map((u) => (
                        <ComboboxOption
                          key={u.id}
                          value={u}
                          className={({ active }) =>
                            clsx(
                              "relative cursor-pointer select-none py-2 pl-10 pr-4",
                              active
                                ? "bg-blue-100 text-blue-900"
                                : "text-gray-900"
                            )
                          }
                        >
                          {({ selected }) => (
                            <>
                              <span
                                className={clsx(
                                  "block truncate",
                                  selected && "font-medium"
                                )}
                              >
                                {u.name}
                              </span>
                              {selected && (
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                                  <CheckIcon className="h-5 w-5" />
                                </span>
                              )}
                            </>
                          )}
                        </ComboboxOption>
                      ))}
                  </ComboboxOptions>
                </Combobox>

                <FormMessage />
              </FormItem>
            );
          }}
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
