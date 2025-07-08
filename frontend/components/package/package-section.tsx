// components/PackageSection.tsx
import {
  Clock,
  PackageCheck,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { PackageCard, PackageItem } from "./package-card";

type PackageStatus = "received" | "delivered" | "completed" | "expired";

export function PackageSection({
  title,
  icon,
  items,
  highlight,
  cardProps = {},
}: {
  title: string;
  icon: PackageStatus;
  items: PackageItem[];
  highlight?: boolean;
  cardProps?: {
    topRightBadge?: (item: PackageItem) => React.ReactNode;
    cardClassName?: string;
    footer?: (item: PackageItem) => React.ReactNode;
  };
}) {
  let Icon;
  let iconClass = "";

  switch (icon) {
    case "received":
      Icon = Clock;
      iconClass = "text-yellow-500";
      break;
    case "delivered":
      Icon = PackageCheck;
      iconClass = "text-blue-500";
      break;
    case "completed":
      Icon = CheckCircle;
      iconClass = "text-green-500";
      break;
    case "expired":
    default:
      Icon = AlertTriangle;
      iconClass = "text-red-500";
      break;
  }

  return (
    <div>
      <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
        <Icon className={`w-5 h-5 ${iconClass}`} />
        {title}
      </h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <PackageCard
            key={item.package_id}
            item={item}
            highlight={highlight}
            topRightBadge={cardProps.topRightBadge?.(item)}
            cardClassName={cardProps.cardClassName}
            footer={cardProps.footer?.(item)}
          />
        ))}
      </div>
    </div>
  );
}
