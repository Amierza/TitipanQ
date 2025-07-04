// components/PackageSection.tsx
import { Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { PackageCard } from "./package-card";

interface PackageItem {
  id: number;
  status: string;
  sender: string;
  received_date: string;
  photo_url: string;
}

type IconType = "pending" | "done" | "expired";

export function PackageSection({
  title,
  icon,
  items,
  highlight,
  cardProps = {},
}: {
  title: string;
  icon: IconType;
  items: PackageItem[];
  highlight?: boolean;
  cardProps?: {
    topRightBadge?: (item: PackageItem) => React.ReactNode;
    cardClassName?: string;
    footer?: (item: PackageItem) => React.ReactNode;
  };
}) {
  const Icon = icon === "pending" ? Clock : icon === "done" ? CheckCircle : AlertTriangle;
  const iconClass =
    icon === "pending"
      ? "text-orange-500"
      : icon === "done"
      ? "text-green-500"
      : "text-red-500";

  return (
    <div>
      <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
        <Icon className={`w-5 h-5 ${iconClass}`} />
        {title}
      </h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <PackageCard
            key={item.id}
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
