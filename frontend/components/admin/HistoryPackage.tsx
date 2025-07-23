"use client";

import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import HistoryTable from "../history-table";
import { useState } from "react";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useQuery } from "@tanstack/react-query";
import { getAllCompanyService } from "@/services/admin/company/getAllCompany";
import { useRouter } from "next/navigation";

const HistoryPackageSection = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [companyFilter, setCompanyFilter] = useState<string | undefined>();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const router = useRouter();

  const { data: companyData } = useQuery({
    queryKey: ["company"],
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
              <BreadcrumbLink href="#">List Package</BreadcrumbLink>
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
                List Package
              </h1>
              <p className="text-gray-600">
                View picked-up or expired packages from all companies
              </p>
            </div>

            <div className="flex gap-4">
              <Button 
                className="cursor-pointer" 
                onClick={() => router.push("/admin/package/new")}
              >
                + Add Package
              </Button>
              <Button 
                variant={"ghost"} 
                className="cursor-pointer bg-green-500 hover:bg-green-600" 
                onClick={() => router.push("/admin/package/new")}
              >
                Update Package
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

            <div className="flex flex-row gap-4">
              <Select onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Status</SelectLabel>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="received">Received</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
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
                        (company) => company.company_id === value
                      )?.company_name
                      : "Select company..."}
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
                            setValue("");
                            setCompanyFilter(undefined);
                            setOpen(false);
                          }}
                        >
                          All companies
                          <Check
                            className={cn(
                              "ml-auto",
                              value === "" ? "opacity-100" : "opacity-0"
                            )}
                          />
                        </CommandItem>

                        {companyData.data.map((company) => (
                          <CommandItem
                            key={company.company_id}
                            value={company.company_id}
                            onSelect={(currentValue) => {
                              setValue(
                                currentValue === value ? "" : currentValue
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
                                "ml-auto",
                                value === company.company_id
                                  ? "opacity-100"
                                  : "opacity-0"
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
            />
          </div>
        </div>
      </div>
    </SidebarInset>
  );
};

export default HistoryPackageSection;
