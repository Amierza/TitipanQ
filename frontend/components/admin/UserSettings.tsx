"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DeleteConfirmation } from "@/components/delete-confirmation";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import UserForm from "../user/user-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAllUserService } from "@/services/admin/user/getAllUser";
import UserTable from "../user/user-table";
import { User } from "@/types/user.type";
import { deleteUserService } from "@/services/admin/user/deleteUser";
import { toast } from "sonner";
// import { updateUserService } from "@/services/admin/user/updateUser";

const UserSettingsSection = () => {
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const handleCreate = () => {
    setSelectedUser(null);
    setIsFormOpen(true);
  };

//   const { mutate: updateUser } = useMutation({
//     mutationFn: updateUserService,
//     onSuccess: (result) => {
//       if (result.status) {
//         toast.success(result.message);
//         queryClient.invalidateQueries({ queryKey: ["user"] });
//       } else {
//         toast.error(result.message);
//       }
//     },
//     onError: (error) => {
//       toast.error(error.message);
//     },
//   });

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    // updateUser(user.user_id, )
    setIsFormOpen(true);
  };

  const { mutate: deleteUser } = useMutation({
    mutationFn: deleteUserService,
    onSuccess: (result) => {
      if (result.status) {
        toast.success(result.message);
        queryClient.invalidateQueries({ queryKey: ["user"] });
      } else {
        toast.error(result.message);
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleDelete = (user: User) => {
    setSelectedUser(user);
    setIsDeleteOpen(true);
  };

  const confirmDelete = (user: User) => {
    if (selectedUser) {
      deleteUser(user.user_id);
    }
    setIsDeleteOpen(false);
  };

  const { data: userData } = useQuery({
    queryKey: ["user"],
    queryFn: getAllUserService,
  });

  if (!userData) return <p>Loading...</p>;
  if (userData.status === false) return <p>Failed to fetch data</p>;

  return (
    <SidebarInset>
      {/* Header */}
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-4"
        />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="#">User Settings</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      {/* Main Content */}
      <div className="p-4 md:p-8 h-full min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto h-full flex flex-col">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                User Account Settings
              </h1>
              <p className="text-gray-600">Manage all users and access roles</p>
            </div>
            <Button onClick={handleCreate}>+ Add User</Button>
          </div>

          <UserTable
            users={userData.data}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />

          <UserForm
            key={selectedUser?.user_id ?? "new"}
            isOpen={isFormOpen}
            onClose={() => setIsFormOpen(false)}
            user={selectedUser}
          />

          <DeleteConfirmation
            isOpen={isDeleteOpen}
            onClose={() => setIsDeleteOpen(false)}
            onConfirm={() => {
              if (selectedUser) confirmDelete(selectedUser);
            }}
            user={selectedUser}
          />
        </div>
      </div>
    </SidebarInset>
  );
};

export default UserSettingsSection;
