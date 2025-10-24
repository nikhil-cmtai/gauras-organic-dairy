"use client";

import React, { useState } from "react";
import Header from "@/components/(dashboard)/Header";
import Sidebar from "@/components/(dashboard)/Sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

 

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);


  return (
    <div className="min-h-screen flex">
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
      <div className="flex-1 flex flex-col lg:ml-72">
        <Header title="Dashboard" onMenuClick={toggleSidebar} />
        <main className="flex-1 bg-[var(--background)] p-6 overflow-hidden">{children}</main>
      </div>
    </div>
  );
}

