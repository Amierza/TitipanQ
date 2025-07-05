"use client";

import Link from "next/link";
import {
  PackageSearch,
  History,
  MessageSquareText,
  Settings,
  LogOut,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

export function UserSidebar() {
  const pathname = usePathname();

  // Mock user data - replace with real data from context/session
  const userData = {
    name: "Sergio Conceicao",
    email: "sergio.concei@email.com",
    avatar: "/avatars/01.png", // or null if not available
    role: "Employee",
    unit: "PT Barcelona Group",
  };

  const mainMenu = [
    { name: "My Packages", href: "/client/package", icon: PackageSearch },
    { name: "History", href: "/client/history", icon: History },
    {
      name: "Ask In Whatsapp",
      href: "https://wa.me/6282332384036",
      icon: MessageSquareText,
      external: true,
    },
  ];

  const bottomMenu = [
    { name: "Account Settings", href: "/client/edit-account", icon: Settings },
  ];

  const handleLogout = () => {
    console.log("Logout clicked");
  };

  return (
    <aside className="w-64 h-screen bg-white border-r shadow-sm flex flex-col">
      {/* User Profile Section */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={userData.avatar} alt={userData.name} />
            <AvatarFallback className="bg-blue-100 text-black">
              {userData.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm truncate">{userData.name}</h3>
            <p className="text-xs text-muted-foreground truncate">
              {userData.email}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {userData.role}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {userData.unit}
          </Badge>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 p-4">
        <h2 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">
          Main Menu
        </h2>
        <nav className="space-y-1">
          {/* Main Menu Items */}
          {mainMenu.map((item, i) => (
            <Link
              key={i}
              href={item.href}
              target={item.external ? "_blank" : "_self"}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-sm",
                pathname === item.href &&
                  "bg-white text-black font-medium border border-black"
              )}
            >
              <item.icon
                className={cn(
                  "w-4 h-4",
                  pathname === item.href ? "text-black" : "text-gray-500"
                )}
              />
              {item.name}
              {item.external && (
                <span className="ml-auto text-xs text-muted-foreground">↗</span>
              )}
            </Link>
          ))}

          {/* Separator */}
          <Separator className="my-4" />

          {/* Settings Menu */}
          {bottomMenu.map((item, i) => (
            <Link
              key={`bottom-${i}`}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-sm",
                pathname === item.href &&
                  "bg-white text-black font-medium border border-black"
              )}
            >
              <item.icon
                className={cn(
                  "w-4 h-4",
                  pathname === item.href ? "text-black" : "text-gray-500"
                )}
              />
              {item.name}
            </Link>
          ))}

          {/* Logout Button */}
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full justify-start gap-3 px-3 py-2 hover:bg-red-50 hover:text-red-700 text-sm mt-2"
          >
            <LogOut className="w-4 h-4" />
            Log Out
          </Button>
        </nav>
      </div>
    </aside>
  );
}
