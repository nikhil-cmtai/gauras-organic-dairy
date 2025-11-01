"use client";

import React, { useEffect, useState } from "react";
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
import type { Banner, FeaturedCategory, Home } from "@/lib/redux/homeSlice";

// Form type for local state
type HomeForm = {
  banners: Array<{
    imageFile?: File;
    imageUrl?: string;
    title: string;
    description: string;
  }>;
  featuredSections: Array<{
    title: string;
    products: string[];
  }>;
};

const emptyForm: HomeForm = { banners: [], featuredSections: [] };

const HomePage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const homes = useSelector(selectHomes);
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);

  const [form, setForm] = useState<HomeForm>(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchHomes());
  }, [dispatch]);

  const handleBannerChange = (index: number, field: 'title' | 'description', value: string) => {
    const updatedBanners = [...form.banners];
    updatedBanners[index] = { ...updatedBanners[index], [field]: value };
    setForm({ ...form, banners: updatedBanners });
  };

  const handleBannerImageChange = (index: number, file: File) => {
    const updatedBanners = [...form.banners];
    updatedBanners[index] = { ...updatedBanners[index], imageFile: file, imageUrl: URL.createObjectURL(file) };
    setForm({ ...form, banners: updatedBanners });
  };

  const addBanner = () => {
    setForm({ ...form, banners: [...form.banners, { title: "", description: "" }] });
  };

  const removeBanner = (index: number) => {
    const updatedBanners = form.banners.filter((_, i) => i !== index);
    setForm({ ...form, banners: updatedBanners });
  };

  const handleFeaturedSectionChange = (index: number, field: 'title', value: string) => {
    const updatedSections = [...form.featuredSections];
    updatedSections[index] = { ...updatedSections[index], [field]: value };
    setForm({ ...form, featuredSections: updatedSections });
  };

  const handleFeaturedProductsChange = (sectionIndex: number, value: string) => {
    const updatedSections = [...form.featuredSections];
    // Split comma-separated product IDs
    updatedSections[sectionIndex] = { 
      ...updatedSections[sectionIndex], 
      products: value.split(',').map(p => p.trim()).filter(p => p)
    };
    setForm({ ...form, featuredSections: updatedSections });
  };

  const addFeaturedSection = () => {
    setForm({ ...form, featuredSections: [...form.featuredSections, { title: "", products: [] }] });
  };

  const removeFeaturedSection = (index: number) => {
    const updatedSections = form.featuredSections.filter((_, i) => i !== index);
    setForm({ ...form, featuredSections: updatedSections });
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditId(null);
  };

  const handleAdd = async () => {
    setActionLoadingId("add");
    const formData = new FormData();
    
    // Add banners
    form.banners.forEach((banner, index) => {
      if (banner.imageFile) {
        formData.append(`banners[${index}][image]`, banner.imageFile);
      }
      formData.append(`banners[${index}][title]`, banner.title);
      formData.append(`banners[${index}][description]`, banner.description);
    });
    
    // Add featured sections
    form.featuredSections.forEach((section, index) => {
      formData.append(`featuredSections[${index}][title]`, section.title);
      formData.append(`featuredSections[${index}][products]`, JSON.stringify(section.products));
    });
    
    await dispatch(addHome(formData));
    resetForm();
    setDialogOpen(false);
    setActionLoadingId(null);
    dispatch(fetchHomes());
  };

  const handleEdit = (home: Home) => {
    setEditId(home._id ?? null);
    setForm({
      banners: Array.isArray(home.banners) 
        ? home.banners.map((banner: Banner) => ({
            imageUrl: banner.imageUrl || "",
            title: banner.title || "",
            description: banner.description || "",
          }))
        : [],
      featuredSections: Array.isArray(home.featuredSections)
        ? home.featuredSections.map((section: FeaturedCategory) => ({
            title: section.title || "",
            products: Array.isArray(section.products) ? section.products : [],
          }))
        : [],
    });
    setDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (editId) {
      setActionLoadingId(editId);
      const formData = new FormData();
      
      // Add banners
      form.banners.forEach((banner, index) => {
        if (banner.imageFile) {
          formData.append(`banners[${index}][image]`, banner.imageFile);
        }
        if (banner.imageUrl && !banner.imageFile) {
          formData.append(`banners[${index}][imageUrl]`, banner.imageUrl);
        }
        formData.append(`banners[${index}][title]`, banner.title);
        formData.append(`banners[${index}][description]`, banner.description);
      });
      
      // Add featured sections
      form.featuredSections.forEach((section, index) => {
        formData.append(`featuredSections[${index}][title]`, section.title);
        formData.append(`featuredSections[${index}][products]`, JSON.stringify(section.products));
      });
      
      await dispatch(updateHome(editId, formData));
      resetForm();
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
            resetForm();
          }
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); }}>Add Home</Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editId ? "Edit Home" : "Add Home"}</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={e => {
                e.preventDefault();
                editId ? handleUpdate() : handleAdd();
              }}
              className="space-y-6"
            >
              {/* Banners Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-lg font-semibold">Banners</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addBanner}>
                    + Add Banner
                  </Button>
                </div>
                {form.banners.map((banner, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <Label>Banner {index + 1}</Label>
                      <Button type="button" variant="destructive" size="sm" onClick={() => removeBanner(index)}>
                        Remove
                      </Button>
                    </div>
                    <div>
                      <Label htmlFor={`banner-image-${index}`} className="mb-2">Image</Label>
                      <input
                        id={`banner-image-${index}`}
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleBannerImageChange(index, file);
                        }}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/80"
                      />
                      {banner.imageUrl && (
                        <div className="mt-2">
                          <Image 
                            src={banner.imageUrl} 
                            alt={`Banner ${index + 1} Preview`} 
                            className="h-32 w-64 object-cover rounded" 
                            width={256} 
                            height={128} 
                          />
                        </div>
                      )}
                    </div>
                    <div>
                      <Label htmlFor={`banner-title-${index}`} className="mb-2">Title</Label>
                      <Input
                        id={`banner-title-${index}`}
                        placeholder="Banner Title"
                        value={banner.title}
                        onChange={(e) => handleBannerChange(index, 'title', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor={`banner-desc-${index}`} className="mb-2">Description</Label>
                      <Input
                        id={`banner-desc-${index}`}
                        placeholder="Banner Description"
                        value={banner.description}
                        onChange={(e) => handleBannerChange(index, 'description', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Featured Sections */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-lg font-semibold">Featured Sections</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addFeaturedSection}>
                    + Add Section
                  </Button>
                </div>
                {form.featuredSections.map((section, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <Label>Section {index + 1}</Label>
                      <Button type="button" variant="destructive" size="sm" onClick={() => removeFeaturedSection(index)}>
                        Remove
                      </Button>
                    </div>
                    <div>
                      <Label htmlFor={`section-title-${index}`} className="mb-2">Title</Label>
                      <Input
                        id={`section-title-${index}`}
                        placeholder="Section Title"
                        value={section.title}
                        onChange={(e) => handleFeaturedSectionChange(index, 'title', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor={`section-products-${index}`} className="mb-2">Product IDs (comma-separated)</Label>
                      <Input
                        id={`section-products-${index}`}
                        placeholder="product1, product2, product3"
                        value={section.products.join(', ')}
                        onChange={(e) => handleFeaturedProductsChange(index, e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <DialogFooter>
                <Button type="submit" disabled={!!(loading || actionLoadingId === "add" || (editId && actionLoadingId === editId))}>
                  {(loading || actionLoadingId === "add" || (editId && actionLoadingId === editId)) ? (
                    <Loader className="animate-spin mr-2" size={18} />
                  ) : null}
                  {editId ? "Update" : "Add"}
                </Button>
                <DialogClose asChild>
                  <Button type="button" variant="outline" onClick={() => { resetForm(); }}>Cancel</Button>
                </DialogClose>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <div className="bg-white rounded shadow p-4">
        {homes && homes.length > 0 ? (
          <div className="space-y-6">
            {homes.map((home: Home) => (
              <div key={home._id} className="border rounded-lg p-4 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">Home Entry</h3>
                    {home.createdAt && (
                      <p className="text-sm text-gray-500">
                        Created: {new Date(home.createdAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
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
                  </div>
                </div>
                
                {/* Banners Display */}
                <div>
                  <h4 className="font-medium mb-2">Banners ({Array.isArray(home.banners) ? home.banners.length : 0})</h4>
                  {Array.isArray(home.banners) && home.banners.length > 0 ? (
                    <div className="space-y-3">
                      {home.banners.map((banner: Banner, idx: number) => (
                        <div key={idx} className="flex gap-4 border rounded p-3">
                          {banner.imageUrl && (
                            <Image 
                              src={banner.imageUrl} 
                              alt={banner.title || `Banner ${idx + 1}`} 
                              className="h-20 w-32 object-cover rounded" 
                              width={128} 
                              height={80} 
                            />
                          )}
                          <div className="flex-1">
                            <p className="font-medium">{banner.title || `Banner ${idx + 1}`}</p>
                            <p className="text-sm text-gray-600">{banner.description || "-"}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No banners</p>
                  )}
                </div>

                {/* Featured Sections Display */}
                <div>
                  <h4 className="font-medium mb-2">Featured Sections ({Array.isArray(home.featuredSections) ? home.featuredSections.length : 0})</h4>
                  {Array.isArray(home.featuredSections) && home.featuredSections.length > 0 ? (
                    <div className="space-y-2">
                      {home.featuredSections.map((section: FeaturedCategory, idx: number) => (
                        <div key={idx} className="border rounded p-3">
                          <p className="font-medium">{section.title || `Section ${idx + 1}`}</p>
                          <p className="text-sm text-gray-600">
                            Products: {Array.isArray(section.products) ? section.products.length : 0} product(s)
                          </p>
                          {Array.isArray(section.products) && section.products.length > 0 && (
                            <p className="text-xs text-gray-500 mt-1">
                              IDs: {section.products.join(', ')}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No featured sections</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No home entries found.
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;