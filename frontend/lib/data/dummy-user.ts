// data/dummyUsers.ts

export interface UserData {
  id: string
  name: string
  email: string
  phone: string
  company: string
  role: "admin" | "user"
  active: boolean
}

export const dummyUsers: UserData[] = [
  {
    id: "1",
    name: "Alice Johnson",
    email: "alice@company.com",
    phone: "081234567890",
    company: "PT Alpha",
    role: "admin",
    active: true
  },
  {
    id: "2",
    name: "Bob Smith",
    email: "bob@company.com",
    phone: "082345678901",
    company: "PT Beta",
    role: "user",
    active: false
  },
  {
    id: "3",
    name: "Clara Lim",
    email: "clara@company.com",
    phone: "083456789012",
    company: "PT Gamma",
    role: "user",
    active: true
  }
]
