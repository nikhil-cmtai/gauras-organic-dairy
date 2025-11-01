"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchUsers,
  addUser,
  updateUser,
  deleteUser,
  selectUsers,
  selectLoading,
  selectError,
} from "@/lib/redux/userSlice";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader, Loader2 } from "lucide-react";
import type { AppDispatch } from "@/lib/store";
import type { User } from "@/lib/redux/userSlice";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type UserForm = {
  name: string;
  email: string;
  phone: string;
  address: string;
  role: string;
  referCode: string;
};

const emptyForm: UserForm = {
  name: "",
  email: "",
  phone: "",
  address: "",
  role: "delivery",
  referCode: "",
};

const DeliveryPartnersPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const allUsers = useSelector(selectUsers);
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);

  // Filter users with delivery role
  const deliveryPartners = allUsers.filter(
    (user: User) => user.role === "delivery" || user.role === "deliveryBoy"
  );

  const [form, setForm] = useState<UserForm>(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const handleInput = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditId(null);
  };

  const handleAdd = async () => {
    setActionLoadingId("add");
    const userData: Partial<User> = {
      name: form.name,
      email: form.email,
      phone: form.phone,
      address: form.address,
      role: form.role,
      referCode: form.referCode || generateReferCode(),
      wallet: {
        balance: 0,
        transactions: [],
      },
    };

    await dispatch(addUser(userData));
    resetForm();
    setDialogOpen(false);
    setActionLoadingId(null);
    dispatch(fetchUsers());
  };

  const handleEdit = (user: User) => {
    setEditId(user._id ?? null);
    setForm({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      address: user.address || "",
      role: user.role || "delivery",
      referCode: user.referCode || "",
    });
    setDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (editId) {
      setActionLoadingId(editId);
      const userData: Partial<User> = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        address: form.address,
        role: form.role,
        referCode: form.referCode,
      };

      await dispatch(updateUser(editId, userData));
      resetForm();
      setDialogOpen(false);
      setActionLoadingId(null);
      dispatch(fetchUsers());
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this delivery partner?")) {
      setActionLoadingId(id);
      await dispatch(deleteUser(id));
      setActionLoadingId(null);
      dispatch(fetchUsers());
    }
  };

  const generateReferCode = (): string => {
    return Math.random().toString(36).substring(2, 9).toUpperCase();
  };

  return (
    <div className="w-full mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Delivery Partners</h1>
        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) {
              resetForm();
            }
          }}
        >
          <DialogTrigger asChild>
            <Button onClick={resetForm}>Add Delivery Partner</Button>
          </DialogTrigger>
          <DialogContent className="overflow-y-auto max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>
                {editId ? "Edit Delivery Partner" : "Add Delivery Partner"}
              </DialogTitle>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                editId ? handleUpdate() : handleAdd();
              }}
              className="space-y-4"
            >
              <div>
                <Label htmlFor="name" className="mb-2">
                  Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Full Name"
                  value={form.name}
                  onChange={handleInput}
                  required
                />
              </div>

              <div>
                <Label htmlFor="email" className="mb-2">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Email Address"
                  value={form.email}
                  onChange={handleInput}
                  required
                />
              </div>

              <div>
                <Label htmlFor="phone" className="mb-2">
                  Phone
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="Phone Number"
                  value={form.phone}
                  onChange={handleInput}
                  required
                />
              </div>

              <div>
                <Label htmlFor="address" className="mb-2">
                  Address
                </Label>
                <Textarea
                  id="address"
                  name="address"
                  placeholder="Delivery Address"
                  value={form.address}
                  onChange={handleInput}
                  className="h-20"
                  required
                />
              </div>

              <div>
                <Label htmlFor="referCode" className="mb-2">
                  Refer Code
                </Label>
                <Input
                  id="referCode"
                  name="referCode"
                  placeholder="Refer Code (auto-generated if empty)"
                  value={form.referCode}
                  onChange={handleInput}
                />
                {!editId && (
                  <p className="text-xs text-gray-500 mt-1">
                    Leave empty to auto-generate
                  </p>
                )}
              </div>

              <DialogFooter>
                <Button
                  type="submit"
                  disabled={
                    !!(loading || actionLoadingId === "add" || (editId && actionLoadingId === editId))
                  }
                >
                  {(loading ||
                    actionLoadingId === "add" ||
                    (editId && actionLoadingId === editId)) ? (
                    <Loader className="animate-spin mr-2" size={18} />
                  ) : null}
                  {editId ? "Update" : "Add"}
                </Button>
                <DialogClose asChild>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                  >
                    Cancel
                  </Button>
                </DialogClose>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
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
                  <th className="py-3 px-4 text-left">Actions</th>
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
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(partner)}
                            disabled={actionLoadingId === partner._id}
                          >
                            {actionLoadingId === partner._id && editId === partner._id ? (
                              <Loader className="animate-spin mr-2" size={16} />
                            ) : null}
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(partner._id!)}
                            disabled={actionLoadingId === partner._id}
                          >
                            {actionLoadingId === partner._id ? (
                              <Loader className="animate-spin mr-2" size={16} />
                            ) : null}
                            Delete
                          </Button>
                        </div>
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
