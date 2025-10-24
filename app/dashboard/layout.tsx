"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/(dashboard)/Header";
import Sidebar from "@/components/(dashboard)/Sidebar";
import { useDispatch } from "react-redux";
import { setUser } from "@/lib/redux/authSlice";
import { isAuthenticated, getUser, clearUserData } from "@/lib/auth";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const dispatch = useDispatch();

  useEffect(() => {
    // Check if user is authenticated using utility function
    if (!isAuthenticated()) {
      // Redirect to login if not authenticated
      router.push('/login');
    } else {
      try {
        // Get user data from localStorage using utility function
        const user = getUser();
        if (user) {
          // Set user data in Redux state
          dispatch(setUser(user));
          setIsLoading(false);
        } else {
          throw new Error('User data not found');
        }
      } catch (error) {
        console.error('Failed to load user data:', error);
        // Clear user data using utility function
        clearUserData();
        router.push('/login');
      }
    }
  }, [dispatch, router]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
      <div className="flex-1 flex flex-col lg:ml-64">
        <Header title="Dashboard" onMenuClick={toggleSidebar} />
        <main className="flex-1 bg-[var(--background)] p-6 overflow-hidden">{children}</main>
      </div>
    </div>
  );
}

