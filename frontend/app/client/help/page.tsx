// app/user/help/page.tsx
"use client"

import { useEffect } from "react"

export default function HelpPage() {
  useEffect(() => {
    window.location.href = "https://wa.me/6281234567890"
  }, [])

  return <p>Redirecting to Admin WhatsApp...</p>
}
