/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { updateUserProfile } from "@/services/client/update-user";

type UserData = {
  id: string;
  user_name: string;
  user_email: string;
  user_password: string;
  user_phone_number: string;
  user_address: string;
  company_name: string;
  company_id: string;
};

type Props = {
  user: UserData;
  onSave?: (userData: UserData) => void;
};

export function UserEditForm({ user, onSave }: Props) {
  const [formData, setFormData] = useState({ ...user });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.user_name.trim()) newErrors.user_name = "Name is required";
    if (!formData.user_email.trim()) newErrors.user_email = "Email is required";
    if (!formData.user_phone_number.trim()) newErrors.user_phone_number = "Phone number is required";
    if (!formData.user_address.trim()) newErrors.user_address = "Address is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);

    try {
      const payload: any = {
        user_name: formData.user_name,
        user_phone_number: formData.user_phone_number,
        user_address: formData.user_address,
        company_id: user.company_id,
      };

      // Kirim email hanya jika berubah
      if (formData.user_email !== user.user_email) {
        payload.user_email = formData.user_email;
      }

      // Kirim password hanya jika tidak kosong
      if (formData.user_password.trim()) {
        payload.user_password = formData.user_password;
      }

      console.log("Payload ke API:", payload);
      await updateUserProfile(payload);

      onSave?.(formData);
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      console.error("Detail error:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Failed to update profile.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="user_name">Full Name *</Label>
              <Input
                id="user_name"
                name="user_name"
                value={formData.user_name}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label htmlFor="user_email">Email *</Label>
              <Input
                id="user_email"
                name="user_email"
                value={formData.user_email}
                onChange={handleChange}
              />
              {errors.user_email && <p className="text-red-500 text-sm">{errors.user_email}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="user_phone_number">Phone Number *</Label>
              <Input
                id="user_phone_number"
                name="user_phone_number"
                value={formData.user_phone_number}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label htmlFor="user_password">Password (optional)</Label>
              <Input
                id="user_password"
                name="user_password"
                type="password"
                value={formData.user_password}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="user_address">Address *</Label>
            <Input
              id="user_address"
              name="user_address"
              value={formData.user_address}
              onChange={handleChange}
            />
          </div>

          <div>
            <Label htmlFor="company_name">Company *</Label>
            <Input
              id="company_name"
              name="company_name"
              value={formData.company_name}
              readOnly
              disabled
              className="bg-gray-100 cursor-not-allowed"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setFormData({ ...user })}
              disabled={isLoading}
            >
              Reset
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
