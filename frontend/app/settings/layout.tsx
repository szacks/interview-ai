import type React from "react"
import { Sidebar } from "@/components/layout/Sidebar"

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1">{children}</div>
    </div>
  )
}
