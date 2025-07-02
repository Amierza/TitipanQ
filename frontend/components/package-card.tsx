// components/PackageCard.tsx
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Calendar, User } from "lucide-react";
import Image from "next/image";
import { ReactNode } from "react";
import { StatusBadge } from "./status-badge";

interface PackageItem {
  id: number;
  status: string;
  sender: string;
  received_date: string;
  photo_url: string;
}

interface Props {
  item: PackageItem;
  highlight?: boolean;
  topRightBadge?: ReactNode;
  cardClassName?: string;
  footer?: ReactNode;
}

export function PackageCard({ item, topRightBadge, cardClassName = "", footer }: Props) {
  return (
    <Card className={cardClassName}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <StatusBadge status={item.status} />
          <span className="text-xs text-muted-foreground">#{item.id}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="relative">
          <Image
            src={item.photo_url}
            alt="Paket"
            width={400}
            height={200}
            className={`w-full h-32 object-cover rounded-md ${item.status === "Kadaluarsa" ? "grayscale-[30%]" : ""}`}
          />
          {topRightBadge && (
            <div className="absolute top-2 right-2">
              {topRightBadge}
            </div>
          )}
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">Pengirim:</span>
            <span>{item.sender}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">Diterima:</span>
            <span>{item.received_date}</span>
          </div>
        </div>

        {footer}
      </CardContent>
    </Card>
  );
}
