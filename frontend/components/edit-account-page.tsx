/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { getUserProfileService } from "@/services/client/get-user-profile-by-id";
import { UserEditForm } from "./user/user-edit-form";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export function EditAccountPage() {
  const [userData, setUserData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await getUserProfileService();
        setUserData(data.data);
      } catch (error: any) {
        toast.error(error.message || "Failed to fetch user data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="w-full max-w-2xl space-y-4 px-4">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-[500px] w-full" />
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-red-500">Failed to load user data.</p>
      </div>
    );
  }

  const formattedUser = {
    id: userData.user_id,
    user_name: userData.user_name,
    user_email: userData.user_email,
    user_password: "",
    user_phone_number: userData.user_phone_number,
    user_address: userData.user_address,
    company_name: userData.company.company_name,
    company_id: userData.company.company_id,
  };

  const handleSave = (updatedUser: typeof formattedUser) => {
    console.log("User updated:", updatedUser);
  };

  return (
    <div className="min-h-screen flex items-start justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-3xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
          <p className="mt-1 text-gray-600 text-lg">
            Manage your account information and preferences.
          </p>
        </div>

        <div className="bg-white shadow rounded-lg p-6 sm:p-8 border">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800">
              Personal Information
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Update your personal details and contact information
            </p>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <UserEditForm user={formattedUser} onSave={handleSave} />
          </div>
        </div>
      </div>
    </div>
  );
}
