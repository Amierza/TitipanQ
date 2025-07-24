import { AlertTriangle, CheckCircle, Clock, Inbox, Truck } from "lucide-react";
import { JSX } from "react";
import { PackageHistoryItem } from "@/types/package-history";

interface PackageCardFooterProps {
  status: string;
  histories?: PackageHistoryItem[];
}

const STATUS_META: Record<
  string,
  {
    label: string;
    icon: JSX.Element;
    colorClass: string;
  }
> = {
  received: {
    label: "Received",
    icon: <Inbox className="w-4 h-4 text-yellow-500" />,
    colorClass: "text-yellow-600",
  },
  delivered: {
    label: "Delivered",
    icon: <Truck className="w-4 h-4 text-blue-500" />,
    colorClass: "text-blue-600",
  },
  completed: {
    label: "completed",
    icon: <CheckCircle className="w-4 h-4 text-green-500" />,
    colorClass: "text-green-600",
  },
  expired: {
    label: "Expired",
    icon: <AlertTriangle className="w-4 h-4 text-red-500" />,
    colorClass: "text-red-600",
  },
};

export function PackageCardFooter({
  // status,
  histories = [],
}: PackageCardFooterProps) {
  // const meta = STATUS_META[status] ?? {
  //   label: capitalize(status),
  //   icon: <Clock className="w-4 h-4 text-muted-foreground" />,
  //   colorClass: "text-muted-foreground",
  // };

  const sorted = [...histories].sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  return (
    <div className="space-y-2">
      {/* Riwayat Status */}
      <div className="space-y-1 text-xs text-muted-foreground">
        {sorted.map((history) => {
          const icon = STATUS_META[history.history_status]?.icon ?? (
            <Clock className="w-3 h-3" />
          );
          return (
            <div key={history.history_id} className="flex items-center gap-1">
              {icon}
              <span>
                {capitalize(history.history_status)} at{" "}
                {new Date(history.created_at).toLocaleString("id-ID", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
