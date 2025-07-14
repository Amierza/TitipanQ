"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  PackageSearch,
  MessageSquareText,
  Settings,
  LogOut,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getUserProfileService } from "@/services/client/get-user-profile-by-id";

const mainMenuItems = [
  {
    title: "My Packages",
    href: "/client/package",
    icon: PackageSearch,
  },
  {
    title: "Ask In Whatsapp",
    href: "https://wa.me/6282332384036",
    icon: MessageSquareText,
    external: true,
  },
];

const settingsMenuItems = [
  {
    title: "Account Settings",
    href: "/client/edit-account",
    icon: Settings,
  },
];

export function UserSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["user-profile"],
    queryFn: getUserProfileService,
  });

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    window.location.href = "/login";
  };

  // Loading state
  if (isLoading || !data) {
    return (
      <Sidebar {...props}>
        <SidebarHeader className="flex items-center justify-center px-4 py-3 border-b">
          <p className="text-sm text-muted-foreground">Loading user data...</p>
        </SidebarHeader>
      </Sidebar>
    );
  }

  // Error state
  if (!data.status || isError) {
    return (
      <Sidebar {...props}>
        <SidebarHeader className="flex items-center justify-center px-4 py-3 border-b">
          <p className="text-sm text-red-500">Failed to load user</p>
        </SidebarHeader>
      </Sidebar>
    );
  }

  const user = data.data;

  return (
    <Sidebar {...props}>
    <SidebarHeader className="flex flex-col items-center justify-center gap-3 px-4 py-5 border-b">
      <div className="flex flex-col items-center gap-1">
        <span className="text-sm font-medium truncate">
          {user.user_name}
        </span>
        <span className="text-xs text-muted-foreground truncate">
          {user.user_email}
        </span>
      </div>
      <Badge variant="outline" className="text-xs mt-2 py-3">
        {user.company.company_name}
      </Badge>
    </SidebarHeader>

      {/* Sidebar Content */}
      <SidebarContent>
        {/* Main Menu */}
        <SidebarGroup>
          <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainMenuItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <SidebarMenuItem
                    key={item.href}
                    className={isActive ? "bg-muted text-primary" : ""}
                  >
                    <SidebarMenuButton asChild>
                      <Link
                        href={item.href}
                        target={item.external ? "_blank" : "_self"}
                        className="flex items-center gap-3"
                      >
                        <item.icon className="size-4" />
                        {item.title}
                        {item.external && (
                          <span className="ml-auto text-xs text-muted-foreground">↗</span>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Settings Menu */}
        <SidebarGroup>
          <SidebarGroupLabel>Settings</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsMenuItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <SidebarMenuItem
                    key={item.href}
                    className={isActive ? "bg-muted text-primary" : ""}
                  >
                    <SidebarMenuButton asChild>
                      <Link
                        href={item.href}
                        className="flex items-center gap-3"
                      >
                        <item.icon className="size-4" />
                        {item.title}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
              
              {/* Logout Button */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Button
                    onClick={handleLogout}
                    variant="ghost"
                    className="w-full justify-start gap-3 px-3 py-2 hover:bg-red-50 hover:text-red-700 text-sm h-auto"
                  >
                    <LogOut className="size-4" />
                    Log Out
                  </Button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Sidebar Rail (collapse button, optional) */}
      <SidebarRail />
    </Sidebar>
  );
}