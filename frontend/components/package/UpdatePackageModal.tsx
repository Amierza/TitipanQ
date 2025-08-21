/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from '@headlessui/react';
import { Button } from '@/components/ui/button';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getAllPackageWithoutPaginationService } from '@/services/admin/package/getAllPackage';
import { CheckIcon, ChevronDownIcon } from 'lucide-react';
import z from 'zod';
import { UpdateStatusPackagesSchema } from '@/validation/package.schema';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import UpdatePackageCamera from './UpdatePackageCamera';
import { useState } from 'react';
import clsx from 'clsx';
import { toast } from 'sonner';
import { updateStatusPackagesService } from '@/services/admin/package/updateStatusPackages';
import { getAllUserService } from '@/services/admin/user/getAllUser';
// import RecipientForm from '../admin/recipient/RecipientForm';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  selectedPackage: string[];
  onRemove: (packageId: string) => void;
}

type PackageSchemaType = z.infer<typeof UpdateStatusPackagesSchema>;

const UpdateStatusPackageModal = ({
  isOpen,
  onClose,
  selectedPackage,
}: // onRemove,
Props) => {
  // useEffect(() => {
  //   if (isOpen) {
  //     methods.reset({
  //       ...methods.getValues(),
  //       package_ids: selectedPackage,
  //     });
  //   }
  // }, [isOpen, selectedPackage]);

  const queryClient = useQueryClient();
  const [queryUser, setQueryUser] = useState('');
  const methods = useForm<PackageSchemaType>({
    resolver: zodResolver(UpdateStatusPackagesSchema),
    mode: 'onChange',
    defaultValues: {
      package_ids: selectedPackage,
      user_id: '',
      proof_image: undefined,
    },
  });

  const { control, reset, handleSubmit } = methods;

  const { data: packageData } = useQuery({
    queryKey: ['package'],
    queryFn: getAllPackageWithoutPaginationService,
  });

  const { data: userData } = useQuery({
    queryKey: ['user'],
    queryFn: getAllUserService,
  });

  const { mutateAsync: UpdateStatusPackage } = useMutation({
    mutationFn: updateStatusPackagesService,
    onSuccess: (result) => {
      if (result.status) {
        toast.success(result.message);
        reset();
        queryClient.invalidateQueries({ queryKey: ['package'] });
        window.location.reload();
      } else {
        toast.error(result.message || 'Failed to update package status');
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  if (!packageData || !packageData.status)
    return <p>Failed to fetch package data</p>;
  if (!userData || !userData.status) return <p>Failed to fetch user data</p>;

  // const selectedPackageData = Array.isArray(packageData?.data)
  //   ? packageData.data.filter((pkg: Package) =>
  //       selectedPackage.includes(pkg.package_id)
  //     )
  //   : [];

  const cancelUpdate = () => {
    reset();
    onClose();
  };

  const onSubmit = async (data: PackageSchemaType) => {
    if (data.proof_image && !(data.proof_image instanceof File)) {
      return;
    }

    await UpdateStatusPackage(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="z-50">
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <DialogHeader>
              <DialogTitle>Update Status Package</DialogTitle>
            </DialogHeader>

            <FormField
              name="package_ids"
              control={control}
              render={() => (
                <FormItem>
                  <FormControl>
                    <div className="flex flex-col gap-2">
                      {/* {selectedPackageData.map((pkg) => (
                        <div
                          key={pkg.package_id}
                          className="flex gap-2 justify-between"
                        >
                          <div className="flex gap-2 items-center justify-start">
                            <div className="flex flex-col gap-1">
                              <p className="text-sm text-gray-700 truncate">
                                {pkg.package_description}
                              </p>
                            </div>
                          </div>

                          <Button
                            variant="ghost"
                            type="button"
                            className="flex items-center justify-center text-gray-500 cursor-pointer hover:text-red-500"
                            onClick={() => onRemove(pkg.package_id)}
                          >
                            <X />
                          </Button>
                        </div>
                      ))} */}
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              name="proof_image"
              control={control}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <UpdatePackageCamera
                      photo={field.value}
                      onChange={(file) => field.onChange(file)}
                      initialImageUrl={field.value?.name}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="user_id"
              control={control}
              render={({ field }) => {
                const selectedUser =
                  userData.data.find((user) => user.user_id === field.value) ??
                  null;
                return (
                  <FormItem>
                    <FormLabel>Select Client</FormLabel>
                    <Combobox
                      value={selectedUser}
                      onChange={(user) => {
                        field.onChange(user?.user_id ?? '');
                        setQueryUser(user?.user_name ?? '');
                      }}
                    >
                      <div className="relative">
                        <ComboboxInput
                          className="w-full rounded-lg border px-3 py-2 text-sm"
                          displayValue={(user: any) => user?.user_name ?? ''}
                          onChange={(e) => setQueryUser(e.target.value)}
                          placeholder="Search client..."
                        />
                        <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-2">
                          <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                        </ComboboxButton>
                      </div>
                      <ComboboxOptions className="mt-1 max-h-60 overflow-auto rounded-md bg-white py-1 text-sm shadow-lg ring-1 ring-black/5">
                        {userData.data
                          .filter((user) =>
                            user.user_name
                              .toLowerCase()
                              .includes(queryUser.toLowerCase())
                          )
                          .map((user) => (
                            <ComboboxOption
                              key={user.user_id}
                              value={user}
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
                                    {user.user_name}
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

            <div className="flex justify-between items-center pt-4">
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  type="button"
                  className="cursor-pointer"
                  onClick={cancelUpdate}
                >
                  Cancel
                </Button>
                <Button
                  variant="ghost"
                  className="cursor-pointer bg-green-600 hover:bg-green-500 text-white hover:text-white"
                  type="submit"
                  disabled={
                    !methods.formState.isValid || methods.formState.isSubmitting
                  }
                >
                  Update Status
                </Button>
              </div>
            </div>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateStatusPackageModal;
