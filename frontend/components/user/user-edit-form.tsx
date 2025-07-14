/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { updateUserProfile } from "@/services/client/update-user";

const phoneNumberRegex = /^(?:\+62|62|0)8[1-9][0-9]{6,10}$/;

export const UserEditSchema = z.object({
  user_name: z.string().min(3, "Name must have at least 3 characters"),
  user_email: z.string().email({ message: "Email is not valid" }),
  user_phone_number: z
    .string()
    .regex(phoneNumberRegex, "Phone number format is not valid"),
  user_password: z
    .string()
    .optional()
    .refine((val) => !val || val.length === 0 || val.length >= 3, {
      message: "Password must have at least 3 characters",
    }),
  user_address: z.string({ required_error: "Address is required" }),
  company_id: z.string(),
});

type UserFormData = z.infer<typeof UserEditSchema>;

type Props = {
  user: {
    id: string;
    user_name: string;
    user_email: string;
    user_password: string;
    user_phone_number: string;
    user_address: string;
    company_name: string;
    company_id: string;
  };
  onSave?: (userData: any) => void;
};

export function UserEditForm({ user, onSave }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UserFormData>({
    resolver: zodResolver(UserEditSchema),
    defaultValues: {
      user_name: user.user_name,
      user_email: user.user_email,
      user_password: "",
      user_phone_number: user.user_phone_number,
      user_address: user.user_address,
      company_id: user.company_id,
    },
  });

  const onSubmit = async (data: UserFormData) => {
    try {
      const payload: any = {
        user_name: data.user_name,
        user_phone_number: data.user_phone_number,
        user_address: data.user_address,
        company_id: data.company_id,
      };

      if (data.user_email !== user.user_email) {
        payload.user_email = data.user_email;
      }

      if (data.user_password && data.user_password.trim()) {
        payload.user_password = data.user_password;
      }

      console.log("Payload ke API:", payload);
      await updateUserProfile(payload);

      onSave?.(data);
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      console.error("Detail error:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Failed to update profile.");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="user_name">Full Name *</Label>
              <Input id="user_name" {...register("user_name")} />
              {errors.user_name && (
                <p className="text-red-500 text-sm">{errors.user_name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="user_email">Email *</Label>
              <Input id="user_email" {...register("user_email")} />
              {errors.user_email && (
                <p className="text-red-500 text-sm">{errors.user_email.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="user_phone_number">Phone Number *</Label>
              <Input id="user_phone_number" {...register("user_phone_number")} />
              {errors.user_phone_number && (
                <p className="text-red-500 text-sm">{errors.user_phone_number.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="user_password">Password (optional)</Label>
              <Input id="user_password" type="password" {...register("user_password")} />
                {errors.user_password && (
                    <p className="text-red-500 text-sm">{errors.user_password.message}</p>
                  )}
            </div>
          </div>

          <div>
            <Label htmlFor="user_address">Address *</Label>
            <Input id="user_address" {...register("user_address")} />
            {errors.user_address && (
              <p className="text-red-500 text-sm">{errors.user_address.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="company_name">Company *</Label>
            <Input
              id="company_name"
              value={user.company_name}
              readOnly
              disabled
              className="bg-gray-100 cursor-not-allowed"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
