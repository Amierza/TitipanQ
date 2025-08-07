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
import { Sender } from '@/types/sender.type';
import { SenderSchema } from '@/validation/sender.schema';
import { createSenderService } from '@/services/admin/sender/createSender';
import { updateSenderService } from '@/services/admin/sender/updateSender';

interface SenderFormProps {
  isOpen: boolean;
  onClose: () => void;
  sender: Sender | null;
}

const SenderForm = ({ isOpen, onClose, sender }: SenderFormProps) => {
  const queryClient = useQueryClient();
  const form = useForm<z.infer<typeof SenderSchema>>({
    resolver: zodResolver(SenderSchema),
    mode: 'onChange',
    defaultValues: {
      sender_name: sender?.sender_name || '',
      sender_phone_number: sender?.sender_phone_number || '',
      sender_address: sender?.sender_address || '',
    },
  });

  const { mutate: createSender, isPending: isCreating } = useMutation({
    mutationFn: createSenderService,
    onSuccess: (result) => {
      if (result.status) {
        toast.success(result.message);
        queryClient.invalidateQueries({ queryKey: ['sender'] });
        onClose();
      } else {
        toast.error(result.message);
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const { mutate: updateSender, isPending: isUpdating } = useMutation({
    mutationFn: updateSenderService,
    onSuccess: (result) => {
      if (result.status) {
        toast.success(result.message);
        queryClient.invalidateQueries({ queryKey: ['sender'] });
        onClose();
      } else {
        toast.error(result.message);
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = (values: z.infer<typeof SenderSchema>) => {
    if (sender?.sender_id) {
      const diff = Object.fromEntries(
        Object.entries(values).filter(
          ([key, val]) => val !== (sender as any)[key]
        )
      ) as Partial<typeof values>;

      updateSender({ senderId: sender.sender_id, data: diff });
    } else {
      createSender(values);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{sender ? 'Edit Sender' : 'Add New Sender'}</DialogTitle>
        </DialogHeader>
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="sender_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Joko Susilo" type="text" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sender_address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="jokosusilo@gmail.com"
                      type="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sender_phone_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="08**********" type="tel" {...field} />
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
                {sender ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
};

export default SenderForm;
