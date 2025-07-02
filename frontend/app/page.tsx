export default function HomePage() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <h1 className="text-4xl font-bold">Selamat Datang di TitipanQ</h1>
        <p className="text-muted-foreground mt-2">
          Kelola paket dan surat masuk untuk perusahaan Anda dengan mudah.
        </p>
        <div className="mt-6 space-x-4">
          <a href="/login" className="px-4 py-2 bg-primary text-white rounded-md">
            Login
          </a>
          <a href="/register" className="px-4 py-2 border rounded-md">
            Daftar
          </a>
        </div>
      </div>
    </div>
  )
}
