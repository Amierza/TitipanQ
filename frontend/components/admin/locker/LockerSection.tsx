'use client';

import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from '@/components/ui/breadcrumb';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Separator } from '@/components/ui/separator';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Archive, Pencil, Trash2 } from 'lucide-react';
import { Locker } from '@/types/locker.type';
import { getAllLockerService } from '@/services/admin/locker/getAllLocker';
import { deleteLockerService } from '@/services/admin/locker/deleteLocker';
import LockerForm from './LockerForm';
import LockerDeleteConfirmation from './LockerDeleteConfirmation';
import { getAllPackageWithoutPaginationService } from '@/services/admin/package/getAllPackage';

const LockerSection = () => {
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocker, setSelectedLocker] = useState<Locker | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const { data: lockerData } = useQuery({
    queryKey: ['locker', { page, pagination: true }],
    queryFn: ({ queryKey }) => {
      const [, rawParams] = queryKey;

      if (typeof rawParams === 'object' && rawParams !== null) {
        return getAllLockerService(rawParams);
      }
      return getAllLockerService();
    },
  });

  const { data: packageData } = useQuery({
    queryKey: ['package'],
    queryFn: getAllPackageWithoutPaginationService,
  });

  const { mutate: deleteLocker } = useMutation({
    mutationFn: deleteLockerService,
    onSuccess: (result) => {
      if (result.status) {
        toast.success(result.message);
        queryClient.invalidateQueries({ queryKey: ['locker'] });
      } else {
        toast.error(result.message);
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  if (!lockerData) return <p>Failed to fetch locker data</p>;
  if (!lockerData.status) return <p>Failed to fetch locker data</p>;

  if (!packageData) return <p>Failed to fetch package data</p>;
  if (!packageData.status) return <p>Failed to fetch package data</p>;

  const handleCreate = () => {
    setSelectedLocker(null);
    setIsFormOpen(true);
  };

  const handleEdit = (locker: Locker) => {
    setSelectedLocker(locker);
    setIsFormOpen(true);
  };

  const handleDelete = (locker: Locker) => {
    setSelectedLocker(locker);
    setIsDeleteOpen(true);
  };

  const confirmDelete = (locker: Locker) => {
    if (selectedLocker) {
      deleteLocker(locker.locker_id);
    }
    setIsDeleteOpen(false);
  };

  const totalPackage = (lockerId: string) => {
    return packageData.data.filter(
      (pkg) =>
        pkg.locker.locker_id === lockerId && pkg.package_status === 'received'
    ).length;
  };

  const filteredData = lockerData.data.filter((locker) => {
    return (
      !searchQuery ||
      locker.locker_code.toLowerCase().includes(searchQuery) ||
      locker.location.toLowerCase().includes(searchQuery)
    );
  });

  const paginatedData = filteredData.slice(
    (page - 1) * lockerData.meta.per_page,
    page * lockerData.meta.per_page
  );

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
              <BreadcrumbLink href="#">List Locker</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      {/* Main Content */}
      <div className="p-4 md:p-8 h-full min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto h-full flex flex-col">
          <div className="flex justify-between items-end mb-4">
            {/* Title + Deskripsi */}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                List Locker
              </h1>
              <p className="text-gray-600">
                Manage locker assignments efficiently and intuitively
              </p>
            </div>
          </div>

          <div className="flex flex-row justify-between gap-4">
            {/* Search form */}
            <div className="mb-4 max-w-md flex w-full items-center gap-2">
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by client or description"
                className="w-full px-4 py-2 border rounded-lg focus-visible:ring-black"
              />
            </div>

            <Button className="cursor-pointer" onClick={handleCreate}>
              + Add New Locker
            </Button>
          </div>

          {paginatedData.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedData.map((locker) => (
                <div
                  key={locker.locker_code}
                  className="group border border-gray-200 rounded-lg p-2 hover:shadow-md hover:border-gray-300 transition-all duration-200 bg-white"
                >
                  <div className="flex flex-col justify-between gap-4">
                    {/* Content Section */}
                    <div className="flex-1 min-w-0 space-y-4">
                      {/* Locker Info Section */}
                      <div className="flex flex-col sm:flex-row items-center gap-2">
                        {/* Icon Container */}
                        <div className="flex-shrink-0 w-12 h-12 md:w-14 md:h-14 bg-gray-100 rounded-full flex items-center justify-center">
                          <Archive className="w-6 h-6 md:w-7 md:h-7 text-gray-600" />
                        </div>

                        {/* Locker Info Text */}
                        <div className="flex flex-col px-2">
                          <h3 className="text-xs sm:text-sm lg:text-base font-semibold text-gray-900 truncate text-wrap">
                            Locker Number: {locker.locker_code}
                          </h3>
                          <p className="text-xs lg:text-sm text-gray-600 truncate text-wrap">
                            Location: {locker.location}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div
                      className={`flex flex-col md:flex-row gap-2 ${
                        totalPackage(locker.locker_id) > 0
                          ? `justify-between`
                          : 'justify-end'
                      } px-2 pb-2 md:items-center`}
                    >
                      {totalPackage(locker.locker_id) > 0 && (
                        <div className="py-1 px-2 w-fit font-semibold text-xs bg-black text-white rounded-lg">
                          Total Package : {totalPackage(locker.locker_id)}
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex items-center justify-start md:justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(locker)}
                          className="cursor-pointer bg-amber-400 hover:bg-amber-500 text-white hover:text-white p-2 rounded-md opacity-70 group-hover:opacity-100 transition-opacity"
                          aria-label="Edit sender"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(locker)}
                          className="cursor-pointer bg-red-500 hover:bg-red-600 text-white hover:text-white p-2 rounded-md opacity-70 group-hover:opacity-100 transition-opacity"
                          aria-label="Delete sender"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-4 text-gray-500">
              Data tidak ditemukan
            </p>
          )}

          {lockerData.meta.max_page > 1 && (
            <div className="mt-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      className="cursor-pointer"
                      onClick={() => page > 1 && setPage((prev) => prev - 1)}
                    />
                  </PaginationItem>

                  {Array.from(
                    { length: lockerData.meta.max_page },
                    (_, index) => (
                      <PaginationItem key={index}>
                        <PaginationLink
                          className="cursor-pointer"
                          isActive={page === index + 1}
                          onClick={() => setPage(index + 1)}
                        >
                          {index + 1}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  )}

                  <PaginationItem>
                    <PaginationNext
                      className="cursor-pointer"
                      onClick={() =>
                        page < lockerData.meta.max_page &&
                        setPage((prev) => prev + 1)
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}

          <LockerForm
            key={selectedLocker?.locker_code ?? 'new'}
            isOpen={isFormOpen}
            onClose={() => setIsFormOpen(false)}
            locker={selectedLocker}
          />

          <LockerDeleteConfirmation
            isOpen={isDeleteOpen}
            onClose={() => setIsDeleteOpen(false)}
            onConfirm={() => {
              if (selectedLocker) confirmDelete(selectedLocker);
            }}
            locker={selectedLocker}
          />
        </div>
      </div>
    </SidebarInset>
  );
};

export default LockerSection;
