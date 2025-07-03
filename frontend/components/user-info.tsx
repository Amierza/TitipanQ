interface Props {
  name: string
  email: string
}

export function UserInfo({ name, email }: Props) {
  return (
    <div>
      <div className="font-medium text-black">{name}</div>
      <div className="text-xs text-gray-500">{email}</div>
    </div>
  )
}
