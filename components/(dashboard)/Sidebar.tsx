"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Users,
  FileText,
  Contact,
  LogOut,
  User,
  X,
  Home,
  Settings,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutGrid },
  { name: "Home", href: "/dashboard/home", icon: Home },
  { name: "Category", href: "/dashboard/category", icon: FileText },
  { name: "Products", href: "/dashboard/products", icon: Contact },
  { name: "Distributors", href: "/dashboard/distributors", icon: Users },
  { name: "Orders", href: "/dashboard/orders", icon: User },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
  { name: "Logout", href: "/logout", icon: LogOut },
];

export default function Sidebar({ isOpen, onClose }: { isOpen?: boolean; onClose?: () => void }) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 bg-black/50 lg:hidden z-40 transition-opacity duration-300 ease-in-out ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 flex-col border-r bg-white 
        transform transition-all duration-300 ease-in-out
        ${isOpen ? 'translate-x-0 shadow-xl' : '-translate-x-full'}
        lg:translate-x-0 lg:flex lg:shadow-none
      `}>
        {/* Close button for mobile */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 text-slate-600 hover:text-slate-900 lg:hidden"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Sidebar Header */}
        <div className="flex flex-col items-center gap-2 border-b px-8 py-4">
          <Link
            href="/"
            className="text-2xl font-extrabold tracking-tight text-slate-900"
          >
            NLP
          </Link>
          <div className="h-1 w-3/4 rounded-full bg-gradient-to-r from-blue-500 to-purple-600" />
        </div>

        <div className="flex-1 overflow-y-auto py-8">
          <nav className="grid items-start gap-4 px-6 text-base font-medium">
            {navigation.map((item) => {
              const isActive =
                item.href === "/dashboard"
                  ? pathname === item.href
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => {
                    if (window.innerWidth < 1024) { // Only close on mobile/tablet
                      onClose?.();
                    }
                  }}
                  className={`
                    relative flex items-center gap-4 rounded-xl px-5 py-4 text-slate-600 
                    transition-all duration-200 ease-in-out text-lg
                    ${!isActive 
                      ? "hover:bg-purple-500/10 hover:text-purple-600 hover:scale-[0.98]" 
                      : "bg-white text-purple-600 font-bold shadow-sm"}
                  `}
                >
                  {isActive && (
                    <div className="absolute left-0 h-8 w-1 rounded-r-full bg-purple-600" />
                  )}

                  <item.icon
                    className={`h-7 w-7 transition-colors duration-200${isActive ? " text-purple-600" : ""}`}
                  />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}
