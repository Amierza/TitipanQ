"use client";

import { Button } from "@/components/ui/button";
import { Pencil, FileText, Package, User } from "lucide-react";
import Link from "next/link";
import DeletePackageButton from "./package-delete-button";
import Image from "next/image";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAllUserService } from "@/services/admin/user/getAllUser";
import { imageUrl } from "@/config/api";
import { deletePackageService } from "@/services/admin/package/deletePackage";
import { toast } from "sonner";
import { useState } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../ui/pagination";
import { Package as PackageType } from "@/types/package.type";
import DeleteConfirmationPackage from "./delete-confirmation-package";
import { getAllPackageService } from "@/services/admin/package/getAllPackage";

const PackageList = () => {
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();
  const [selectedPackage, setSelectedPackage] = useState<PackageType | null>(
    null
  );
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const { data: packageData } = useQuery({
    queryKey: ["package", page],
    queryFn: () => getAllPackageService({ page }),
  });

  const { data: userData } = useQuery({
    queryKey: ["user"],
    queryFn: getAllUserService,
  });

  const { mutate: deletePackage } = useMutation({
    mutationFn: deletePackageService,
    onSuccess: (result) => {
      if (result.status) {
        toast.success(result.message);
        queryClient.invalidateQueries({ queryKey: ["package"] });
      } else {
        toast.error(result.message);
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleDelete = (pkg: PackageType) => {
    setSelectedPackage(pkg);
    setIsDeleteOpen(true);
  };

  const confirmDelete = (pkg: PackageType) => {
    if (selectedPackage) {
      deletePackage(pkg.package_id);
    }
    setIsDeleteOpen(false);
  };

  const getFullImageUrl = (imagePath: string) => {
    if (!imagePath) return "/Images/default_image.jpg";

    if (imagePath.startsWith("http")) return imagePath;

    return `${imageUrl}/package/${imagePath}`;
  };

  if (!packageData) return <p>Loading...</p>;
  if (!userData) return <p>Loading...</p>;
  if (packageData.status === false) return <p>Failed to fetch data</p>;
  if (userData.status === false) return <p>Failed to fetch data</p>;

  const filteredPackage = packageData.data.filter(
    (pack) =>
      pack.package_status !== "expired" && pack.package_status !== "completed"
  );

  if (filteredPackage.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border">
        <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Package className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No packages found
        </h3>
        <p className="text-gray-500 mb-6">
          Get started by adding your first package
        </p>
        <Link href="/admin/package/new">
          <Button className="bg-black text-white hover:bg-gray-800">
            Add Package
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {filteredPackage.map((pkg) => (
        <div
          key={pkg.package_id}
          className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between">
            {/* Left Content */}
            <div className="flex gap-4 flex-1">
              {/* Image */}
              <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                {pkg.package_image ? (
                  <Image
                    src={getFullImageUrl(pkg.package_image)}
                    alt={`Photo of ${pkg.package_description}`}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="h-8 w-8 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg text-black mb-2">
                  {pkg.package_description}
                </h3>

                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    <span className="capitalize">{pkg.package_type}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span>{pkg.user.user_name}</span>
                  </div>
                </div>

                <div className="mt-2 text-xs text-gray-400">
                  ID: {pkg.package_id}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 ml-4">
              <Link href={`/admin/package/${pkg.package_id}/edit`}>
                <Button variant="outline" size="sm">
                  <Pencil className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              </Link>
              <DeletePackageButton onClick={() => handleDelete(pkg)} />
            </div>
          </div>
        </div>
      ))}

      {packageData?.meta && (
        <div className="mt-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  className="cursor-pointer"
                  onClick={() => page > 1 && setPage((prev) => prev - 1)}
                />
              </PaginationItem>

              {Array.from({ length: packageData.meta.max_page }, (_, index) => (
                <PaginationItem key={index}>
                  <PaginationLink
                    isActive={page === index + 1}
                    onClick={() => {
                      setPage(index + 1);
                    }}
                  >
                    {index + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  className="cursor-pointer"
                  onClick={() =>
                    page < packageData.meta.max_page &&
                    setPage((prev) => prev + 1)
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      <DeleteConfirmationPackage
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={() => {
          if (selectedPackage) confirmDelete(selectedPackage);
        }}
        pkg={selectedPackage}
      />
    </div>
  );
};

export default PackageList;
