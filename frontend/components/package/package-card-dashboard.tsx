import { StatusBadge } from "../status-badge";
import Image from "next/image";
import { Card, CardContent, CardHeader } from "../ui/card";
import { CalendarX, FileText, User } from "lucide-react";
import { Package } from "@/types/package.type";
import { imageUrl } from "@/config/api";

const PackageCardDashboard = ({ pkg }: { pkg: Package }) => {
  const getFullImageUrl = (imagePath: string) => {
    if (!imagePath) return "/assets/default_image.jpg";
    if (imagePath.startsWith("http")) return imagePath;

    return `${imageUrl}/package/${imagePath}`;
  };

  return (
    <Card
      className={`rounded-2xl shadow-md overflow-hidden transition hover:shadow-lg`}
    >
      {/* Header */}
      <CardHeader className="px-4">
        <div className="flex flex-col items-start gap-2">
          <StatusBadge status={pkg.package_status} />
          <span className="text-[10px] font-mono text-gray-500">
            #{pkg.package_id}
          </span>
        </div>
      </CardHeader>

      {/* Image */}
      <div className="relative px-4">
        <Image
          src={getFullImageUrl(pkg.package_image)}
          alt={pkg.package_description}
          width={400}
          height={200}
          className={`w-full h-[120px] object-cover rounded-lg transition ${
            pkg.package_status === "expired" ? "grayscale" : ""
          }`}
        />
      </div>

      {/* Content */}
      <CardContent className="space-y-3 pt-2 px-4 text-sm">
        {/* User Information */}
        <div className="flex items-start gap-2 text-muted-foreground">
          <User className="w-4 h-4 mt-0.5" />
          <div className="space-y-1">
            <span className="block font-semibold text-foreground mb-0.5">
              {pkg.user.user_name}
            </span>
            {pkg.user.company.company_name !== "" && (
              <p className="text-xs">
                {pkg.user.company.company_name || "Company"}
              </p>
            )}
            <p className="text-xs">
              {pkg.user.company.company_address ||
                pkg.user.user_address ||
                "Address"}
            </p>
          </div>
        </div>

        {/* Deskripsi Paket */}
        <div className="flex items-start gap-2 text-muted-foreground">
          <FileText className="w-4 h-4 mt-0.5" />
          <div>
            <span className="block font-semibold text-foreground mb-0.5">
              Description
            </span>
            <p className="text-sm">{pkg.package_description}</p>
          </div>
        </div>

        {/* Tanggal Expired */}
        {pkg.package_expired_at && (
          <div className="flex items-start gap-2 text-muted-foreground">
            <CalendarX className="w-4 h-4 mt-0.5" />
            <div>
              <span className="block font-semibold text-foreground mb-0.5">
                Expired At
              </span>
              <p className="text-sm">
                {new Date(pkg.package_expired_at).toLocaleDateString("id-ID", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PackageCardDashboard;
