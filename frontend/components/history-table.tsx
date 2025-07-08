"use client";

import Image from "next/image";
import { UserInfo } from "./user/user-info";
import { PackageStatusBadge } from "./package/package-status-badge";
import { useQuery } from "@tanstack/react-query";
import { getAllPackageService } from "@/services/admin/package/getAllPackage";
import { getAllUserService } from "@/services/admin/user/getAllUser";
import { imageUrl } from "@/config/api";
import { useState } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./ui/pagination";

const HistoryTable = ({ searchQuery }: { searchQuery: string }) => {
  const query = searchQuery.toLowerCase();
  const [page, setPage] = useState(1);

  const { data: packageData } = useQuery({
    queryKey: ["packageData", page],
    queryFn: () => getAllPackageService({ page }),
  });

  const { data: userData } = useQuery({
    queryKey: ["userData"],
    queryFn: getAllUserService,
  });
  if (!packageData) return <p>Loading...</p>;
  if (!userData) return <p>Loading...</p>;
  if (packageData.status === false) return <p>Failed to fetch data</p>;
  if (userData.status === false) return <p>Failed to fetch data</p>;

  const itemPerPage = packageData.meta.per_page;

  const dataPackage =
    packageData.data?.filter(
      (p) => p.package_status === "completed" || p.package_status === "expired"
    ) ?? [];

  const combinedData =
    dataPackage?.map((pkg) => {
      const user = userData?.data?.find((user) => user.user_id === pkg.user_id);
      return {
        ...pkg,
        user_name: user?.user_name || "Unknown",
        user_email: user?.user_email || "Unknown",
        company_name: user?.company?.company_name || "Unknown",
      };
    }) ?? [];

  const filteredData = combinedData.filter((pkg) =>
    [pkg.user_name, pkg.package_description, pkg.company_name].some((val) =>
      val.toLowerCase().includes(query)
    )
  );

  const totalPage = Math.ceil(filteredData.length / itemPerPage);

  const paginatedData = filteredData.slice(
    (page - 1) * itemPerPage,
    page * itemPerPage
  );

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
              <th className="p-3 text-left">Date</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((pkg) => (
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
                  <UserInfo name={pkg.user_name} email={pkg.user_email} />
                </td>
                <td className="p-3">{pkg.company_name}</td>
                <td className="p-3">
                  <PackageStatusBadge status={pkg.package_status} />
                </td>
                <td className="p-3">
                  {new Date(pkg.package_expired_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {packageData?.meta && paginatedData.length > 0 && (
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
    </>
  );
};

export default HistoryTable;
