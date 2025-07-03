export type PackageHistory = {
  id: string
  recipientName: string
  email: string
  company: string
  photoUrl: string
  status: "picked_up" | "expired"
  date: string
}

export const dummyPackageHistory: PackageHistory[] = [
  {
    id: "1",
    recipientName: "John Doe",
    email: "john@company.com",
    company: "PT Alpha",
    photoUrl: "/assets/paket1.jpg",
    status: "picked_up",
    date: "2025-07-01"
  },
  {
    id: "2",
    recipientName: "Jane Smith",
    email: "jane@ptbeta.com",
    company: "PT Beta",
    photoUrl: "/assets/paket2.jpg",
    status: "expired",
    date: "2025-06-30"
  },
  {
    id: "3",
    recipientName: "Michael Johnson",
    email: "mike@ptgamma.com",
    company: "PT Gamma",
    photoUrl: "/assets/paket1.jpg",
    status: "picked_up",
    date: "2025-06-29"
  },
  {
    id: "4",
    recipientName: "Michael Johnson",
    email: "mike@ptgamma.com",
    company: "PT Gamma",
    photoUrl: "/assets/paket1.jpg",
    status: "expired",
    date: "2025-06-29"
  },
  {
    id: "5",
    recipientName: "Michael Johnson",
    email: "mike@ptgamma.com",
    company: "PT Gamma",
    photoUrl: "/assets/paket1.jpg",
    status: "expired",
    date: "2025-06-29"
  },
  {
    id: "6",
    recipientName: "Michael Johnson",
    email: "mike@ptgamma.com",
    company: "PT Gamma",
    photoUrl: "/assets/paket1.jpg",
    status: "picked_up",
    date: "2025-06-29"
  },
  {
    id: "7",
    recipientName: "Michael Johnson",
    email: "mike@ptgamma.com",
    company: "PT Gamma",
    photoUrl: "/assets/paket1.jpg",
    status: "picked_up",
    date: "2025-06-29"
  }
]
