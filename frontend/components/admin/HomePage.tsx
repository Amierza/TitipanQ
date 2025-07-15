"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { getAllUserService } from "@/services/admin/user/getAllUser";
import PackageCardDashboard from "../package/package-card-dashboard";
import { ArrowRight } from "lucide-react";
import { getAllPackageWithoutPaginationService } from "@/services/admin/package/getAllPackage";

const HomePage = () => {
  const { data: packageData } = useQuery({
    queryKey: ["packageData"],
    queryFn: () => getAllPackageWithoutPaginationService(),
  });

  const { data: userData } = useQuery({
    queryKey: ["userData"],
    queryFn: getAllUserService,
  });

  if (!packageData) return <p>Loading...</p>;
  if (!userData) return <p>Loading...</p>;
  if (packageData.status === false) return <p>Failed to fetch data</p>;
  if (userData.status === false) return <p>Failed to fetch data</p>;

  const receivedPackage =
    packageData.data?.filter((p) => p.package_status === "received") ?? [];
  const deliveredPackage =
    packageData.data?.filter((p) => p.package_status === "delivered") ?? [];
  const completedPackage =
    packageData.data?.filter((p) => p.package_status === "completed") ?? [];
  const expiredPackage =
    packageData.data?.filter((p) => p.package_status === "expired") ?? [];

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
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="#">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      {/* Main content */}
      <div className="flex flex-1 flex-col gap-4 p-4">
        {/* Stat Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader>
              <CardTitle>Received Packages</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-bold">
              {receivedPackage.length}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Delivered Packages</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-bold text-amber-400">
              {deliveredPackage.length}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Complete Packages</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-bold text-green-600">
              {completedPackage.length}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Expired Packages</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-bold text-red-600">
              {expiredPackage.length}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <div className="flex gap-4 items-center justify-between px-6">
            <h2 className="text-2xl font-bold">Newest Package</h2>
            <ArrowRight className="text-base" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {packageData.data.slice(0, 4).map((pkg) => (
              <PackageCardDashboard key={pkg.package_id} pkg={pkg} />
            ))}
          </div>
        </div>
      </div>
    </SidebarInset>
  );
};

export default HomePage;
