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
import type { Product } from "@/lib/redux/productSlice";

// Static categories matching Product interface
const CATEGORIES = ["Milk", "Butter", "Cheese", "Yogurt", "Ghee"] as const;
type CategoryType = typeof CATEGORIES[number];

type ProductForm = {
  name: string;
  category: CategoryType | "";
  price: string[]; // Array of price strings
  dailyPrice: string[];
  alternatePrice: string[];
  weeklyPrice: string[];
  description: string[];
  stock: string;
  quantity: string[]; // Array of quantity strings
  imageUrl: (File | string)[]; // Array of images (up to 5)
};

const emptyForm: ProductForm = { 
  name: "", 
  category: "",
  price: [""],
  dailyPrice: [""],
  alternatePrice: [""],
  weeklyPrice: [""],
  description: [""],
  stock: "",
  quantity: [""],
  imageUrl: []
};

const ProductsPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const products = useSelector(selectProducts);
  const loading = useSelector(selectProductLoading);
  const error = useSelector(selectProductError);

  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleArrayInput = (field: 'price' | 'dailyPrice' | 'alternatePrice' | 'weeklyPrice' | 'description' | 'quantity', index: number, value: string) => {
    const newArray = [...form[field]];
    newArray[index] = value;
    setForm({ ...form, [field]: newArray });
  };

  const addArrayItem = (field: 'price' | 'dailyPrice' | 'alternatePrice' | 'weeklyPrice' | 'description' | 'quantity') => {
    setForm({ ...form, [field]: [...form[field], ""] });
  };

  const removeArrayItem = (field: 'price' | 'dailyPrice' | 'alternatePrice' | 'weeklyPrice' | 'description' | 'quantity', index: number) => {
    const newArray = form[field].filter((_, i) => i !== index);
    setForm({ ...form, [field]: newArray.length > 0 ? newArray : [""] });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles: File[] = Array.from(files);
      const currentImages = form.imageUrl.length;
      const remainingSlots = 5 - currentImages;
      
      if (remainingSlots > 0) {
        const filesToAdd = newFiles.slice(0, remainingSlots);
        const newImageUrls = [...form.imageUrl, ...filesToAdd];
        const newPreviews = [
          ...imagePreviews,
          ...filesToAdd.map(file => URL.createObjectURL(file))
        ];
        
        setForm({ ...form, imageUrl: newImageUrls });
        setImagePreviews(newPreviews);
      }
    }
  };

  const removeImage = (index: number) => {
    const newImageUrls = form.imageUrl.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    
    // Revoke object URL if it was a File
    if (form.imageUrl[index] instanceof File && imagePreviews[index]) {
      URL.revokeObjectURL(imagePreviews[index]);
    }
    
    setForm({ ...form, imageUrl: newImageUrls });
    setImagePreviews(newPreviews);
  };

  const handleAdd = async () => {
    setActionLoadingId("add");
    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("category", form.category);
    
    // Append arrays
    form.price.forEach(p => formData.append("price", p || "0"));
    form.dailyPrice.forEach(p => formData.append("dailyPrice", p || "0"));
    form.alternatePrice.forEach(p => formData.append("alternatePrice", p || "0"));
    form.weeklyPrice.forEach(p => formData.append("weeklyPrice", p || "0"));
    form.description.forEach(d => formData.append("description", d || ""));
    form.quantity.forEach(q => formData.append("quantity", q || ""));
    
    formData.append("stock", form.stock || "0");
    
    // Append multiple images
    form.imageUrl.forEach((img) => {
      if (img instanceof File) {
        formData.append("imageUrl", img);
      } else if (typeof img === "string") {
        formData.append("imageUrl", img);
      }
    });

    await dispatch(addProduct(formData));
    // Revoke all object URLs
    imagePreviews.forEach(preview => URL.revokeObjectURL(preview));
    setForm(emptyForm);
    setImagePreviews([]);
    setDialogOpen(false);
    setActionLoadingId(null);
    dispatch(fetchProducts());
  };

  const handleEdit = (prod: Product) => {
    setEditId(prod._id ?? null);
    
    // Handle imageUrl - can be string, array of strings, or null
    let imageUrls: (File | string)[] = [];
    let previews: string[] = [];
    
    if (prod.imageUrl) {
      if (typeof prod.imageUrl === "string") {
        imageUrls = [prod.imageUrl];
        previews = [prod.imageUrl];
      } else if (Array.isArray(prod.imageUrl)) {
        imageUrls = prod.imageUrl as string[];
        previews = prod.imageUrl as string[];
      }
    }
    
    setForm({
      name: prod.name,
      category: prod.category || "",
      price: prod.price && prod.price.length > 0 ? prod.price.map(p => p.toString()) : [""],
      dailyPrice: prod.dailyPrice && prod.dailyPrice.length > 0 ? prod.dailyPrice.map(p => p.toString()) : [""],
      alternatePrice: prod.alternatePrice && prod.alternatePrice.length > 0 ? prod.alternatePrice.map(p => p.toString()) : [""],
      weeklyPrice: prod.weeklyPrice && prod.weeklyPrice.length > 0 ? prod.weeklyPrice.map(p => p.toString()) : [""],
      description: prod.description && prod.description.length > 0 ? prod.description : [""],
      stock: prod.stock?.toString() || "",
      quantity: prod.quantity && prod.quantity.length > 0 ? prod.quantity : [""],
      imageUrl: imageUrls,
    });
    setImagePreviews(previews);
    setDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (editId) {
      setActionLoadingId(editId);
      const formData = new FormData();
      
      formData.append("name", form.name);
      formData.append("category", form.category);
      
      // Append arrays
      form.price.forEach(p => formData.append("price", p || "0"));
      form.dailyPrice.forEach(p => formData.append("dailyPrice", p || "0"));
      form.alternatePrice.forEach(p => formData.append("alternatePrice", p || "0"));
      form.weeklyPrice.forEach(p => formData.append("weeklyPrice", p || "0"));
      form.description.forEach(d => formData.append("description", d || ""));
      form.quantity.forEach(q => formData.append("quantity", q || ""));
      
      formData.append("stock", form.stock || "0");
      
      // Append multiple images
      form.imageUrl.forEach((img) => {
        if (img instanceof File) {
          formData.append("imageUrl", img);
        } else if (typeof img === "string") {
          formData.append("imageUrl", img);
        }
      });

      await dispatch(updateProduct(editId, formData));
      // Revoke all object URLs
      imagePreviews.forEach(preview => {
        try {
          if (preview.startsWith("blob:")) {
            URL.revokeObjectURL(preview);
          }
        } catch {
          // Ignore errors
        }
      });
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
            // Revoke all object URLs
            imagePreviews.forEach(preview => {
              try {
                if (preview.startsWith("blob:")) {
                  URL.revokeObjectURL(preview);
                }
              } catch (e) {
                console.error(e);
                // Ignore errors
              }
            });
            setForm(emptyForm);
            setImagePreviews([]);
            setEditId(null);
          }
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditId(null); setForm(emptyForm); setImagePreviews([]); }}>Add Product</Button>
          </DialogTrigger>
          <DialogContent className="overflow-y-auto max-h-[90vh] w-[95vw] max-w-4xl">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="mb-2">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Product Name"
                    value={form.name}
                    onChange={handleInput}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="category" className="mb-2">Category</Label>
                  <Select
                    value={form.category}
                    onValueChange={val => setForm({ ...form, category: val as CategoryType })}
                    required
                  >
                    <SelectTrigger id="category" className="w-full">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label className="mb-2">Price</Label>
                {form.price.map((price, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <Input
                      type="number"
                      placeholder="Price"
                      value={price}
                      onChange={(e) => handleArrayInput('price', index, e.target.value)}
                    />
                    {form.price.length > 1 && (
                      <Button type="button" variant="destructive" size="sm" onClick={() => removeArrayItem('price', index)}>
                        <X size={14} />
                      </Button>
                    )}
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => addArrayItem('price')}>
                  + Add Price
                </Button>
              </div>

              <div>
                <Label className="mb-2">Daily Price (Optional)</Label>
                {form.dailyPrice.map((price, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <Input
                      type="number"
                      placeholder="Daily Price"
                      value={price}
                      onChange={(e) => handleArrayInput('dailyPrice', index, e.target.value)}
                    />
                    {form.dailyPrice.length > 1 && (
                      <Button type="button" variant="destructive" size="sm" onClick={() => removeArrayItem('dailyPrice', index)}>
                        <X size={14} />
                      </Button>
                    )}
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => addArrayItem('dailyPrice')}>
                  + Add Daily Price
                </Button>
              </div>

              <div>
                <Label className="mb-2">Alternate Price (Optional)</Label>
                {form.alternatePrice.map((price, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <Input
                      type="number"
                      placeholder="Alternate Price"
                      value={price}
                      onChange={(e) => handleArrayInput('alternatePrice', index, e.target.value)}
                    />
                    {form.alternatePrice.length > 1 && (
                      <Button type="button" variant="destructive" size="sm" onClick={() => removeArrayItem('alternatePrice', index)}>
                        <X size={14} />
                      </Button>
                    )}
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => addArrayItem('alternatePrice')}>
                  + Add Alternate Price
                </Button>
              </div>

              <div>
                <Label className="mb-2">Weekly Price (Optional)</Label>
                {form.weeklyPrice.map((price, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <Input
                      type="number"
                      placeholder="Weekly Price"
                      value={price}
                      onChange={(e) => handleArrayInput('weeklyPrice', index, e.target.value)}
                    />
                    {form.weeklyPrice.length > 1 && (
                      <Button type="button" variant="destructive" size="sm" onClick={() => removeArrayItem('weeklyPrice', index)}>
                        <X size={14} />
                      </Button>
                    )}
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => addArrayItem('weeklyPrice')}>
                  + Add Weekly Price
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="stock" className="mb-2">Stock</Label>
                  <Input
                    id="stock"
                    name="stock"
                    type="number"
                    placeholder="Stock Quantity"
                    value={form.stock}
                    onChange={handleInput}
                  />
                </div>
              </div>

              <div>
                <Label className="mb-2">Quantity</Label>
                {form.quantity.map((qty, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <Input
                      placeholder="Quantity"
                      value={qty}
                      onChange={(e) => handleArrayInput('quantity', index, e.target.value)}
                    />
                    {form.quantity.length > 1 && (
                      <Button type="button" variant="destructive" size="sm" onClick={() => removeArrayItem('quantity', index)}>
                        <X size={14} />
                      </Button>
                    )}
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => addArrayItem('quantity')}>
                  + Add Quantity
                </Button>
              </div>

              <div>
                <Label className="mb-2">Description</Label>
                {form.description.map((desc, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <Textarea
                      placeholder="Description"
                      value={desc}
                      onChange={(e) => handleArrayInput('description', index, e.target.value)}
                      className="h-20"
                    />
                    {form.description.length > 1 && (
                      <Button type="button" variant="destructive" size="sm" onClick={() => removeArrayItem('description', index)}>
                        <X size={14} />
                      </Button>
                    )}
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => addArrayItem('description')}>
                  + Add Description
                </Button>
              </div>

              <div>
                <Label htmlFor="imageUrl" className="mb-2">Images (Max 5)</Label>
                <input
                  id="imageUrl"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  disabled={form.imageUrl.length >= 5}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/80 disabled:opacity-50"
                />
                {form.imageUrl.length >= 5 && (
                  <p className="text-sm text-gray-500 mt-1">Maximum 5 images allowed</p>
                )}
                {form.imageUrl.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {form.imageUrl.map((img, index) => (
                      <div key={index} className="relative inline-block">
                        <Image 
                          src={imagePreviews[index] || (typeof img === "string" ? img : "")} 
                          alt={`Preview ${index + 1}`} 
                          width={150} 
                          height={150} 
                          className="h-32 w-full object-cover rounded border-2 border-gray-200"
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
                )}
              </div>
              <DialogFooter>
                <Button type="submit" disabled={!!(loading || actionLoadingId === "add" || (editId && actionLoadingId === editId))}>
                  {(loading || actionLoadingId === "add" || (editId && actionLoadingId === editId)) ? (
                    <Loader className="animate-spin mr-2" size={18} />
                  ) : null}
                  {editId ? "Update" : "Add"}
                </Button>
                <DialogClose asChild>
                  <Button type="button" variant="outline" onClick={() => { 
                    imagePreviews.forEach(preview => {
                      try {
                        if (preview.startsWith("blob:")) {
                          URL.revokeObjectURL(preview);
                        }
                      } catch {
                        // Ignore errors
                      }
                    });
                    setEditId(null); 
                    setForm(emptyForm); 
                    setImagePreviews([]); 
                  }}>Cancel</Button>
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
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="py-3 px-4 text-left">Name</th>
                  <th className="py-3 px-4 text-left">Category</th>
                  <th className="py-3 px-4 text-left">Price</th>
                  <th className="py-3 px-4 text-left">Stock</th>
                  <th className="py-3 px-4 text-left">Quantity</th>
                  <th className="py-3 px-4 text-left">Image</th>
                  <th className="py-3 px-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products && products.length > 0 ? (
                  products.map((prod: Product) => (
                    <tr key={prod._id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{prod.name}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                          {prod.category}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {prod.price && prod.price.length > 0 ? (
                          <div className="text-sm">
                            ₹{prod.price.join(", ₹")}
                          </div>
                        ) : "-"}
                      </td>
                      <td className="py-3 px-4">{prod.stock ?? "-"}</td>
                      <td className="py-3 px-4">
                        {prod.quantity && prod.quantity.length > 0 ? (
                          <div className="text-sm">{prod.quantity.join(", ")}</div>
                        ) : "-"}
                      </td>
                      <td className="py-3 px-4">
                        {prod.imageUrl ? (
                          <Image 
                            src={prod.imageUrl} 
                            alt={prod.name} 
                            className="h-16 w-16 object-cover rounded" 
                            width={64} 
                            height={64}
                          />
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
                    <td colSpan={7} className="text-center py-4 text-muted-foreground">
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