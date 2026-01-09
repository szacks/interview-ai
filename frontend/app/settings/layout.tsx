import type React from "react"
import { Sidebar } from "@/components/layout/Sidebar"

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <Sidebar />
      <div className="ml-64">{children}</div>
    </div>
  )
}
