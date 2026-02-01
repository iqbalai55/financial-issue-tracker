"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Home, ListChecks, PlusCircle, Menu, X, LogOut } from "lucide-react"
import { useState } from "react"
import clsx from "clsx"
import { createClient } from "@/lib/supabase-client" // pakai client yang sudah kamu buat

type NavItem = {
  label: string
  href?: string
  icon: React.ElementType
  action?: () => void
}

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [desktopOpen, setDesktopOpen] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)

  const supabase = createClient()

  const navItems: NavItem[] = [
    { label: "Create Issue", href: "/issues/new", icon: PlusCircle },
    { label: "Home", href: "/", icon: Home },
    { label: "List of Issues", href: "/issues", icon: ListChecks },
    {
      label: "Logout",
      icon: LogOut,
      action: async () => {
        await supabase.auth.signOut()
        router.push("/login") // redirect setelah logout
      },
    },
  ]

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="fixed inset-x-0 top-0 z-50 flex h-14 items-center gap-3 border-b bg-white px-4 md:hidden">
        <button onClick={() => setMobileOpen(true)}>
          <Menu className="h-5 w-5" />
        </button>
        <span className="font-semibold">Issue Tracker</span>
      </div>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          "fixed left-0 top-0 z-50 flex h-[100dvh] flex-col bg-white shadow-lg transition-all duration-300",
          desktopOpen ? "w-64" : "w-16",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          "md:translate-x-0"
        )}
      >
        {/* Header */}
        <div className="flex h-14 items-center justify-between border-b px-4">
          {desktopOpen && <h1 className="text-lg font-semibold">Issue Tracker</h1>}

          {/* Desktop toggle */}
          <button
            className="hidden md:block p-1 rounded hover:bg-gray-100"
            onClick={() => setDesktopOpen((v) => !v)}
          >
            {desktopOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          {/* Mobile close */}
          <button
            className="md:hidden p-1 rounded hover:bg-gray-100"
            onClick={() => setMobileOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 flex flex-col justify-between">
          <div className="space-y-2">
            {navItems
              .filter((item) => item.href)
              .map((item) => {
                const Icon = item.icon
                const active = pathname === item.href

                return (
                  <Link
                    key={item.href}
                    href={item.href!}
                    onClick={() => setMobileOpen(false)}
                    className={clsx(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
                      active
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-600 hover:bg-gray-100",
                      !desktopOpen && "justify-center px-0"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {desktopOpen && item.label}
                  </Link>
                )
              })}
          </div>

          {/* Logout */}
          {navItems
            .filter((item) => item.action)
            .map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.label}
                  onClick={item.action}
                  className={clsx(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition text-red-600 hover:bg-red-100",
                    !desktopOpen && "justify-center px-0"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {desktopOpen && item.label}
                </button>
              )
            })}
        </nav>
      </aside>
    </>
  )
}
