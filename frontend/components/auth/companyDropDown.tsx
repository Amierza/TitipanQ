"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { getAllCompanyClientService } from "@/services/client/company/getAllCompany";

const SelectCompany = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) => {
  const {
    data: companyData,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["companyData"],
    queryFn: getAllCompanyClientService,
  });

  if (isLoading) {
    return (
      <Select disabled>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Loading companies..." />
        </SelectTrigger>
      </Select>
    );
  }

  if (error || !companyData?.status) {
    return (
      <Select disabled>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Failed to load companies" />
        </SelectTrigger>
      </Select>
    );
  }

  return (
    <Select onValueChange={onChange} defaultValue={value}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select a company" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {companyData.data.map((company) => (
            <SelectItem key={company.company_id} value={company.company_id}>
              {company.company_name}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export default SelectCompany;
