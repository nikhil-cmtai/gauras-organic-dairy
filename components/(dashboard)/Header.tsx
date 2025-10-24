"use client";

import { LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function Header({ title, onMenuClick }: { title: string; onMenuClick?: () => void }) {
  const router = useRouter();

  const handleLogout = () => {
    // TODO: Add your logout logic here
    // router.push("/login"); // Uncomment if you want to redirect after logout
    router.push("/logout");
  };

  return (
    <header className="flex items-center justify-between border-b bg-white px-6 py-4 shadow-sm">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-8 w-8" />
        </Button>
        <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
      </div>
      <button
        onClick={handleLogout}
        className="flex items-center gap-2 rounded-lg px-4 py-2 text-slate-600 transition-colors duration-200 hover:bg-red-100 hover:text-red-600"
      >
        <LogOut className="h-5 w-5" />
        <span className="hidden sm:inline">Logout</span>
      </button>
    </header>
  );
}
