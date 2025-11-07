"use client";

import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchUsers,
  selectUsers,
  selectLoading,
  selectError,
} from "@/lib/redux/userSlice";
import { Loader2 } from "lucide-react";
import type { AppDispatch } from "@/lib/store";
import type { User } from "@/lib/redux/userSlice";

const DeliveryPartnersPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const allUsers = useSelector(selectUsers);
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);

  // Filter users with delivery role
  const deliveryPartners = allUsers.filter(
    (user: User) => user.role === "delivery" || user.role === "deliveryBoy"
  );


  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);



  return (
    <div className="w-full mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Delivery Partners</h1>

      </div>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      <div className="bg-white rounded shadow p-4">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="animate-spin h-8 w-8 text-purple-500" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="py-3 px-4 text-left">Name</th>
                  <th className="py-3 px-4 text-left">Email</th>
                  <th className="py-3 px-4 text-left">Phone</th>
                  <th className="py-3 px-4 text-left">Address</th>
                  <th className="py-3 px-4 text-left">Wallet Balance</th>
                  <th className="py-3 px-4 text-left">Refer Code</th>
                  <th className="py-3 px-4 text-left">Created At</th>
                </tr>
              </thead>
              <tbody>
                {deliveryPartners && deliveryPartners.length > 0 ? (
                  deliveryPartners.map((partner: User) => (
                    <tr key={partner._id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{partner.name || "-"}</td>
                      <td className="py-3 px-4">{partner.email || "-"}</td>
                      <td className="py-3 px-4">{partner.phone || "-"}</td>
                      <td className="py-3 px-4 max-w-xs truncate">
                        {partner.address || "-"}
                      </td>
                      <td className="py-3 px-4">
                        ₹{partner.wallet?.balance?.toFixed(2) || "0.00"}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                          {partner.referCode || "-"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {partner.createdAt
                          ? new Date(partner.createdAt).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : "-"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="text-center py-4 text-muted-foreground">
                      No delivery partners found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryPartnersPage;
