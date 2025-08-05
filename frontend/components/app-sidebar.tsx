'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Package,
  LayoutDashboard,
  User,
  Building,
  LogOut,
  Send,
  Archive,
} from 'lucide-react';

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
} from '@/components/ui/sidebar';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const menuItems = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    title: 'Sender',
    href: '/admin/sender',
    icon: Send,
  },
  {
    title: 'Locker',
    href: '/admin/locker',
    icon: Archive,
  },
  {
    title: 'Package',
    href: '/admin/package',
    icon: Package,
  },
  {
    title: 'User Account Settings',
    href: '/admin/user-settings',
    icon: User,
  },
  {
    title: 'Companies',
    href: '/admin/companies',
    icon: Building,
  },
  {
    title: 'Logout',
    href: '/login',
    icon: LogOut,
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();

  return (
    <Sidebar {...props}>
      {/* Sidebar Header */}
      <SidebarHeader className="flex items-center gap-3 px-4 py-3 border-b">
        <Avatar>
          <AvatarFallback>A</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="text-sm font-medium">Admin TitipanQ</span>
          <span className="text-xs text-muted-foreground">
            admin@titipanq.com
          </span>
        </div>
      </SidebarHeader>

      {/* Sidebar Content */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <SidebarMenuItem
                    key={item.href}
                    className={isActive ? 'bg-muted text-primary' : ''}
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
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Sidebar Rail (collapse button, optional) */}
      <SidebarRail />
    </Sidebar>
  );
}
