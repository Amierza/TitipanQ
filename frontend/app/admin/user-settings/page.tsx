"use client";

import { useState } from "react";
import { UserData, dummyUsers } from "@/lib/data/dummy-user";
import { Button } from "@/components/ui/button";
import { DeleteConfirmation } from "@/components/delete-confirmation";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { UserTable } from "@/components/user/user-table";
import { UserForm } from "@/components/user/user-form";

export default function AccountSettingsPage() {
  const [users, setUsers] = useState<UserData[]>(dummyUsers);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const handleCreate = () => {
    setSelectedUser(null);
    setIsFormOpen(true);
  };

  const handleEdit = (user: UserData) => {
    setSelectedUser(user);
    setIsFormOpen(true);
  };

  const handleDelete = (user: UserData) => {
    setSelectedUser(user);
    setIsDeleteOpen(true);
  };

  const handleSubmit = (data: UserData) => {
    if (data.id) {
      setUsers((prev) => prev.map((u) => (u.id === data.id ? data : u)));
    } else {
      const newUser = { ...data, id: Date.now().toString() };
      setUsers((prev) => [...prev, newUser]);
    }
    setIsFormOpen(false);
  };

  const confirmDelete = () => {
    if (selectedUser) {
      setUsers((prev) => prev.filter((u) => u.id !== selectedUser.id));
    }
    setIsDeleteOpen(false);
  };

  return (
    <SidebarProvider>
      <AppSidebar />
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
              users={users}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />

            <UserForm
              isOpen={isFormOpen}
              onClose={() => setIsFormOpen(false)}
              onSubmit={handleSubmit}
              user={selectedUser}
            />

            <DeleteConfirmation
              isOpen={isDeleteOpen}
              onClose={() => setIsDeleteOpen(false)}
              onConfirm={confirmDelete}
              user={selectedUser}
            />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
