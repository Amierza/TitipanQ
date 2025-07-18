import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { FileText, CalendarX } from "lucide-react";
import Image from "next/image";
import { ReactNode } from "react";
import { imageUrl } from "@/config/api";

export interface PackageItem {
  package_id: string;
  package_description: string;
  package_image: string;
  package_type: string;
  package_status: string;
  package_delivered_at: string;
  package_expired_at: string;
}

interface Props {
  item: PackageItem;
  highlight?: boolean;
  topRightBadge?: ReactNode;
  cardClassName?: string;
  footer?: ReactNode;
}

export function PackageCard({
  item,
  topRightBadge,
  cardClassName = "",
  footer,
}: Props) {

  const getFullImageUrl = (imagePath: string) => {
    if (!imagePath) return "/assets/default_image.jpg";

    if (imagePath.startsWith("http")) return imagePath;

    return `${imageUrl}/package/${imagePath}`;
  };
  return (
    <Card
      className={`rounded-2xl shadow-md overflow-hidden transition hover:shadow-lg ${cardClassName}`}
    >
      {/* Header */}
      <CardHeader className="pb-1 pt-4 px-4">
        <div className="flex flex-col items-start gap-0.5">
          <span className="text-xs text-muted-foreground font-mono">
            #{item.package_id}
          </span>
        </div>
      </CardHeader>

      {/* Image */}
      <div className="relative px-4">
        <Image
          src={getFullImageUrl(item.package_image)}
          alt="Package"
          width={400}
          height={200}
          className={`w-full h-36 object-cover rounded-lg transition ${item.package_status === "expired" ? "grayscale" : ""
            }`}
        />
        {topRightBadge && (
          <div className="absolute top-3 right-6">{topRightBadge}</div>
        )}
      </div>

      {/* Content */}
      <CardContent className="space-y-3 pt-4 px-4 pb-2 text-sm">
        {/* Deskripsi Paket */}
        <div className="flex items-start gap-2 text-muted-foreground">
          <FileText className="w-4 h-4 mt-0.5" />
          <div>
            <span className="block font-semibold text-foreground mb-0.5">
              Description
            </span>
            <p className="text-sm">{item.package_description}</p>
          </div>
        </div>

        {/* Tanggal Expired */}
        {item.package_expired_at && (
          <div className="flex items-start gap-2 text-muted-foreground">
            <CalendarX className="w-4 h-4 mt-0.5" />
            <div>
              <span className="block font-semibold text-foreground mb-0.5">
                Expired At
              </span>
              <p className="text-sm">
                {new Date(item.package_expired_at).toLocaleDateString("id-ID", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        )}

        {/* Footer (Histori Status) */}
        {footer && <div className="pt-2">{footer}</div>}
      </CardContent>
    </Card>
  );
}
