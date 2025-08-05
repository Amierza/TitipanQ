/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Locker } from '@/types/locker.type';
import { LockerSchema } from '@/validation/locker.schema';
import { createLockerService } from '@/services/admin/locker/createLocker';
import { updateLockerService } from '@/services/admin/locker/updateLocker';

interface LockerFormProps {
  isOpen: boolean;
  onClose: () => void;
  locker: Locker | null;
}

const LockerForm = ({ isOpen, onClose, locker }: LockerFormProps) => {
  const queryClient = useQueryClient();
  const form = useForm<z.infer<typeof LockerSchema>>({
    resolver: zodResolver(LockerSchema),
    mode: 'onChange',
    defaultValues: {
      locker_code: locker?.locker_code || '',
      location: locker?.location || '',
    },
  });

  const { mutate: createLocker, isPending: isCreating } = useMutation({
    mutationFn: createLockerService,
    onSuccess: (result) => {
      if (result.status) {
        toast.success(result.message);
        queryClient.invalidateQueries({ queryKey: ['locker'] });
        onClose();
      } else {
        toast.error(result.message);
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const { mutate: updateLocker, isPending: isUpdating } = useMutation({
    mutationFn: updateLockerService,
    onSuccess: (result) => {
      if (result.status) {
        toast.success(result.message);
        queryClient.invalidateQueries({ queryKey: ['locker'] });
        onClose();
      } else {
        toast.error(result.message);
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = (values: z.infer<typeof LockerSchema>) => {
    if (locker?.locker_code) {
      const diff = Object.fromEntries(
        Object.entries(values).filter(
          ([key, val]) => val !== (locker as any)[key]
        )
      ) as Partial<typeof values>;

      updateLocker({ lockerId: locker.locker_id, data: diff });
    } else {
      createLocker(values);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{locker ? 'Edit Sender' : 'Add New Sender'}</DialogTitle>
        </DialogHeader>
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="locker_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Locker Number</FormLabel>
                  <FormControl>
                    <Input placeholder="101" type="text" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="Main Lobby" type="text" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Button
                disabled={isCreating || isUpdating || !form.formState.isValid}
                type="submit"
                className="cursor-pointer"
              >
                {locker ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
};

export default LockerForm;
