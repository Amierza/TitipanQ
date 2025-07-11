import { Badge } from "@/components/ui/badge";
import { Clock, Package } from "lucide-react";

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const getVariant = () => {
    switch (status) {
      case "received":
        return "default";
      case "delivered":
        return "warning";
      case "completed":
        return "success";
      case "expired":
        return "destructive";
      default:
        return "default";
    }
  };

  const getIcon = () => {
    switch (status) {
      case "Waiting to be picked up":
        return <Clock className="w-3 h-3" />;
      case "Picked up":
        return <Package className="w-3 h-3" />;
      default:
        return <Clock className="w-3 h-3" />;
    }
  };

  return (
    <Badge variant={getVariant()} className="flex items-center gap-1">
      {getIcon()}
      {status}
    </Badge>
  );
}
