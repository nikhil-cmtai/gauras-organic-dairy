"use client";

import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchHomes,
  addHome,
  updateHome,
  deleteHome,
  selectHomes,
  selectLoading,
  selectError,
} from "@/lib/redux/homeSlice";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import type { AppDispatch } from "@/lib/store";
import { Loader } from "lucide-react";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import type { Home } from "@/lib/redux/homeSlice";

// Form type for local state (logo and banners can be File or string)
type HomeForm = {
  company: string;
  logo: File | string | null;
  banners: (File | string)[];
};

const emptyForm: HomeForm = { company: "", logo: null, banners: [] };

const HomePage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const homes = useSelector(selectHomes);
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);

  const [form, setForm] = useState<HomeForm>(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerPreviews, setBannerPreviews] = useState<string[]>([]);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Refs for file inputs to reset them
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannersInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    dispatch(fetchHomes());
  }, [dispatch]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      setForm({ ...form, logo: file });
      setLogoPreview(URL.createObjectURL(file));
    } else {
      setForm({ ...form, logo: null });
      setLogoPreview(null);
    }
  };

  const handleBannersChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    setForm({ ...form, banners: files });
    setBannerPreviews(files.map(file => URL.createObjectURL(file)));
  };

  const resetFormAndPreviews = () => {
    setForm(emptyForm);
    setLogoPreview(null);
    setBannerPreviews([]);
    setEditId(null);
    // Reset file inputs so they don't retain previous files
    if (logoInputRef.current) logoInputRef.current.value = "";
    if (bannersInputRef.current) bannersInputRef.current.value = "";
  };

  const handleAdd = async () => {
    setActionLoadingId("add");
    const formData = new FormData();
    formData.append("company", form.company);
    if (form.logo instanceof File) formData.append("logo", form.logo);
    if (form.banners && form.banners.length > 0) {
      (form.banners as (File | string)[]).forEach((file) => {
        if (file instanceof File) formData.append("banners", file);
      });
    }
    await dispatch(addHome(formData));
    resetFormAndPreviews();
    setDialogOpen(false);
    setActionLoadingId(null);
    dispatch(fetchHomes());
  };

  const handleEdit = (home: Home) => {
    setEditId(home._id ?? null);
    setForm({
      company: home.company ?? "",
      logo: null,
      banners: [],
    });
    setLogoPreview(home.logo ? String(home.logo) : null);
    setBannerPreviews(Array.isArray(home.banners) ? home.banners.map(String) : []);
    setDialogOpen(true);
    // Reset file inputs so they don't retain previous files
    setTimeout(() => {
      if (logoInputRef.current) logoInputRef.current.value = "";
      if (bannersInputRef.current) bannersInputRef.current.value = "";
    }, 0);
  };

  const handleUpdate = async () => {
    if (editId) {
      setActionLoadingId(editId);
      const formData = new FormData();
      formData.append("company", form.company);
      if (form.logo instanceof File) formData.append("logo", form.logo);
      if (form.banners && form.banners.length > 0) {
        (form.banners as (File | string)[]).forEach((file) => {
          if (file instanceof File) formData.append("banners", file);
        });
      }
      await dispatch(updateHome(editId, formData));
      resetFormAndPreviews();
      setDialogOpen(false);
      setActionLoadingId(null);
      dispatch(fetchHomes());
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this home entry?")) {
      setActionLoadingId(id);
      await dispatch(deleteHome(id));
      setActionLoadingId(null);
      dispatch(fetchHomes());
    }
  };

  return (
    <div className="w-full mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Home Entries</h1>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            resetFormAndPreviews();
          }
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetFormAndPreviews(); }}>Add Home</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editId ? "Edit Home" : "Add Home"}</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={e => {
                e.preventDefault();
                editId ? handleUpdate() : handleAdd();
              }}
              className="space-y-4"
            >
              <div>
                <Label htmlFor="company" className="mb-2">Company</Label>
                <Input
                  id="company"
                  name="company"
                  placeholder="Company"
                  value={form.company ?? ""}
                  onChange={handleInput}
                  required
                />
              </div>
              <div>
                <Label htmlFor="logo" className="mb-2">Logo</Label>
                <input
                  id="logo"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/80"
                  ref={logoInputRef}
                />
              </div>
              {logoPreview && (
                <div className="mt-2">
                  <Image src={logoPreview} alt="Logo Preview" className="h-32 w-32 object-cover rounded" width={100} height={100} />
                </div>
              )}
              <div>
                <Label htmlFor="banners" className="mb-2">Banners</Label>
                <input
                  id="banners"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleBannersChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/80"
                  ref={bannersInputRef}
                />
              </div>
              {bannerPreviews.length > 0 ? (
                <div className="flex gap-2 mt-2 flex-wrap">
                  {bannerPreviews.map((src, idx) => (
                    <Image key={idx} src={src} alt={`Banner ${idx + 1}`} className="h-24 w-40 object-cover rounded" width={100} height={100} />
                  ))}
                </div>
              ) : null}
              <DialogFooter>
                <Button type="submit" disabled={!!(loading || actionLoadingId === "add" || (editId && actionLoadingId === editId))}>
                  {(loading || actionLoadingId === "add" || (editId && actionLoadingId === editId)) ? (
                    <Loader className="animate-spin mr-2" size={18} />
                  ) : null}
                  {editId ? "Update" : "Add"}
                </Button>
                <DialogClose asChild>
                  <Button type="button" variant="outline" onClick={() => { resetFormAndPreviews(); }}>Cancel</Button>
                </DialogClose>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <div className="bg-white rounded shadow p-4">
        <table className="w-full text-left">
          <thead>
            <tr>
              <th className="py-2">Company Name</th>
              <th className="py-2">Logo</th>
              <th className="py-2">Banners</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {homes && homes.length > 0 ? (
              homes.map((home: Home) => (
                <tr key={home._id} className="border-t">
                  <td className="py-2">{home.company}</td>
                  <td className="py-2">
                    {home.logo ? <Image src={String(home.logo)} alt="Logo" className="h-12 w-12 object-cover rounded" width={100} height={100} /> : "-"}
                  </td>
                  <td className="py-2">
                    <div className="flex gap-1 flex-wrap">
                      {Array.isArray(home.banners) && home.banners.length > 0 ? (
                        home.banners.map((src: string, idx: number) => (
                          <Image key={idx} src={String(src)} alt={`Banner ${idx + 1}`} className="h-8 w-20 object-cover rounded" width={100} height={100} />
                        ))
                      ) : (
                        "-"
                      )}
                    </div>
                  </td>
                  <td className="py-2 flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(home)} disabled={actionLoadingId === home._id}>
                      {actionLoadingId === home._id && editId === home._id ? (
                        <Loader className="animate-spin mr-2" size={16} />
                      ) : null}
                      Edit
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(home._id!)} disabled={actionLoadingId === home._id}>
                      {actionLoadingId === home._id ? (
                        <Loader className="animate-spin mr-2" size={16} />
                      ) : null}
                      Delete
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="text-center py-4 text-muted-foreground">
                  No home entries found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HomePage;