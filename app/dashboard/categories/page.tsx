"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  selectCategory,
  selectLoading,
  selectError,
} from "@/lib/redux/categorySlice";
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
import { Loader, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import type { Category } from "@/lib/redux/categorySlice";

type CategoryForm = {
  name: string;
  categoryCode: string;
  image: File | string;
};

const emptyForm: CategoryForm = { name: "", categoryCode: "", image: "" };

const CategoryPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const categories = useSelector(selectCategory);
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);

  const [form, setForm] = useState<CategoryForm>(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      setForm({ ...form, image: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleAdd = async () => {
    setActionLoadingId("add");
    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("categoryCode", form.categoryCode);
    if (form.image instanceof File) formData.append("image", form.image);
    await dispatch(addCategory(formData));
    setForm(emptyForm);
    setImagePreview(null);
    setDialogOpen(false);
    setActionLoadingId(null);
    dispatch(fetchCategories());
  };

  const handleEdit = (cat: Category) => {
    setEditId(cat._id ?? null);
    setForm({ name: cat.name, categoryCode: cat.categoryCode, image: "" });
    setImagePreview(cat.image || null);
    setDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (editId) {
      setActionLoadingId(editId);
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("categoryCode", form.categoryCode);
      if (form.image instanceof File) formData.append("image", form.image);
      await dispatch(updateCategory(editId, formData));
      setEditId(null);
      setForm(emptyForm);
      setImagePreview(null);
      setDialogOpen(false);
      setActionLoadingId(null);
      dispatch(fetchCategories());
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      setActionLoadingId(id);
      await dispatch(deleteCategory(id));
      setActionLoadingId(null);
      dispatch(fetchCategories());
    }
  };

  return (
    <div className="w-full mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Categories</h1>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setForm(emptyForm);
            setImagePreview(null);
            setEditId(null);
          }
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditId(null); setForm(emptyForm); setImagePreview(null); }}>Add Category</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editId ? "Edit Category" : "Add Category"}</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={e => {
                e.preventDefault();
                editId ? handleUpdate() : handleAdd();
              }}
              className="space-y-4"
            >
              <div>
                <Label htmlFor="name" className="mb-2">Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Name"
                  value={form.name}
                  onChange={handleInput}
                  required
                />
              </div>
              <div>
                <Label htmlFor="categoryCode" className="mb-2">Category Code</Label>
                <Input
                  id="categoryCode"
                  name="categoryCode"
                  placeholder="Category Code"
                  value={form.categoryCode}
                  onChange={handleInput}
                  required
                />
              </div>
              <div>
                <Label htmlFor="image" className="mb-2">Image</Label>
                <input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/80"
                />
              </div>
              {imagePreview ? (
                <div className="mt-2">
                  <Image src={imagePreview} alt="Preview" className="h-40 w-40 object-cover rounded" width={100} height={100} />
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
                  <Button type="button" variant="outline" onClick={() => { setEditId(null); setForm(emptyForm); setImagePreview(null); }}>Cancel</Button>
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
          <table className="w-full text-left">
            <thead>
              <tr>
                <th className="py-2">Name</th>
                <th className="py-2">Code</th>
                <th className="py-2">Image</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories && categories.length > 0 ? (
                categories.map((cat: Category) => (
                  <tr key={cat._id} className="border-t">
                    <td className="py-2">{cat.name}</td>
                    <td className="py-2">{cat.categoryCode}</td>
                    <td className="py-2">
                      {cat.image ? <Image src={cat.image} alt={cat.name} className="h-8 w-8 object-cover rounded" width={100} height={100} /> : "-"}
                    </td>
                    <td className="py-2 flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(cat)} disabled={actionLoadingId === cat._id}>
                        {actionLoadingId === cat._id && editId === cat._id ? (
                          <Loader className="animate-spin mr-2" size={16} />
                        ) : null}
                        Edit
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(cat._id!)} disabled={actionLoadingId === cat._id}>
                        {actionLoadingId === cat._id ? (
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
                    No categories found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;