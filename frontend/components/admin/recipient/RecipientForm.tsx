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
import { Recipient } from '@/types/recipient.type';
import { RecipientSchema } from '@/validation/recipient.schema';
import { updateRecipientService } from '@/services/admin/recipient/updateRecipient';
import { createRecipientService } from '@/services/admin/recipient/createRecipient';

interface SenderFormProps {
  isOpen: boolean;
  onClose: () => void;
  recipient: Recipient | null;
}

const RecipientForm = ({ isOpen, onClose, recipient }: SenderFormProps) => {
  const queryClient = useQueryClient();
  const form = useForm<z.infer<typeof RecipientSchema>>({
    resolver: zodResolver(RecipientSchema),
    mode: 'onChange',
    defaultValues: {
      recipient_name: recipient?.recipient_name || '',
      recipient_phone_number: recipient?.recipient_phone_number || '',
      recipient_email: recipient?.recipient_email || '',
    },
  });

  const { mutate: createRecipient, isPending: isCreating } = useMutation({
    mutationFn: createRecipientService,
    onSuccess: (result) => {
      if (result.status) {
        toast.success(result.message);
        queryClient.invalidateQueries({ queryKey: ['recipient'] });
        onClose();
      } else {
        toast.error(result.message);
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const { mutate: updateRecipient, isPending: isUpdating } = useMutation({
    mutationFn: updateRecipientService,
    onSuccess: (result) => {
      if (result.status) {
        toast.success(result.message);
        queryClient.invalidateQueries({ queryKey: ['recipient'] });
        onClose();
      } else {
        toast.error(result.message);
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = (values: z.infer<typeof RecipientSchema>) => {
    if (recipient?.recipient_id) {
      const diff = Object.fromEntries(
        Object.entries(values).filter(
          ([key, val]) => val !== (recipient as any)[key]
        )
      ) as Partial<typeof values>;

      updateRecipient({ recipientId: recipient.recipient_id, data: diff });
    } else {
      createRecipient(values);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {recipient ? 'Edit Recipient' : 'Add New Recipient'}
          </DialogTitle>
        </DialogHeader>
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="recipient_name"
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
              name="recipient_email"
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
              name="recipient_phone_number"
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
                {recipient ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
};

export default RecipientForm;
