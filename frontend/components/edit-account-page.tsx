"use client";
import { UserEditForm } from "./user-edit-form";

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
    // Ganti any dengan UserData
    // Here you would typically call your API to update the user
    console.log("Saving user data:", userData);

    // Optionally redirect after successful save
    // router.push('/account');
  };
 

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
        
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Account Settings
            </h1>
            <p className="text-gray-600 mt-2">
              Manage your account information and preferences
            </p>
          </div>
        </div>

        <UserEditForm user={currentUser} onSave={handleSave} />
      </div>
    </div>
  );
}
