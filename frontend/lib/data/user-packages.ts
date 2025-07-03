// lib/data/user-packages.ts

export interface UserPackage {
  id: number;
  sender: string;
  received_date: string;
  photo_url: string;
  status: "Menunggu diambil" | "Sudah diambil" | "Kadaluarsa";
}

export const userPackages: UserPackage[] = [
  {
    id: 1001,
    sender: "PT. JNE Express",
    received_date: "2025-07-01",
    photo_url: "/assets/paket1.jpg",
    status: "Menunggu diambil",
  },
  {
    id: 1007,
    sender: "PT. JNE Express",
    received_date: "2025-07-01",
    photo_url: "/assets/paket1.jpg",
    status: "Menunggu diambil",
  },
  {
    id: 1008,
    sender: "PT. JNE Express",
    received_date: "2025-07-01",
    photo_url: "/assets/paket1.jpg",
    status: "Menunggu diambil",
  },
  {
    id: 1002,
    sender: "Shopee Indonesia",
    received_date: "2025-06-30",
    photo_url: "/assets/paket2.jpg",
    status: "Sudah diambil",
  },
  {
    id: 1003,
    sender: "Tokopedia",
    received_date: "2025-06-28",
    photo_url: "/assets/paket1.jpg",
    status: "Kadaluarsa",
  },
  {
    id: 1004,
    sender: "Bukalapak",
    received_date: "2025-06-25",
    photo_url: "/assets/paket2.jpg",
    status: "Sudah diambil",
  },
  {
    id: 1005,
    sender: "Lazada Indonesia",
    received_date: "2025-07-01",
    photo_url: "/assets/paket1.jpg",
    status: "Menunggu diambil",
  },
  {
    id: 1006,
    sender: "Blibli",
    received_date: "2025-06-26",
    photo_url: "/assets/paket2.jpg",
    status: "Kadaluarsa",
  },
];
