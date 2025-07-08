/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { getAllUserService } from "@/services/admin/user/getAllUser";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { getPackageService } from "@/services/admin/package/getDetailPackage";
import { PackageStatus, PackageType } from "@/validation/package.schema";
import PackageFormUpdate from "../package/package-form-update";

const EditPackageSection = () => {
  const params = useParams();
  const packageId = params.id as string;
  const {
    data: userData,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["users"],
    queryFn: getAllUserService,
  });

  const { data: packageData } = useQuery({
    queryKey: ["package", packageId],
    queryFn: () => getPackageService(packageId),
    enabled: !!packageId,
  });

  if (userData?.status === false || packageData?.status === false) {
    return <p>Failed to fetch data</p>;
  }
  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Failed to fetch data</p>;
  const packageDetail = packageData?.data;

  const isValidPackageType = (value: any): value is PackageType => {
    return Object.values(PackageType).includes(value);
  };

  return (
    <SidebarInset>
      {/* Header */}
      <header className="flex h-16 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="#">Edit Package</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      {/* Main Content */}
      <div className="p-4 md:p-8 h-full min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto h-full flex flex-col">
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              Edit Package
            </h1>
            <p className="text-gray-600">Update package information</p>
          </div>

          {packageDetail && (
            <PackageFormUpdate
              key={packageId}
              users={
                userData?.status
                  ? userData.data.map((user) => ({
                      id: user.user_id,
                      name: user.user_name,
                    }))
                  : []
              }
              initialPackage={{
                package_id: packageId,
                package_description: packageDetail.package_description,
                package_type: isValidPackageType(packageDetail.package_type)
                  ? packageDetail.package_type
                  : PackageType.Other,
                package_image: undefined as unknown as File,
                user_id: packageDetail.user_id,
                package_status: packageDetail.package_status as PackageStatus,
              }}
            />
          )}
        </div>
      </div>
    </SidebarInset>
  );
};

export default EditPackageSection;
