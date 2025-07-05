// app/client/layout.tsx
"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import { UserSidebar } from "@/components/user/user-sidebar";
import React from "react";

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex">
        <UserSidebar />
        <main className="flex-1 p-6 bg-gray-50 min-h-screen">{children}</main>
      </div>
    </SidebarProvider>
  );
}
