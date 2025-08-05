'use client';

import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import HistoryTable from '../history-table';
import { useState } from 'react';
import { Input } from '../ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Archive, Check, ChevronsUpDown, QrCode } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getAllCompanyService } from '@/services/admin/company/getAllCompany';
import { useRouter } from 'next/navigation';
import QrScannerModal from '../package/package-open-camera';
import { updateStatusPackagesService } from '@/services/admin/package/updateStatusPackages';
import { toast } from 'sonner';

const HistoryPackageSection = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedId, setSelectedId] = useState<string[]>([]);
  const [openCameraModal, setOpenCameraModal] = useState(false);
  const [companyFilter, setCompanyFilter] = useState<string | undefined>();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const router = useRouter();

  const { data: companyData } = useQuery({
    queryKey: ['company'],
    queryFn: getAllCompanyService,
  });

  const { mutate: updateStatusPackages } = useMutation({
    mutationFn: updateStatusPackagesService,
    onSuccess: (result) => {
      if (result.status) {
        toast.success(result.message);
        queryClient.invalidateQueries({ queryKey: ['packageData'] });
      } else {
        toast.error(result.error);
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  if (!companyData) return <p>Failed to fetch company data</p>;
  if (!companyData.status) return <p>Failed to fetch company data</p>;

  const openCamera = () => {
    setOpenCameraModal(true);
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
            <BreadcrumbItem>
              <BreadcrumbLink href="#">List Package</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      {/* Main Content */}
      <div className="p-4 md:p-8 h-full min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto h-full flex flex-col">
          <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-4 gap-4">
            {/* Title + Deskripsi */}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                List Package
              </h1>
              <p className="text-gray-600">
                View picked-up or expired packages from all companies
              </p>
            </div>

            <div className="flex gap-2 md:gap-4">
              <Button
                variant={'ghost'}
                className="cursor-pointer bg-amber-500 hover:bg-amber-400 hover:text-white text-white font-semibold space-x-1"
                onClick={() => router.push('/admin/locker')}
              >
                <span>
                  <Archive />
                </span>
                Locker
              </Button>
              <Button
                className="cursor-pointer"
                onClick={() => router.push('/admin/package/new')}
              >
                + Add Package
              </Button>
              <Button
                disabled={selectedId.length === 0}
                variant={'ghost'}
                className="cursor-pointer bg-green-500 hover:bg-green-600"
                onClick={() =>
                  updateStatusPackages({ package_ids: selectedId })
                }
              >
                Update Package
              </Button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between md:gap-6">
            {/* Search form */}
            <div className="mb-4 max-w-md flex w-full items-center gap-2">
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by client or description"
                className="w-full px-4 py-2 border rounded-lg focus-visible:ring-black"
              />
              <Button
                variant={'ghost'}
                className="cursor-pointer bg-blue-500 hover:bg-blue-600"
                onClick={openCamera}
              >
                <QrCode className="text-white h-fit" />
              </Button>
            </div>

            <div className="flex flex-row gap-4 mb-4">
              <Select onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Status</SelectLabel>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="received">Received</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>

              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-fit justify-between bg-transparent"
                  >
                    {value
                      ? companyData.data.find(
                          (company) => company.company_name === value
                        )?.company_name
                      : 'Select company...'}
                    <ChevronsUpDown className="opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                  <Command>
                    <CommandInput
                      placeholder="Search company..."
                      className="h-9"
                    />
                    <CommandList>
                      <CommandEmpty>No company found.</CommandEmpty>
                      <CommandGroup>
                        <CommandItem
                          key="all"
                          value=""
                          onSelect={() => {
                            setValue('');
                            setCompanyFilter(undefined);
                            setOpen(false);
                          }}
                        >
                          All companies
                          <Check
                            className={cn(
                              'ml-auto',
                              value === '' ? 'opacity-100' : 'opacity-0'
                            )}
                          />
                        </CommandItem>

                        {companyData.data.map((company) => (
                          <CommandItem
                            key={company.company_id}
                            value={company.company_name}
                            onSelect={(currentValue) => {
                              setValue(
                                currentValue === value ? '' : currentValue
                              );
                              setCompanyFilter(
                                currentValue === value
                                  ? undefined
                                  : currentValue
                              );
                              setOpen(false);
                            }}
                          >
                            {company.company_name}
                            <Check
                              className={cn(
                                'ml-auto',
                                value === company.company_id
                                  ? 'opacity-100'
                                  : 'opacity-0'
                              )}
                            />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Table */}
          <div className="flex-1">
            <HistoryTable
              searchQuery={searchQuery}
              statusFilter={statusFilter}
              companyFilter={companyFilter}
              onSelectionChange={setSelectedId}
            />
          </div>
        </div>
      </div>

      <QrScannerModal
        open={openCameraModal}
        onClose={() => setOpenCameraModal(false)}
        onScanSuccess={(result) => {
          setSearchQuery(result); // misalnya langsung cari dengan QR hasil
        }}
      />
    </SidebarInset>
  );
};

export default HistoryPackageSection;
