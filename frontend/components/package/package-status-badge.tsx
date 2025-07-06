export function PackageStatusBadge({ status }: { status: string }) {
  const color = status === "completed" ? "bg-green-600" : "bg-red-600";
  const label = status === "completed" ? "Completed" : "Expired";

  return (
    <span className={`px-3 py-1 text-white text-xs rounded-full ${color}`}>
      {label}
    </span>
  );
}
