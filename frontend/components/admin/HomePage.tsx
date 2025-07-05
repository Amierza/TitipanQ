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
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { getAllPackageService } from "@/services/admin/package/getAllPackage";

const HomePage = () => {
  const { data: packageData } = useQuery({
    queryKey: ["packageData"],
    queryFn: getAllPackageService,
  });

  // const { data: userData } = useQuery({
  //   queryKey: ["userData"],
  //   queryFn: getAllUserService,
  // });

  // console.log(userData)

  if (!packageData) return <p>Loading...</p>;
  if (packageData.status === false) return <p>Failed to fetch data</p>;

  const receivedPackage =
    packageData.data?.filter((p) => p.package_status === "received") ?? [];
  const deliveredPackage =
    packageData.data?.filter((p) => p.package_status === "delivered") ?? [];
  const completedPackage =
    packageData.data?.filter((p) => p.package_status === "completed") ?? [];
  const expiredPackage =
    packageData.data?.filter((p) => p.package_status === "expired") ?? [];

  const packageList = [
    {
      name: "Budi Santoso",
      company: "Maju Terus Inc.",
      type: "Item",
      status: "Received",
    },
    {
      name: "Siti Aminah",
      company: "Amanah Ltd.",
      type: "Letter",
      status: "Picked Up",
    },
    {
      name: "Rudi Hartono",
      company: "Bright Light Corp.",
      type: "Item",
      status: "Expired",
    },
  ];

  const getStatusBadge = (status: string) => {
    const variant =
      status === "Received"
        ? "default"
        : status === "Picked Up"
        ? "secondary"
        : "destructive";
    return <Badge variant={variant}>{status}</Badge>;
  };

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

        {/* Package Table */}
        <Card>
          <CardHeader>
            <CardTitle>Package List</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No</TableHead>
                  <TableHead>Recipient Name</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {packageList.map((pkg, index) => (
                  <TableRow key={index}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{pkg.name}</TableCell>
                    <TableCell>{pkg.company}</TableCell>
                    <TableCell>{pkg.type}</TableCell>
                    <TableCell>{getStatusBadge(pkg.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </SidebarInset>
  );
};

export default HomePage;
