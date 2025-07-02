// app/dashboard/page.tsx

import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function Page() {
  // Dummy data
  const stats = {
    diterima: 12,
    diambil: 8,
    kadaluarsa: 2,
  }

  const paketList = [
    {
      nama: "Budi Santoso",
      perusahaan: "PT. Maju Terus",
      jenis: "Barang",
      status: "Diterima",
    },
    {
      nama: "Siti Aminah",
      perusahaan: "PT. Amanah",
      jenis: "Surat",
      status: "Diambil",
    },
    {
      nama: "Rudi Hartono",
      perusahaan: "PT. Lampu Terang",
      jenis: "Barang",
      status: "Kadaluarsa",
    },
  ]

const getStatusBadge = (status: string) => {
  const variant =
    status === "Diterima"
      ? "default"
      : status === "Diambil"
      ? "secondary" 
      : "destructive"
  return <Badge variant={variant}>{status}</Badge>
}
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="#">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        {/* Main content */}
        <div className="flex flex-1 flex-col gap-4 p-4">
          {/* Stat Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Paket Diterima</CardTitle>
              </CardHeader>
              <CardContent className="text-3xl font-bold">
                {stats.diterima}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Paket Diambil</CardTitle>
              </CardHeader>
              <CardContent className="text-3xl font-bold text-green-600">
                {stats.diambil}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Paket Kadaluarsa</CardTitle>
              </CardHeader>
              <CardContent className="text-3xl font-bold text-red-600">
                {stats.kadaluarsa}
              </CardContent>
            </Card>
          </div>

          {/* Table */}
          <Card>
            <CardHeader>
              <CardTitle>Daftar Paket</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>No</TableHead>
                    <TableHead>Nama Penerima</TableHead>
                    <TableHead>Perusahaan</TableHead>
                    <TableHead>Jenis</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paketList.map((paket, index) => (
                    <TableRow key={index}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{paket.nama}</TableCell>
                      <TableCell>{paket.perusahaan}</TableCell>
                      <TableCell>{paket.jenis}</TableCell>
                      <TableCell>{getStatusBadge(paket.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
