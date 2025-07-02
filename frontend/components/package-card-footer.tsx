// components/PackageCardFooter.tsx
import { AlertTriangle, CheckCircle, Clock } from "lucide-react";

export function PackageCardFooter({ status }: { status: string }) {
  if (status === "Kadaluarsa") {
    return (
      <>
        <div className="flex items-center gap-2 text-sm">
          <AlertTriangle className="w-4 h-4 text-red-500" />
          <span className={`font-medium text-red-600`}>
            {status}
          </span>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-md p-2">
          <p className="text-xs text-red-700 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Paket tidak diambil dalam batas waktu
          </p>
        </div>
      </>
    );
  }

  if (status === "Sudah diambil") {
    return (
      <div className="flex items-center gap-2 text-sm">
        <CheckCircle className="w-4 h-4 text-green-500" />
        <span className="font-medium text-green-600">{status}</span>
      </div>
    );
  }

  return null;
}
