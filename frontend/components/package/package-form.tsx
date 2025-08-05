'use client';

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from '@headlessui/react';
import { CheckIcon, ChevronDownIcon } from '@heroicons/react/20/solid';
import clsx from 'clsx';
import UploadPackagePhoto from './package-upload-photo';
import { z } from 'zod';
import { PackageSchema, PackageType } from '@/validation/package.schema';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createPackageService } from '@/services/admin/package/createPackage';
import { toast } from 'sonner';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';

interface PackageFormProps {
  users: { id: string; name: string }[];
  initialPackage?: Partial<PackageSchemaType> & { package_id?: string };
}

type PackageSchemaType = z.infer<typeof PackageSchema>;

export default function PackageForm({
  users,
  initialPackage,
}: PackageFormProps) {
  const [query, setQuery] = useState<string>('');
  const router = useRouter();
  const methods = useForm<PackageSchemaType>({
    resolver: zodResolver(PackageSchema),
    mode: 'onChange',
    defaultValues: {
      package_sender_name: initialPackage?.package_sender_name || '',
      package_sender_phone_number:
        initialPackage?.package_sender_phone_number || '',
      package_sender_address: initialPackage?.package_sender_address || '',
      package_tracking_code: initialPackage?.package_tracking_code || '',
      package_quantity: initialPackage?.package_quantity || '',
      package_description: initialPackage?.package_description || '',
      package_type: initialPackage?.package_type || PackageType.Document,
      package_image: undefined as unknown as File,
      user_id: initialPackage?.user_id || '',
    },
  });

  const { control, handleSubmit, watch, reset, setValue } = methods;

  const handleTrackingCode = (value?: string) => {
    setValue('package_tracking_code', value || '');
  };

  const image = watch('package_image');

  const { mutate: createMutation } = useMutation({
    mutationFn: createPackageService,
    onSuccess: (result) => {
      if (result.status) {
        toast.success(result.message);
        reset();
        router.push('/admin/package');
      } else {
        toast.error(result.message);
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // const handleDownloadImage = async (imageName?: string) => {
  //   if (!imageName) {
  //     toast.error("No image available");
  //     return;
  //   }

  //   try {
  //     const url = imageName.startsWith("http")
  //       ? imageName
  //       : `${imageUrl}/barcode/${imageName}`;

  //     const res = await fetch(url, { mode: "cors" });
  //     if (!res.ok) throw new Error("Failed to fetch image");

  //     const blob = await res.blob();
  //     saveAs(blob, imageName.replace(/.*[\\/]/, "") || "barcode.png");
  //   } catch (err) {
  //     console.error(err);
  //     toast.error("Download failed");
  //   }
  // }

  const onSubmit = (data: PackageSchemaType) => {
    createMutation(data);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="p-4 border border-gray-300 rounded-lg space-y-3">
          <h3 className="font-semibold text-sm">Sender</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                name="package_sender_name"
                control={control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Write sender name here..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="package_sender_phone_number"
                control={control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="08***********" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              name="package_sender_address"
              control={control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Write sender address here..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="p-4 border border-gray-300 rounded-lg space-y-3">
          <h3 className="font-semibold text-sm">Package</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <FormField
              name="package_image"
              control={control}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <UploadPackagePhoto
                      photo={image}
                      onChange={(file) => field.onChange(file)}
                      initialImageUrl={
                        typeof initialPackage?.package_image === 'string'
                          ? initialPackage.package_image
                          : undefined
                      }
                      onChangeValue={handleTrackingCode}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="package_tracking_code"
              control={control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tracking Code</FormLabel>
                  <FormControl>
                    <Input placeholder="PACK******" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            name="user_id"
            control={control}
            render={({ field }) => {
              const selectedUser =
                users.find((u) => u.id === field.value) ?? null;
              return (
                <FormItem>
                  <FormLabel>Select user</FormLabel>
                  <Combobox
                    value={selectedUser}
                    onChange={(user) => {
                      field.onChange(user?.id ?? '');
                      setQuery(user?.name ?? '');
                    }}
                  >
                    <div className="relative">
                      <ComboboxInput
                        className="w-full rounded-lg border px-3 py-2 text-sm"
                        displayValue={(
                          user: { id: string; name: string } | null
                        ) => user?.name ?? ''}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search user…"
                      />
                      <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-2">
                        <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                      </ComboboxButton>
                    </div>
                    <ComboboxOptions className="mt-1 max-h-60 overflow-auto rounded-md bg-white py-1 text-sm shadow-lg ring-1 ring-black/5">
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
                                'relative cursor-pointer select-none py-2 pl-10 pr-4',
                                active
                                  ? 'bg-blue-100 text-blue-900'
                                  : 'text-gray-900'
                              )
                            }
                          >
                            {({ selected }) => (
                              <>
                                <span
                                  className={clsx(
                                    'block truncate',
                                    selected && 'font-medium'
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            <FormField
              name="package_type"
              control={control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Package Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl className="w-full">
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
              name="package_quantity"
              control={control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Write quantity of package here..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            name="package_description"
            control={control}
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
        </div>

        <Button
          className="cursor-pointer"
          disabled={
            !methods.formState.isValid || methods.formState.isSubmitting
          }
          type="submit"
        >
          {methods.formState.isSubmitting ? 'Loading...' : 'Submit'}
        </Button>
      </form>
    </FormProvider>
  );
}
