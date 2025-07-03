import Image from "next/image";
import { PackageHistory } from "../lib/data/dummy-history";
import { PackageStatusBadge } from "./package-status-badge";
import { UserInfo } from "./user-info";

interface HistoryTableProps {
  data: PackageHistory[];
}

export function HistoryTable({ data }: HistoryTableProps) {
  return (
    <div className="overflow-x-auto border rounded-xl">
      <table className="min-w-full table-auto bg-white text-sm">
        <thead className="bg-black text-white">
          <tr>
            <th className="p-3 text-left">Photo</th>
            <th className="p-3 text-left">Recipient</th>
            <th className="p-3 text-left">Company</th>
            <th className="p-3 text-left">Status</th>
            <th className="p-3 text-left">Date</th>
          </tr>
        </thead>
        <tbody>
          {data.map((pkg) => (
            <tr key={pkg.id} className="border-b hover:bg-gray-100">
              <td className="p-3">
                <Image
                  src={pkg.photoUrl}
                  alt="Package"
                  width={64}
                  height={64}
                  className="w-16 h-16 object-cover rounded-md"
                />
              </td>
              <td className="p-3">
                <UserInfo name={pkg.recipientName} email={pkg.email} />
              </td>
              <td className="p-3">{pkg.company}</td>
              <td className="p-3">
                <PackageStatusBadge status={pkg.status} />
              </td>
              <td className="p-3">{new Date(pkg.date).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
