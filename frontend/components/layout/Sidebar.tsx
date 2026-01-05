"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Code2, ClipboardList, Settings, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Sidebar() {
  const pathname = usePathname()

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(path + "/")
  }

  const navItems = [
    {
      name: "Interviews",
      href: "/dashboard",
      icon: ClipboardList,
      active: isActive("/dashboard"),
    },
    {
      name: "Questions",
      href: "/questions",
      icon: Code2,
      active: isActive("/questions"),
    },
    {
      name: "Settings",
      href: "/settings",
      icon: Settings,
      active: isActive("/settings"),
    },
  ]

  return (
    <aside className="w-64 bg-black border-r border-gray-800 h-screen flex flex-col fixed left-0 top-0">
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Code2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white">InterviewAI</h1>
            <p className="text-xs text-gray-400">Acme Inc.</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={item.active ? "default" : "ghost"}
                className={`w-full justify-start gap-3 h-11 ${
                  item.active
                    ? "bg-primary hover:bg-primary/90 text-white"
                    : "text-gray-400 hover:text-white hover:bg-gray-900"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.name}</span>
              </Button>
            </Link>
          )
        })}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-900">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium text-primary">
            JD
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white">John Doe</p>
            <p className="text-xs text-gray-400 truncate">john@example.com</p>
          </div>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 h-11 text-gray-300 hover:text-white hover:bg-gray-900 mt-2"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Log Out</span>
        </Button>
      </div>
    </aside>
  )
}
