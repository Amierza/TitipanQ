'use client';

import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { getAllCompanyService } from '@/services/admin/company/getAllCompany';
import { useRouter } from 'next/navigation';

const HistorySenderSection = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const { data: companyData } = useQuery({
    queryKey: ['company'],
    queryFn: getAllCompanyService,
  });

  if (!companyData) return <p>Failed to fetch company data</p>;
  if (!companyData.status) return <p>Failed to fetch company data</p>;

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
              <BreadcrumbLink href="#">List Sender</BreadcrumbLink>
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
                List Sender
              </h1>
              <p className="text-gray-600">
                View senders whose packages have been sent
              </p>
            </div>

            <div className="flex gap-4">
              <Button
                className="cursor-pointer"
                onClick={() => router.push('/admin/package/new')}
              >
                + Add New Sender
              </Button>
            </div>
          </div>

          <div className="flex flex-row justify-between gap-6">
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
          </div>
        </div>
      </div>
    </SidebarInset>
  );
};

export default HistorySenderSection;
