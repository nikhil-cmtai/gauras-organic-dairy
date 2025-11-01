"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchSettings,
  updateSettings,
  addCoupon,
  selectSettings,
  selectSettingsLoading,
  selectSettingsError,
} from "@/lib/redux/settingSlice";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader, Loader2, X } from "lucide-react";
import type { AppDispatch } from "@/lib/store";
import type { Settings, Coupon } from "@/lib/redux/settingSlice";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import Image from "next/image";

type CouponForm = {
  name: string;
  discountTitle: string;
  discountAmount: string;
  discountType: "percentage" | "fixed" | "";
};

const emptyCouponForm: CouponForm = {
  name: "",
  discountTitle: "",
  discountAmount: "",
  discountType: "",
};

const SettingsPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const settings = useSelector(selectSettings);
  const loading = useSelector(selectSettingsLoading);
  const error = useSelector(selectSettingsError);

  const [form, setForm] = useState({
    gst: "",
    deliveryCharge: "",
    extraCharge: "",
  });
  const [loginImageUrls, setLoginImageUrls] = useState<string[]>([]);
  const [couponForm, setCouponForm] = useState<CouponForm>(emptyCouponForm);
  const [couponDialogOpen, setCouponDialogOpen] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    dispatch(fetchSettings());
  }, [dispatch]);

  useEffect(() => {
    if (settings) {
      setForm({
        gst: settings.gst?.toString() || "",
        deliveryCharge: settings.deliveryCharge?.toString() || "",
        extraCharge: settings.extraCharge?.toString() || "",
      });
      setLoginImageUrls(settings.loginImageUrls || []);
    }
  }, [settings]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleCouponInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCouponForm({ ...couponForm, [name]: value });
  };

  const handleCouponTypeChange = (value: "percentage" | "fixed") => {
    setCouponForm({ ...couponForm, discountType: value });
  };

  const handleSave = async () => {
    if (!settings?._id) return;
    setSaving(true);
    setActionLoadingId("save");

    const updates: Partial<Settings> = {
      gst: Number(form.gst) || 0,
      deliveryCharge: Number(form.deliveryCharge) || 0,
      extraCharge: Number(form.extraCharge) || 0,
      loginImageUrls: loginImageUrls,
    };

    await dispatch(updateSettings(settings._id, updates));
    setActionLoadingId(null);
    setSaving(false);
    dispatch(fetchSettings());
  };

  const handleAddImageUrl = () => {
    if (newImageUrl.trim()) {
      setLoginImageUrls([...loginImageUrls, newImageUrl.trim()]);
      setNewImageUrl("");
    }
  };

  const handleRemoveImageUrl = (index: number) => {
    const newUrls = loginImageUrls.filter((_, i) => i !== index);
    setLoginImageUrls(newUrls);
  };

  const handleAddCoupon = async () => {
    if (!settings?._id) return;
    if (!couponForm.name || !couponForm.discountTitle || !couponForm.discountAmount || !couponForm.discountType) {
      return;
    }

    setActionLoadingId("addCoupon");
    const coupon: Coupon = {
      name: couponForm.name,
      discountTitle: couponForm.discountTitle,
      discountAmount: Number(couponForm.discountAmount) || 0,
      discountType: couponForm.discountType as "percentage" | "fixed",
    };

    await dispatch(addCoupon(settings._id, coupon));
    setCouponForm(emptyCouponForm);
    setCouponDialogOpen(false);
    setActionLoadingId(null);
    dispatch(fetchSettings());
  };

  const handleRemoveCoupon = async (index: number) => {
    if (!settings?._id || !settings.coupons) return;

    const updatedCoupons = settings.coupons.filter((_, i) => i !== index);
    await dispatch(
      updateSettings(settings._id, {
        ...settings,
        coupons: updatedCoupons,
      })
    );
    dispatch(fetchSettings());
  };

  return (
    <div className="w-full mx-auto">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      {error && <div className="text-red-500 mb-4">{error}</div>}

      {loading && !settings ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="animate-spin h-8 w-8 text-purple-500" />
        </div>
      ) : (
        <div className="bg-white rounded shadow p-6 space-y-6">
          {/* Basic Settings */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Basic Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="gst" className="mb-2">
                  GST (%)
                </Label>
                <Input
                  id="gst"
                  name="gst"
                  type="number"
                  placeholder="GST Percentage"
                  value={form.gst}
                  onChange={handleInput}
                />
              </div>
              <div>
                <Label htmlFor="deliveryCharge" className="mb-2">
                  Delivery Charge (₹)
                </Label>
                <Input
                  id="deliveryCharge"
                  name="deliveryCharge"
                  type="number"
                  placeholder="Delivery Charge"
                  value={form.deliveryCharge}
                  onChange={handleInput}
                />
              </div>
              <div>
                <Label htmlFor="extraCharge" className="mb-2">
                  Extra Charge (₹)
                </Label>
                <Input
                  id="extraCharge"
                  name="extraCharge"
                  type="number"
                  placeholder="Extra Charge"
                  value={form.extraCharge}
                  onChange={handleInput}
                />
              </div>
            </div>
          </div>

          {/* Login Images */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Login Images</h2>
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Image URL"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddImageUrl();
                  }
                }}
              />
              <Button type="button" onClick={handleAddImageUrl}>
                Add Image
              </Button>
            </div>
            {loginImageUrls.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {loginImageUrls.map((url, index) => (
                  <div key={index} className="relative">
                    <Image
                      src={url}
                      alt={`Login Image ${index + 1}`}
                      width={200}
                      height={200}
                      className="w-full h-32 object-cover rounded border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => handleRemoveImageUrl(index)}
                    >
                      <X size={14} />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Coupons */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Coupons</h2>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCouponDialogOpen(true)}
              >
                + Add Coupon
              </Button>
            </div>
            {settings?.coupons && settings.coupons.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="py-2 px-4 text-left">Name</th>
                      <th className="py-2 px-4 text-left">Discount Title</th>
                      <th className="py-2 px-4 text-left">Discount Amount</th>
                      <th className="py-2 px-4 text-left">Discount Type</th>
                      <th className="py-2 px-4 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {settings.coupons.map((coupon: Coupon, index: number) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-4">{coupon.name}</td>
                        <td className="py-2 px-4">{coupon.discountTitle}</td>
                        <td className="py-2 px-4">
                          {coupon.discountType === "percentage"
                            ? `${coupon.discountAmount}%`
                            : `₹${coupon.discountAmount}`}
                        </td>
                        <td className="py-2 px-4">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs capitalize">
                            {coupon.discountType}
                          </span>
                        </td>
                        <td className="py-2 px-4">
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRemoveCoupon(index)}
                          >
                            Remove
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No coupons added yet.</p>
            )}
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={saving || actionLoadingId === "save"}
            >
              {(saving || actionLoadingId === "save") && (
                <Loader className="animate-spin mr-2" size={18} />
              )}
              Save Settings
            </Button>
          </div>
        </div>
      )}

      {/* Add Coupon Dialog */}
      <Dialog open={couponDialogOpen} onOpenChange={setCouponDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Coupon</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="coupon-name">Coupon Name</Label>
              <Input
                id="coupon-name"
                name="name"
                placeholder="Coupon Name"
                value={couponForm.name}
                onChange={handleCouponInput}
                required
              />
            </div>
            <div>
              <Label htmlFor="coupon-title">Discount Title</Label>
              <Input
                id="coupon-title"
                name="discountTitle"
                placeholder="Discount Title"
                value={couponForm.discountTitle}
                onChange={handleCouponInput}
                required
              />
            </div>
            <div>
              <Label htmlFor="coupon-amount">Discount Amount</Label>
              <Input
                id="coupon-amount"
                name="discountAmount"
                type="number"
                placeholder="Discount Amount"
                value={couponForm.discountAmount}
                onChange={handleCouponInput}
                required
              />
            </div>
            <div>
              <Label htmlFor="coupon-type">Discount Type</Label>
              <Select
                value={couponForm.discountType}
                onValueChange={handleCouponTypeChange}
                required
              >
                <SelectTrigger id="coupon-type">
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="fixed">Fixed Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setCouponForm(emptyCouponForm);
                }}
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="button"
              onClick={handleAddCoupon}
              disabled={actionLoadingId === "addCoupon"}
            >
              {actionLoadingId === "addCoupon" && (
                <Loader className="animate-spin mr-2" size={18} />
              )}
              Add Coupon
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SettingsPage;
