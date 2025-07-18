"use client";

import Image from "next/image";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAllPackageService } from "@/services/admin/package/getAllPackage";
import { deletePackageService } from "@/services/admin/package/deletePackage";
import { imageUrl } from "@/config/api";
import { toast } from "sonner";
import { Package } from "@/types/package.type";
import { UserInfo } from "./user/user-info";
import { PackageStatusBadge } from "./package/package-status-badge";
import DeletePackageButton from "./package/package-delete-button";
import DeleteConfirmationPackage from "./package/delete-confirmation-package";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";

const HistoryTable = ({
  searchQuery,
  statusFilter,
  companyFilter,
}: {
  searchQuery?: string;
  statusFilter?: string;
  companyFilter?: string;
}) => {
  const query = searchQuery?.toLowerCase() || "";
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const router = useRouter();

  const itemPerPage = 10;

  const { data: packageData } = useQuery({
    queryKey: ["packageData"],
    queryFn: () => getAllPackageService({ page: 1, per_page: 9999 }),
  });

  const { mutate: deletePackage } = useMutation({
    mutationFn: deletePackageService,
    onSuccess: (result) => {
      toast.success(result.message);
      queryClient.invalidateQueries({ queryKey: ["packageData"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  if (!packageData) return <p>Loading...</p>;
  if (packageData.status === false) return <p>Failed to fetch data</p>;

  const filteredData = packageData.data.filter((pkg) => {
    const matchesSearchFilter =
      !query ||
      pkg.user.user_name.toLowerCase().includes(query) ||
      pkg.package_description.toLowerCase().includes(query);

    const matchesStatusFilter =
      !statusFilter || statusFilter === "all"
        ? true
        : pkg.package_status.toLowerCase() === statusFilter.toLowerCase();

    const matchesCompanyFilter = companyFilter
      ? pkg.user.company.company_id.toLowerCase() === companyFilter.toLowerCase()
      : true;

    return matchesSearchFilter && matchesStatusFilter && matchesCompanyFilter;
  });

  const totalPage = Math.ceil(filteredData.length / itemPerPage);

  const paginatedData = filteredData.slice(
    (page - 1) * itemPerPage,
    page * itemPerPage
  );

  const handleDelete = (pkg: Package) => {
    setSelectedPackage(pkg);
    setIsDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (selectedPackage) {
      deletePackage(selectedPackage.package_id);
    }
    setIsDeleteOpen(false);
  };

  const getFullImageUrl = (imagePath: string) => {
    if (!imagePath) return "/assets/default_image.jpg";
    if (imagePath.startsWith("http")) return imagePath;
    return `${imageUrl}/package/${imagePath}`;
  };

  return (
    <>
      <div className="overflow-x-auto border rounded-xl">
        <table className="min-w-full table-auto bg-white text-sm">
          <thead className="bg-black text-white">
            <tr>
              <th className="p-3 text-left">Photo</th>
              <th className="p-3 text-left">Description</th>
              <th className="p-3 text-left">Recipient</th>
              <th className="p-3 text-left">Company</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Detail</th>
              <th className="p-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map((pkg) => (
                <tr key={pkg.package_id} className="border-b hover:bg-gray-100">
                  <td className="p-3">
                    <Image
                      src={getFullImageUrl(pkg.package_image)}
                      alt="Package"
                      width={64}
                      height={64}
                      className="w-16 h-16 object-cover rounded-md"
                    />
                  </td>
                  <td className="p-3">{pkg.package_description}</td>
                  <td className="p-3">
                    <UserInfo
                      name={pkg.user.user_name}
                      email={pkg.user.user_email}
                    />
                  </td>
                  <td className="p-3">
                    {pkg.user.company.company_name || "Unknown"}
                  </td>
                  <td className="p-3">
                    <PackageStatusBadge status={pkg.package_status} />
                  </td>
                  <td className="p-3">
                    <Link href={`/admin/package/${pkg.package_id}`} className="text-blue-500 underline">
                      Detail
                    </Link>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        onClick={() => router.push(`/admin/package/edit/${pkg.package_id}`)}
                        className="bg-amber-400 hover:text-white hover:bg-amber-500 text-white p-2 rounded-md"
                      >
                        <Pencil className="transition-transform" />
                      </Button>
                      <DeletePackageButton onClick={() => handleDelete(pkg)} />
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="text-center py-4 text-gray-500">
                  Tidak ada data yang cocok.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPage > 1 && (
        <div className="mt-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  className="cursor-pointer"
                  onClick={() => page > 1 && setPage((prev) => prev - 1)}
                />
              </PaginationItem>

              {Array.from({ length: totalPage }, (_, index) => (
                <PaginationItem key={index}>
                  <PaginationLink
                    className="cursor-pointer"
                    isActive={page === index + 1}
                    onClick={() => setPage(index + 1)}
                  >
                    {index + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  className="cursor-pointer"
                  onClick={() => page < totalPage && setPage((prev) => prev + 1)}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      <DeleteConfirmationPackage
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={confirmDelete}
        pkg={selectedPackage}
      />
    </>
  );
};

export default HistoryTable;
