// app/user/layout.tsx
import { UserSidebar } from "@/components/user-sidebar"

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <UserSidebar />
      <main className="flex-1 p-6 bg-gray-50 min-h-screen">
        {children}
      </main>
    </div>
  )
}
