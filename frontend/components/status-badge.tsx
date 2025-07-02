import { Badge } from "@/components/ui/badge";
import { Clock, Package } from "lucide-react";

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const getVariant = () => {
    switch (status) {
      case "Menunggu diambil":
        return "default";
      case "Sudah diambil":
        return "secondary";
      case "Dalam proses":
        return "outline";
      default:
        return "default";
    }
  };

  const getIcon = () => {
    switch (status) {
      case "Menunggu diambil":
        return <Clock className="w-3 h-3" />;
      case "Sudah diambil":
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
