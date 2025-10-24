"use client";

import React from "react";
import { Users as UsersIcon, Package, ShoppingCart, Layers, Home as HomeIcon } from "lucide-react";
import Chart from "@/components/ui/Chart";
import { useSelector } from "react-redux";
import { selectCount } from "@/lib/redux/countSlice";   


export default function Dashboard() {
    const count = useSelector(selectCount);



    return (
        <div className="space-y-6">
            {Array.isArray(count) && count.map((company, idx) => (
                <div key={company.company || idx} className="w-full rounded-lg border bg-white p-6 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <HomeIcon className="h-6 w-6 text-purple-600" />
                        <span className="text-lg font-bold text-slate-900">{company.company}</span>
                    </div>
                    <div className="grid gap-6 grid-cols-1 md:grid-cols-4">
                        <div className="flex flex-col items-center justify-center min-h-[120px] p-6 rounded-2xl bg-purple-50 shadow-sm hover:shadow-md transition">
                            <Package className="h-10 w-10 text-purple-500 mb-2" />
                            <div className="text-base text-slate-600">Products</div>
                            <div className="text-3xl font-bold text-slate-900">{company.productCount}</div>
                        </div>
                        <div className="flex flex-col items-center justify-center min-h-[120px] p-6 rounded-2xl bg-blue-50 shadow-sm hover:shadow-md transition">
                            <Layers className="h-10 w-10 text-blue-500 mb-2" />
                            <div className="text-base text-slate-600">Categories</div>
                            <div className="text-3xl font-bold text-slate-900">{company.categoryCount}</div>
                        </div>
                        <div className="flex flex-col items-center justify-center min-h-[120px] p-6 rounded-2xl bg-green-50 shadow-sm hover:shadow-md transition">
                            <ShoppingCart className="h-10 w-10 text-green-500 mb-2" />
                            <div className="text-base text-slate-600">Wholesaler Orders</div>
                            <div className="text-3xl font-bold text-slate-900">{company.wholesalerOrdersCount}</div>
                        </div>
                        <div className="flex flex-col items-center justify-center min-h-[120px] p-6 rounded-2xl bg-yellow-50 shadow-sm hover:shadow-md transition">
                            <UsersIcon className="h-10 w-10 text-yellow-500 mb-2" />
                            <div className="text-base text-slate-600">Distributor Orders</div>
                            <div className="text-3xl font-bold text-slate-900">{company.distributorOrdersCount}</div>
                        </div>
                    </div>
                </div>
            ))}

            {/* Chart Section */}
            <div className="rounded-lg border bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Overview</h2>
                <Chart />
            </div>

        </div>
    );
}
