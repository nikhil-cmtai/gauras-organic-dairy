"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  selectProducts,
  selectLoading as selectProductLoading,
  selectError as selectProductError,
} from "@/lib/redux/productSlice";
import {
  fetchCategories,
  selectCategory,
  selectLoading as selectCategoryLoading,
} from "@/lib/redux/categorySlice";
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
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import type { AppDispatch } from "@/lib/store";
import { Loader, Loader2, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import type { Category } from "@/lib/redux/categorySlice";

type ImageObject = {
  url: string;
  public_id: string;
  _id: string;
};

type ProductType = {
  _id?: string;
  name: string;
  price?: number;
  image: ImageObject[];
  categoryId: string;
  description: string;
  company: string;
  productCode: string;
};

type ProductForm = {
  name: string;
  price: string;
  image: (File | ImageObject)[];
  categoryId: string;
  description: string;
  company: string;
  productCode: string;
};

const emptyForm: ProductForm = { 
  name: "", 
  price: "", 
  image: [],
  categoryId: "", 
  description: "", 
  company: "", 
  productCode: "" 
};

const ProductsPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const products = useSelector(selectProducts) as unknown as ProductType[];
  const categories = useSelector(selectCategory);
  const loading = useSelector(selectProductLoading);
  const error = useSelector(selectProductError);
  const categoryLoading = useSelector(selectCategoryLoading);

  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages = [...form.image];  // Changed from images to image
      const newPreviews = [...imagePreviews];

      for (let i = 0; i < files.length; i++) {
        if (newImages.length < 5) {
          newImages.push(files[i]);
          newPreviews.push(URL.createObjectURL(files[i]));
        }
      }

      setForm({ ...form, image: newImages });  // Changed from images to image
      setImagePreviews(newPreviews);
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...form.image];  // Changed from images to image
    const newPreviews = [...imagePreviews];
    
    newImages.splice(index, 1);
    newPreviews.splice(index, 1);
    
    setForm({ ...form, image: newImages });  // Changed from images to image
    setImagePreviews(newPreviews);
  };

  const handleAdd = async () => {
    setActionLoadingId("add");
    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("price", form.price);
    formData.append("categoryId", form.categoryId);
    formData.append("description", form.description);
    formData.append("company", form.company);
    formData.append("productCode", form.productCode);
    
    // Append multiple images
    form.image.forEach((image) => {
      if (image instanceof File) {
        formData.append('image', image);
      }
    });

    await dispatch(addProduct(formData));
    setForm(emptyForm);
    setImagePreviews([]);
    setDialogOpen(false);
    setActionLoadingId(null);
    dispatch(fetchProducts());
  };

  const handleEdit = (prod: ProductType) => {
    setEditId(prod._id ?? null);
    setForm({
      name: prod.name,
      price: prod.price != null ? prod.price.toString() : "",
      image: prod.image || [],
      categoryId: prod.categoryId,
      description: prod.description,
      company: prod.company,
      productCode: prod.productCode,
    });
    // Store original images for comparison
    setImagePreviews((prod.image || []).map(img => img.url));
    setDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (editId) {
      setActionLoadingId(editId);
      const formData = new FormData();
      
      // Append text fields
      formData.append("name", form.name);
      formData.append("price", form.price);
      formData.append("categoryId", form.categoryId);
      formData.append("description", form.description);
      formData.append("company", form.company);
      formData.append("productCode", form.productCode);
      
      // Get existing images and their public_ids
      const existingImages = form.image.filter(img => !(img instanceof File)) as ImageObject[];
      const retainedImageIds = existingImages.map(img => img.public_id);
      formData.append("retainedImageIds", JSON.stringify(retainedImageIds));

      // Append new images
      const newImages = form.image.filter(img => img instanceof File) as File[];
      newImages.forEach(image => {
        formData.append('image', image);
      });

      await dispatch(updateProduct(editId, formData));
      setEditId(null);
      setForm(emptyForm);
      setImagePreviews([]);
      setDialogOpen(false);
      setActionLoadingId(null);
      dispatch(fetchProducts());
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      setActionLoadingId(id);
      await dispatch(deleteProduct(id));
      setActionLoadingId(null);
      dispatch(fetchProducts());
    }
  };

  return (
    <div className="w-full mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setForm(emptyForm);
            setImagePreviews([]);
            setEditId(null);
          }
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditId(null); setForm(emptyForm); setImagePreviews([]); }}>Add Product</Button>
          </DialogTrigger>
          <DialogContent className="overflow-y-auto max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>{editId ? "Edit Product" : "Add Product"}</DialogTitle>
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
                <Label htmlFor="productCode" className="mb-2">Product Code</Label>
                <Input
                  id="productCode"
                  name="productCode"
                  placeholder="Product Code"
                  value={form.productCode}
                  onChange={handleInput}
                  required
                />
              </div>
              <div>
                <Label htmlFor="company" className="mb-2">Company</Label>
                <Input
                  id="company"
                  name="company"
                  placeholder="Company"
                  value={form.company}
                  onChange={handleInput}
                  required
                />
              </div>
              <div>
                <Label htmlFor="categoryId" className="mb-2">Category</Label>
                <Select
                  value={form.categoryId}
                  onValueChange={val => setForm({ ...form, categoryId: val })}
                  required
                >
                  <SelectTrigger id="categoryId" className="w-full">
                    <SelectValue placeholder={categoryLoading ? "Loading..." : "Select Category"} />
                  </SelectTrigger>
                  <SelectContent>
                    {categories && categories.length > 0 && categories.map((cat: Category) => (
                      <SelectItem key={cat._id} value={cat._id!}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="description" className="mb-2">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Description"
                  value={form.description}
                  onChange={handleInput}
                  className="h-20"
                />
              </div>
              <div>
                <Label htmlFor="image" className="mb-2">Images (Max 5)</Label>
                <input
                  id="image"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  disabled={form.image.length >= 5}  // Changed from images to image
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/80"
                />
                <div className="text-sm text-gray-500 mt-1">
                  {form.image.length}/5 images uploaded  {/* Changed from images to image */}
                </div>
              </div>
              {imagePreviews.length > 0 && (
                <div className="mt-4">
                  <div className="flex flex-wrap gap-3">
                    {imagePreviews.map((preview, index) => (
                      <div 
                        key={index} 
                        className="relative flex-shrink-0"
                      >
                        <Image 
                          src={preview} 
                          alt={`Preview ${index + 1}`} 
                          width={100} 
                          height={100} 
                          className="h-24 w-24 object-cover rounded border-2 border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors shadow-md"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button type="submit" disabled={!!(loading || actionLoadingId === "add" || (editId && actionLoadingId === editId))}>
                  {(loading || actionLoadingId === "add" || (editId && actionLoadingId === editId)) ? (
                    <Loader className="animate-spin mr-2" size={18} />
                  ) : null}
                  {editId ? "Update" : "Add"}
                </Button>
                <DialogClose asChild>
                  <Button type="button" variant="outline" onClick={() => { setEditId(null); setForm(emptyForm); setImagePreviews([]); }}>Cancel</Button>
                </DialogClose>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <div className="bg-white rounded shadow p-4 overflow-x-auto">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="animate-spin h-8 w-8 text-purple-500" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-fixed">
              <colgroup>
                <col className="w-[200px]" />
                <col className="w-[100px]" />
                <col className="w-[100px]" />
                <col className="w-[150px]" />
                <col className="w-[200px]" />
                <col className="w-[180px]" />
              </colgroup>
              <thead>
                <tr className="border-b">
                  <th className="py-3 px-4 text-left">Name</th>
                  <th className="py-3 px-4 text-left">Code</th>
                  <th className="py-3 px-4 text-left">Company</th>
                  <th className="py-3 px-4 text-left">Category</th>
                  <th className="py-3 px-4 text-left">Images</th>
                  <th className="py-3 px-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products && products.length > 0 ? (
                  products.map((prod: ProductType) => (
                    <tr key={prod._id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{prod.name}</td>
                      <td className="py-3 px-4">{prod.productCode}</td>
                      <td className="py-3 px-4">{prod.company}</td>
                      <td className="py-3 px-4">{categories.find((c: Category) => c._id === prod.categoryId)?.name || "-"}</td>
                      <td className="py-3 px-4">
                        {prod.image && prod.image.length > 0 ? (
                          <div className="flex gap-2 flex-wrap">
                            {prod.image.map((img: ImageObject, index: number) => (
                              <Image 
                                key={img._id} 
                                src={img.url} 
                                alt={`${prod.name} ${index + 1}`} 
                                className="h-16 w-16 object-cover rounded" 
                                width={64} 
                                height={64}
                              />
                            ))}
                          </div>
                        ) : "-"}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(prod)} disabled={actionLoadingId === prod._id}>
                            {actionLoadingId === prod._id && editId === prod._id ? (
                              <Loader className="animate-spin mr-2" size={16} />
                            ) : null}
                            Edit
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(prod._id!)} disabled={actionLoadingId === prod._id}>
                            {actionLoadingId === prod._id ? (
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
                    <td colSpan={6} className="text-center py-4 text-muted-foreground">
                      No products found.
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

export default ProductsPage;