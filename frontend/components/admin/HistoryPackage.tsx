"use client";

import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import HistoryTable from "../history-table";
import { useState } from "react";
import { Input } from "../ui/input";

const HistoryPackageSection = () => {
  const [searchQuery, setSearchQuery] = useState("");

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
              <BreadcrumbLink href="#">Package History</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      {/* Main Content */}
      <div className="p-4 md:p-8 h-full min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto h-full flex flex-col">
          {/* Title + Deskripsi */}
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              Package History
            </h1>
            <p className="text-gray-600">
              View picked-up or expired packages from all companies
            </p>
          </div>

          {/* Search form */}
          <div className="mb-4 max-w-md flex items-center gap-2">
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by recipient or company"
              className="w-full px-4 py-2 border rounded-lg focus-visible:ring-black"
            />
          </div>

          {/* Table */}
          <div className="flex-1">
            <HistoryTable searchQuery={searchQuery} />
          </div>
        </div>
      </div>
    </SidebarInset>
  );
};

export default HistoryPackageSection;
