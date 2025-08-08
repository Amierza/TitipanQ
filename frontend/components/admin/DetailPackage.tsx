'use client';

import { useParams } from 'next/navigation';
import Image from 'next/image';
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from '@/components/ui/breadcrumb';
import { useQuery } from '@tanstack/react-query';
import { getPackageService } from '@/services/admin/package/getDetailPackage';
import { imageUrl } from '@/config/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import dayjs from 'dayjs';
import { Badge } from '@/components/ui/badge';
import {
  Package,
  User,
  Building,
  MapPin,
  FileText,
  Barcode,
  Image as ImageIcon,
  Phone,
  CheckCircle2,
  Backpack,
  Send,
} from 'lucide-react';
import { getAllHistoryPackageService } from '@/services/admin/package/getHistoryPackage';

const DetailPackageSection = () => {
  const params = useParams();
  const packageId = params.id as string;

  const { data: packageData } = useQuery({
    queryKey: ['package'],
    queryFn: () => getPackageService(packageId),
  });

  const { data: historyPackageData } = useQuery({
    queryKey: ['historyPackage', packageId],
    queryFn: () => getAllHistoryPackageService(packageId),
    enabled: !!packageId,
  });

  if (!packageData) return <p>Failed to fetch data</p>;
  if (!packageData.status) return <p>Package not found</p>;
  if (!historyPackageData) return <p>Failed to fetch data</p>;
  if (!historyPackageData.status) return <p>Package not found</p>;

  const receivedHistory = historyPackageData.data.find(
    (history) => history.history_status === 'received'
  );
  const completedHistory = historyPackageData.data.find(
    (history) => history.history_status === 'completed'
  );

  const getFullImagePackageUrl = (imagePath: string) => {
    if (!imagePath) return '/assets/default_image.jpg';
    if (imagePath.startsWith('http')) return imagePath;
    return `${imageUrl}/package/${imagePath}`;
  };

  const getStatusBadge = (status: string) => {
    const variant =
      status === 'received'
        ? 'default'
        : status === 'completed'
        ? 'success'
        : status === 'delivered'
        ? 'warning'
        : 'destructive';
    return (
      <Badge className="capitalize py-1" variant={variant}>
        {status}
      </Badge>
    );
  };

  return (
    <SidebarInset>
      {/* Header */}
      <header className="flex h-16 items-center gap-2 border-b px-4 bg-white">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink
                href="#"
                className="text-gray-600 hover:text-gray-800"
              >
                Packages
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbLink href="#" className="text-gray-800 font-medium">
                Detail Package
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      {/* Main Content */}
      <div className="p-4 md:p-8 h-full min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-2">
                <Package className="w-7 h-7" />
                Package Details
              </h1>
              <p className="text-gray-600 mt-1">
                Package ID:{' '}
                <span className="font-medium">
                  {packageData.data.package_id}
                </span>
              </p>
            </div>
            <div className={`px-3 py- text-sm font-medium`}>
              {getStatusBadge(packageData.data.package_status)}
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Package Images */}
            <div className="lg:col-span-1 space-y-4">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ImageIcon className="w-5 h-5" />
                    Package Images
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Package Photo
                    </h4>
                    <div className="relative">
                      <Image
                        src={getFullImagePackageUrl(
                          packageData.data.package_image
                        )}
                        alt={`Photo of ${packageData.data.package_description}`}
                        width={300}
                        height={200}
                        className="w-full h-48 object-cover rounded-lg border border-gray-200"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardContent className="space-y-4 text-sm">
                  <div className="flex gap-2">
                    <div className="flex items-start h-fit rounded-full border border-blue-200 bg-blue-100 p-2">
                      <Package className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                      <p>
                        {`Received date : ${dayjs(
                          packageData.data.created_at
                        ).format('DD MMM YYYY, dddd HH:ss')}`}
                      </p>
                      {receivedHistory && (
                        <p className="text-gray-400 text-xs">
                          {`Changed by : ${receivedHistory.changed_by.user_name}`}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <div className="flex items-start h-fit rounded-full border border-green-200 bg-green-100 p-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    </div>
                    <div>
                      <p>{`Complete date : ${
                        packageData.data.package_status === 'completed'
                          ? dayjs(packageData.data.updated_at).format(
                              'DD MMM YYYY, dddd HH:ss'
                            )
                          : '-'
                      }`}</p>
                      {completedHistory && (
                        <p className="text-gray-400 text-xs">
                          {`Changed by : ${completedHistory.changed_by.user_name}`}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Package Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Package Details */}
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Package Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <PackageInfoComponent
                      title="Tracking Code"
                      information={packageData.data.package_tracking_code}
                      icon={<Barcode className="w-4 h-4" />}
                    />
                    <PackageInfoComponent
                      title="Locker"
                      information={packageData.data.locker.locker_code}
                      icon={<Barcode className="w-4 h-4" />}
                    />
                    <PackageInfoComponent
                      title="Package Type"
                      information={packageData.data.package_type}
                      icon={<Package className="w-4 h-4" />}
                    />
                    <PackageInfoComponent
                      title="Quantity"
                      information={packageData.data.package_quantity}
                      icon={<Backpack className="w-4 h-4" />}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <PackageInfoComponent
                      title="Description"
                      information={packageData.data.package_description}
                      icon={<FileText className="w-4 h-4" />}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Sender Details */}
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Send className="w-5 h-5" />
                    Sender Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <PackageInfoComponent
                      title="Name"
                      information={packageData.data.sender.sender_name}
                      icon={<User className="w-4 h-4" />}
                    />
                    <PackageInfoComponent
                      title="Phone Number"
                      information={packageData.data.sender.sender_phone_number}
                      icon={<Phone className="w-4 h-4" />}
                    />
                    <div className="md:col-span-2">
                      <PackageInfoComponent
                        title="Address"
                        information={packageData.data.sender.sender_address}
                        icon={<MapPin className="w-4 h-4" />}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* User & Company Information */}
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="w-5 h-5" />
                    User & Company Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <PackageInfoComponent
                      title="User Name"
                      information={packageData.data.user.user_name}
                      icon={<User className="w-4 h-4" />}
                    />
                    <PackageInfoComponent
                      title="Phone Number"
                      information={packageData.data.user.user_phone_number}
                      icon={<Phone className="w-4 h-4" />}
                    />
                    <PackageInfoComponent
                      title="Company Name"
                      information={packageData.data.user.company.company_name}
                      icon={<Building className="w-4 h-4" />}
                    />
                    <PackageInfoComponent
                      title="Company Address"
                      information={
                        packageData.data.user.company.company_address
                      }
                      icon={<MapPin className="w-4 h-4" />}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </SidebarInset>
  );
};

export default DetailPackageSection;

const PackageInfoComponent = ({
  title,
  information,
  icon,
}: {
  title: string;
  information: string | number;
  icon?: React.ReactNode;
}) => {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
        {icon}
        {title}
      </h3>
      <p className="text-gray-800 bg-gray-50 p-3 rounded-lg border border-gray-200 min-h-[2.5rem] flex items-center">
        {information || 'N/A'}
      </p>
    </div>
  );
};
