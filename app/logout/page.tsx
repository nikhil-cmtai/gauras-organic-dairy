"use client";

import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { logoutUser } from "@/lib/redux/authSlice";
import { Loader2 } from "lucide-react";

const LogoutPage = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() => {
    localStorage.clear();
    dispatch(logoutUser());
    const timer = setTimeout(() => {
      router.replace("/login");
    }, 2000);
    return () => clearTimeout(timer);
  }, [dispatch, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh]">
      <Loader2 className="animate-spin mb-4 text-purple-600" size={40} />
      <div className="text-lg font-medium">Logging you out...</div>
      <div className="text-sm text-gray-500 mt-2">You will be redirected to login.</div>
    </div>
  );
};

export default LogoutPage;