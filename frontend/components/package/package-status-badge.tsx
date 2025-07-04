interface Props {
  status: "picked_up" | "expired"
}

export function PackageStatusBadge({ status }: Props) {
  const color = status === "picked_up" ? "bg-green-600" : "bg-red-600"
  const label = status === "picked_up" ? "Picked Up" : "Expired"

  return (
    <span className={`px-3 py-1 text-white text-xs rounded-full ${color}`}>
      {label}
    </span>
  )
}
