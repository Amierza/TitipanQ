/* eslint-disable @typescript-eslint/no-explicit-any */
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
import Image from 'next/image';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { z } from 'zod';
import {
  PackageStatus,
  PackageType,
  UpdatePackageSchema,
} from '@/validation/package.schema';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { updatePackageService } from '@/services/admin/package/updatePackage';
import { getPackageService } from '@/services/admin/package/getDetailPackage';
import { CheckIcon, ChevronDownIcon, Package } from 'lucide-react';
import { imageUrl } from '@/config/api';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from '@headlessui/react';
import clsx from 'clsx';
import { useEffect, useState } from 'react';

interface PackageFormProps {
  users: { id: string; name: string }[];
  lockers: { id: string; locker_number: string }[];
  initialPackage?: Partial<PackageSchemaType> & { package_id?: string };
}

type PackageSchemaType = z.infer<typeof UpdatePackageSchema>;

const PackageFormUpdate = ({
  users,
  lockers,
  initialPackage,
}: PackageFormProps) => {
  const [userQuery, setUserQuery] = useState('');
  const [lockerQuery, setLockerQuery] = useState('');
  const queryClient = useQueryClient();
  const router = useRouter();
  const methods = useForm<PackageSchemaType>({
    resolver: zodResolver(UpdatePackageSchema),
    defaultValues: {
      package_sender_name: initialPackage?.package_sender_name || '',
      package_sender_phone_number:
        initialPackage?.package_sender_phone_number || '',
      package_sender_address: initialPackage?.package_sender_address || '',
      package_tracking_code: initialPackage?.package_tracking_code || '',
      package_quantity: initialPackage?.package_quantity || '',
      package_description: initialPackage?.package_description || '',
      package_type: initialPackage?.package_type || PackageType.Document,
      user_id: initialPackage?.user_id || '',
      locker_id: initialPackage?.locker_id || '',
      package_status: initialPackage?.package_status || PackageStatus.Received,
    },
  });

  const { control, handleSubmit } = methods;
  const packageId = initialPackage?.package_id as string;

  const { data: packageData } = useQuery({
    queryKey: ['package', packageId],
    queryFn: () => getPackageService(packageId),
    enabled: !!packageId,
  });

  const getFullImageUrl = (imagePath: string) => {
    if (!imagePath) return '/Images/default_image.jpg';
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
      queryClient.invalidateQueries({ queryKey: ['package'] });
      router.back();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  useEffect(() => {
    if (packageData?.status) {
      methods.reset({
        package_sender_name: packageData.data.package_sender_name ?? '',
        package_sender_phone_number:
          packageData.data.package_sender_phone_number ?? '',
        package_sender_address: packageData.data.package_sender_address ?? '',
        package_tracking_code: packageData.data.package_tracking_code ?? '',
        package_quantity: packageData.data.package_quantity.toString() ?? '',
        package_description: packageData.data.package_description ?? '',
        user_id: packageData.data.user?.user_id ?? '',
        package_type:
          (packageData.data.package_type as PackageType) ??
          PackageType.Document,
        package_status:
          (packageData.data.package_status as PackageStatus) ??
          PackageStatus.Received,
      });
    }
  }, [packageData, methods]);

  if (!packageData) return <p>Data tidak ditemukan</p>;
  if (packageData?.status === false) return <p>Gagal fetch data</p>;

  const onSubmit = (data: PackageSchemaType) => {
    const updatedPayload: Partial<PackageSchemaType> = {};

    for (const key in data) {
      const typedKey = key as keyof PackageSchemaType;
      const newValue = data[typedKey];
      const oldValue = initialPackage?.[typedKey];

      if (newValue !== oldValue) {
        if (typedKey === 'package_status' && typeof newValue === 'string') {
          updatedPayload[typedKey] = newValue as PackageStatus;
        } else if (
          typedKey === 'package_type' &&
          typeof newValue === 'string'
        ) {
          updatedPayload[typedKey] = newValue as PackageType;
        } else {
          updatedPayload[typedKey] = newValue as any;
        }
      }
    }

    if (Object.keys(updatedPayload).length === 0) {
      toast.info('Tidak ada perubahan');
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
            {packageData.data.package_image ? (
              <div className="space-y-1">
                <p className="font-semibold">Image</p>
                <Image
                  src={getFullImageUrl(packageData.data.package_image)}
                  alt={`Photo of ${packageData.data.package_description}`}
                  width={120}
                  height={120}
                  className="w-fit object-cover"
                />
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="h-8 w-8 text-gray-400" />
              </div>
            )}

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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
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
                        setUserQuery(user?.name ?? '');
                      }}
                    >
                      <div className="relative">
                        <ComboboxInput
                          className="w-full rounded-lg border px-3 py-2 text-sm"
                          displayValue={(
                            user: { id: string; name: string } | null
                          ) => user?.name ?? ''}
                          onChange={(e) => setUserQuery(e.target.value)}
                          placeholder="Search user…"
                        />
                        <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-2">
                          <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                        </ComboboxButton>
                      </div>
                      <ComboboxOptions className="mt-1 max-h-60 overflow-auto rounded-md bg-white py-1 text-sm shadow-lg ring-1 ring-black/5">
                        {users
                          .filter((u) =>
                            u.name
                              .toLowerCase()
                              .includes(userQuery.toLowerCase())
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

            <FormField
              name="locker_id"
              control={control}
              render={({ field }) => {
                const selectedLocker =
                  lockers.find((u) => u.id === field.value) ?? null;
                return (
                  <FormItem>
                    <FormLabel>Select locker</FormLabel>
                    <Combobox
                      value={selectedLocker}
                      onChange={(locker) => {
                        field.onChange(locker?.id ?? '');
                        setLockerQuery(locker?.locker_number ?? '');
                      }}
                    >
                      <div className="relative">
                        <ComboboxInput
                          className="w-full rounded-lg border px-3 py-2 text-sm"
                          displayValue={(
                            locker: { id: string; locker_number: string } | null
                          ) => locker?.locker_number ?? ''}
                          onChange={(e) => setLockerQuery(e.target.value)}
                          placeholder="Search locker…"
                        />
                        <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-2">
                          <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                        </ComboboxButton>
                      </div>
                      <ComboboxOptions className="mt-1 max-h-60 overflow-auto rounded-md bg-white py-1 text-sm shadow-lg ring-1 ring-black/5">
                        {lockers
                          .filter((locker) =>
                            locker.locker_number
                              .toLowerCase()
                              .includes(lockerQuery.toLowerCase())
                          )
                          .map((locker) => (
                            <ComboboxOption
                              key={locker.id}
                              value={locker}
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
                                    {locker.locker_number}
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
          </div>

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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            <FormField
              control={control}
              name="package_type"
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
              control={control}
              name="package_status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Package Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl className="w-full">
                      <SelectTrigger>
                        <SelectValue placeholder="Select Package Status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={PackageStatus.Received}>
                        Received
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
        </div>

        <Button
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
};

export default PackageFormUpdate;
