// app/client/layout.tsx
"use client";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { UserSidebar } from "@/components/user/user-sidebar";
import React from "react";

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <UserSidebar />
      <main className="flex-1 w-full">
        {/* Header dengan trigger untuk mobile */}
        <header className="flex items-center gap-2 px-4 py-3 border-b bg-white">
          <SidebarTrigger />
          <h1 className="text-lg font-semibold">User TitipanQ</h1>
        </header>
        
        {/* Main content */}
        <div className="p-6 bg-gray-50 min-h-screen">
          {children}
        </div>
      </main>
    </SidebarProvider>
  );
}