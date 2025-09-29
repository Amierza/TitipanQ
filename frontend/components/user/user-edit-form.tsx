'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { updateUserProfile } from '@/services/client/update-user';
import { User } from '@/types/user.type';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const phoneNumberRegex = /^(?:\+62|62|0)8[1-9][0-9]{6,10}$/;

export const UserEditSchema = z.object({
  user_name: z.string().min(3, 'Name must have at least 3 characters'),
  user_email: z.string().email({ message: 'Email is not valid' }),
  user_phone_number: z
    .string()
    .regex(phoneNumberRegex, 'Phone number format is not valid'),
  user_password: z
    .string()
    .optional()
    .refine((val) => !val || val.length === 0 || val.length >= 3, {
      message: 'Password must have at least 3 characters',
    }),
});

const updateUserProfileSchema = UserEditSchema.partial();
type UserFormData = z.infer<typeof updateUserProfileSchema>;

export function UserEditForm({ user }: { user: User }) {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, dirtyFields },
  } = useForm<UserFormData>({
    resolver: zodResolver(updateUserProfileSchema),
    mode: 'onChange',
    defaultValues: {
      user_name: user.user_name,
      user_email: user.user_email,
      user_password: '',
      user_phone_number: user.user_phone_number,
    },
  });

  const { mutate: updateProfileUser } = useMutation({
    mutationFn: (data: Partial<UserFormData>) => updateUserProfile({ data }),
    onSuccess: (result) => {
      if (result.status) {
        toast.success('Profile updated successfully!');
        queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      } else {
        toast.error(result.message || 'Failed to update profile.');
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update profile.');
    },
  });

  const onSubmit = (data: Partial<UserFormData>) => {
    const changedData = Object.keys(dirtyFields).reduce((acc, key) => {
      const typedKey = key as keyof UserFormData;
      acc[typedKey] = data[typedKey];
      return acc;
    }, {} as Partial<UserFormData>);

    updateProfileUser(changedData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="user_name">Full Name *</Label>
              <Input id="user_name" {...register('user_name')} />
              {errors.user_name && (
                <p className="text-red-500 text-sm">
                  {errors.user_name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="user_email">Email *</Label>
              <Input id="user_email" {...register('user_email')} />
              {errors.user_email && (
                <p className="text-red-500 text-sm">
                  {errors.user_email.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="user_phone_number">Phone Number *</Label>
              <Input
                id="user_phone_number"
                {...register('user_phone_number')}
              />
              {errors.user_phone_number && (
                <p className="text-red-500 text-sm">
                  {errors.user_phone_number.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="user_password">Password (optional)</Label>
              <Input
                id="user_password"
                type="password"
                {...register('user_password')}
              />
              {errors.user_password && (
                <p className="text-red-500 text-sm">
                  {errors.user_password.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="user_address">Address *</Label>
            <Input id="user_address" value={user.user_address} disabled />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company_name">Company</Label>
            {user.companies.map((company) => (
              <Input
                key={company.company_id}
                value={company.company_name}
                disabled
              />
            ))}
          </div>

          <div className="flex gap-4 pt-4">
            <Button disabled={isSubmitting} className="cursor-pointer">
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
