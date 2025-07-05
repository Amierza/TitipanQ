"use client";
import { UserEditForm } from "./user/user-edit-form";
import { Card } from "@/components/ui/card"; // Assuming you're using shadcn/ui

const currentUser = {
  id: "1",
  name: "Alice Johnson",
  email: "alice@company.com",
  phone: "081234567890",
  photo: "/avatars/alice.jpg",
  company: "PT Alpha",
};

type UserData = {
  id: string;
  name: string;
  email: string;
  phone: string;
  photo: string;
  company?: string;
};

export function EditAccountPage() {
  const handleSave = (userData: UserData) => {
    console.log("Saving user data:", userData);
    // Optionally redirect after successful save
    // router.push('/account');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-8 space-y-2">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Account Settings
          </h1>
          <p className="text-gray-600 text-lg">
            Manage your account information and preferences
          </p>
        </div>

        {/* Main Content Card */}
        <Card className="overflow-hidden shadow-sm">
          <div className="p-6 sm:p-8">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                Personal Information
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                Update your personal details and contact information
              </p>
            </div>
            
            <div className="border-t border-gray-200 pt-6">
              <UserEditForm user={currentUser} onSave={handleSave} />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}