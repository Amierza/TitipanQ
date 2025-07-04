interface Props {
  isActive: boolean
}

export function UserStatusBadge({ isActive }: Props) {
  return (
    <span
      className={`px-3 py-1 text-xs font-medium rounded-full text-white ${
        isActive ? "bg-green-600" : "bg-gray-400"
      }`}
    >
      {isActive ? "Active" : "Inactive"}
    </span>
  )
}