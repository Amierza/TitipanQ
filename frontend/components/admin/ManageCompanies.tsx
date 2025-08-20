'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
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
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { deleteCompanyService } from '@/services/admin/company/deleteCompany';
import { Company } from '@/types/company.type';
import { getAllCompanyPaginationService } from '@/services/admin/company/getAllCompany';
import { Pencil, Trash2 } from 'lucide-react';
import CompanyForm from './company/CompanyForm';
import CompanyDeleteConfirmation from './company/CompanyDeleteConfirmation';
import { getAllUserService } from '@/services/admin/user/getAllUser';
import { Badge } from '../ui/badge';
import { getAllPackageWithoutPaginationService } from '@/services/admin/package/getAllPackage';

const ManageCompaniesSection = () => {
  const [page, setPage] = useState<number>(1);
  const queryClient = useQueryClient();
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const handleCreate = () => {
    setSelectedCompany(null);
    setIsFormOpen(true);
  };

  const handleEdit = (company: Company) => {
    setSelectedCompany(company);
    setIsFormOpen(true);
  };

  const { mutate: deleteCompany } = useMutation({
    mutationFn: deleteCompanyService,
    onSuccess: (result) => {
      if (result.status) {
        toast.success(result.message);
        queryClient.invalidateQueries({ queryKey: ['company'] });
      } else {
        toast.error(result.message);
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const { data: companyData } = useQuery({
    queryKey: ['company', page],
    queryFn: () => getAllCompanyPaginationService(page),
  });

  const { data: userData } = useQuery({
    queryKey: ['userData'],
    queryFn: getAllUserService,
  });

  const { data: packageData } = useQuery({
    queryKey: ['packageData'],
    queryFn: getAllPackageWithoutPaginationService,
  });

  const handleDelete = (company: Company) => {
    setSelectedCompany(company);
    setIsDeleteOpen(true);
  };

  const confirmDelete = (company: Company) => {
    if (selectedCompany) {
      deleteCompany(company.company_id);
    }
    setIsDeleteOpen(false);
  };

  useEffect(() => {
    if (
      companyData &&
      'data' in companyData &&
      companyData.data.length === 0 &&
      page > 1
    ) {
      setPage(1);
    }
  }, [companyData, page]);

  if (!companyData) return <p>Loading...</p>;
  if (!('data' in companyData)) return <p>Failed to fetch data</p>;
  if (!userData) return <p>Loading...</p>;
  if (!userData.status) return <p>Failed to fetch data</p>;
  if (!packageData) return <p>Loading...</p>;
  if (!packageData.status) return <p>Failed to fetch data</p>;

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
              <BreadcrumbLink href="#">List Company</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      {/* Main Content */}
      <div className="p-4 md:p-8 h-full min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto h-full flex flex-col">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                List Company
              </h1>
              <p className="text-gray-600">Manage all companies</p>
            </div>
            <Button onClick={handleCreate}>+ Add Company</Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {companyData.data.map((company) => (
              <div
                key={company.company_id}
                className="flex items-center justify-between border rounded-lg px-4 py-4"
              >
                <div className="space-y-2">
                  <div className="flex flex-col items-start">
                    <h3 className="text-lg font-semibold">
                      {company.company_name}
                    </h3>
                    <p className="text-sm">
                      {`PIC : 
                      ${
                        userData.data.find(
                          (user) =>
                            user.companies[0].company_id === company.company_id
                        )?.user_name
                      } 
                      - 
                      ${
                        userData.data.find(
                          (user) =>
                            user.companies[0].company_id === company.company_id
                        )?.user_email
                      }`}
                    </p>
                    <p className="text-sm">{company.company_address}</p>
                  </div>
                  {packageData.data.filter(
                    (pkg) =>
                      pkg.user.companies[0].company_id === company.company_id &&
                      pkg.package_status === 'received'
                  ).length > 0 && (
                    <Badge
                      variant="default"
                      className="py-1 px-2 rounded-xl"
                    >{`Unclaimed Package : ${
                      packageData.data.filter(
                        (pkg) =>
                          pkg.user.companies[0].company_id ===
                            company.company_id &&
                          pkg.package_status === 'received'
                      ).length
                    }`}</Badge>
                  )}
                  {packageData.data.filter(
                    (pkg) =>
                      pkg.user.companies[0].company_id === company.company_id &&
                      pkg.package_status === 'expired'
                  ).length > 0 && (
                    <Badge
                      variant="destructive"
                      className="py-1 px-2 rounded-xl"
                    >{`Expired Package : ${
                      packageData.data.filter(
                        (pkg) =>
                          pkg.user.companies[0].company_id ===
                            company.company_id &&
                          pkg.package_status === 'expired'
                      ).length
                    }`}</Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant={'ghost'}
                    onClick={() => handleEdit(company)}
                    className="bg-amber-400 hover:text-white hover:bg-amber-500 text-white p-2 rounded-md"
                  >
                    <Pencil className="transition-transform" />
                  </Button>
                  <Button
                    onClick={() => handleDelete(company)}
                    className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-md"
                  >
                    <Trash2 className="transition-transform" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {companyData.data && (
            <div className="mt-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      className="cursor-pointer"
                      onClick={() => page > 1 && setPage(page - 1)}
                    />
                  </PaginationItem>

                  {Array.from(
                    { length: companyData.meta.max_page },
                    (_, index) => (
                      <PaginationItem key={index}>
                        <PaginationLink
                          className="cursor-pointer"
                          isActive={page === index + 1}
                          onClick={() => {
                            setPage(index + 1);
                          }}
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
                        page < companyData.meta.max_page && setPage(page + 1)
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}

          <CompanyForm
            key={selectedCompany?.company_id ?? 'new'}
            isOpen={isFormOpen}
            onClose={() => setIsFormOpen(false)}
            company={selectedCompany}
          />

          <CompanyDeleteConfirmation
            isOpen={isDeleteOpen}
            onClose={() => setIsDeleteOpen(false)}
            onConfirm={() => {
              if (selectedCompany) confirmDelete(selectedCompany);
            }}
            company={selectedCompany}
          />
        </div>
      </div>
    </SidebarInset>
  );
};

export default ManageCompaniesSection;
