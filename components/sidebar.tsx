"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Settings, FolderKanban, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function Sidebar({ user }: { user: any }) {
  const pathname = usePathname();

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Projects", href: "/projects", icon: FolderKanban },
    // { label: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <div className="w-64 border-r bg-white flex flex-col h-full">
      <div className="p-6">
        <img src="/logo.svg" height={60} width={60}/>
        <h1 className="text-xl font-bold tracking-tight text-primary italic">Jirassic</h1>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors",
              pathname === item.href ? "bg-slate-100 text-primary" : "text-muted-foreground hover:bg-slate-50"
            )}
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t mt-auto">
        <Link
          href="/settings"
        >
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold">
            {user.fullName[0]}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium truncate">{user.fullName}</p>
            <p className="text-xs text-muted-foreground truncate">{user.role}</p>
          </div>
        </div>
        </Link>
        <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => fetch('/api/auth/logout', { method: 'POST' }).then(() => window.location.href = '/login')}>
          <LogOut className="w-4 h-4 mr-2" /> Logout
        </Button>
      </div>
    </div>
  );
}