import {
  Clock,
  CheckCircle,
  PackageCheck,
  AlertTriangle,
} from "lucide-react";

export function PackageStatusBadge({ status }: { status: string }) {
  let icon;
  let color;
  let label;

  switch (status) {
    case "received":
      icon = Clock;
      color = "bg-blue-500 text-white";
      label = "Received";
      break;
    case "delivered":
      icon = PackageCheck;
      color = "bg-yellow-500 text-white";
      label = "Delivered";
      break;
    case "completed":
      icon = CheckCircle;
      color = "bg-green-600 text-white";
      label = "Completed";
      break;
    case "expired":
    default:
      icon = AlertTriangle;
      color = "bg-red-600 text-white";
      label = "Expired";
      break;
  }

  const Icon = icon;

  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs rounded-full ${color}`}>
      <Icon size={14} className="shrink-0" />
      {label}
    </span>
  );
}
