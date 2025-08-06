'use client';

import PackageForm from '@/components/package/package-form';
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { useQuery } from '@tanstack/react-query';
import { getAllUserService } from '@/services/admin/user/getAllUser';
import { getAllLockerService } from '@/services/admin/locker/getAllLocker';

const NewPackageSection = () => {
  const {
    data: userData,
    error,
    isLoading,
  } = useQuery({
    queryKey: ['users'],
    queryFn: getAllUserService,
  });

  const { data: lockerData } = useQuery({
    queryKey: ['locker'],
    queryFn: () => getAllLockerService({ pagination: false }),
  });

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Failed to fetch data</p>;

  return (
    <SidebarInset>
      {/* Header */}
      <header className="flex h-16 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="#">Add Package</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      {/* Main Content */}
      <div className="p-4 md:p-8 h-full min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto h-full flex flex-col">
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              Add New Package
            </h1>
            <p className="text-gray-600">Fill in the new package details</p>
          </div>

          <PackageForm
            users={
              userData?.status
                ? userData.data.map((user) => ({
                    id: user.user_id,
                    name: user.user_name,
                  }))
                : []
            }
            lockers={
              lockerData?.status
                ? lockerData.data.map((locker) => ({
                    id: locker.locker_id,
                    locker_number: locker.locker_code,
                  }))
                : []
            }
          />
        </div>
      </div>
    </SidebarInset>
  );
};

export default NewPackageSection;
