"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchHomes,
  addHome,
  updateHome,
  deleteHome,
  addBanner,
  updateBanner,
  deleteBanner,
  addSection,
  updateSection,
  deleteSection,
  selectHomes,
  selectBanners,
  selectSections,
  selectLoading,
  selectError,
} from "@/lib/redux/homeSlice";
import { fetchProducts, selectProducts } from "@/lib/redux/productSlice";
import type { Product } from "@/lib/redux/productSlice";
import { Checkbox } from "@/components/ui/checkbox";
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

// Type for product objects in featured sections
type ProductObject = {
  _id: string;
  name: string;
  category?: string;
  price?: number[];
  imageUrl?: string;
  [key: string]: unknown;
};

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
  const banners = useSelector(selectBanners);
  const sections = useSelector(selectSections);
  const products = useSelector(selectProducts);
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);

  const [form, setForm] = useState<HomeForm>(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  
  // Banner management state
  const [bannerDialogOpen, setBannerDialogOpen] = useState(false);
  const [bannerForm, setBannerForm] = useState<{
    imageFile?: File;
    imageUrl?: string;
    title: string;
    description: string;
  }>({ title: "", description: "" });
  const [editBannerId, setEditBannerId] = useState<string | null>(null);
  
  // Section management state
  const [sectionDialogOpen, setSectionDialogOpen] = useState(false);
  const [sectionForm, setSectionForm] = useState<{
    title: string;
    products: string; // Comma-separated string like "1,2,3"
  }>({ title: "", products: "" });
  const [editSectionId, setEditSectionId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchHomes());
    dispatch(fetchProducts());
  }, [dispatch]);

  const handleBannerChange = (index: number, field: 'title' | 'description', value: string) => {
    const updatedBanners = [...form.banners];
    updatedBanners[index] = { ...updatedBanners[index], [field]: value };
    setForm({ ...form, banners: updatedBanners });
  };

  const handleBannerImageChangeInForm = (index: number, file: File) => {
    const updatedBanners = [...form.banners];
    updatedBanners[index] = { ...updatedBanners[index], imageFile: file, imageUrl: URL.createObjectURL(file) };
    setForm({ ...form, banners: updatedBanners });
  };

  const addBannerToForm = () => {
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
    
    // Add banners - structure matches bannerSchema: { imageUrl, title, description }
    form.banners.forEach((banner, index) => {
      if (banner.imageFile) {
        // If new file, send as 'imageUrl' (backend will upload and return imageUrl)
        formData.append(`banners[${index}][imageUrl]`, banner.imageFile);
      } else if (banner.imageUrl) {
        // If existing URL, send directly
        formData.append(`banners[${index}][imageUrl]`, banner.imageUrl);
      }
      formData.append(`banners[${index}][title]`, banner.title || "");
      formData.append(`banners[${index}][description]`, banner.description || "");
    });
    
    // Add featured sections - structure matches featuredCategorySchema: { title, products[] }
    form.featuredSections.forEach((section, index) => {
      formData.append(`featuredSections[${index}][title]`, section.title || "");
      // Send products as array - backend will convert to ObjectIds
      section.products.forEach((productId, pIndex) => {
        formData.append(`featuredSections[${index}][products][${pIndex}]`, productId);
      });
    });
    
    await dispatch(addHome(formData));
    
    // Clean up blob URLs from imageFile previews
    form.banners.forEach((banner) => {
      if (banner.imageUrl && banner.imageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(banner.imageUrl);
      }
    });
    
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
        ? home.featuredSections.map((section: FeaturedCategory) => {
            // Extract product IDs from product objects if they are objects
            let productIds: string[] = [];
            if (Array.isArray(section.products)) {
              productIds = section.products.map((p) => {
                if (typeof p === 'object' && p !== null && '_id' in p && typeof p._id === 'string') {
                  return p._id;
                }
                return String(p);
              });
            }
            return {
              title: section.title || "",
              products: productIds,
            };
          })
        : [],
    });
    setDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (editId) {
      setActionLoadingId(editId);
      const formData = new FormData();
      
      // Add ID for update
      formData.append("_id", editId);
      
      // Add banners - structure matches bannerSchema: { imageUrl, title, description }
      form.banners.forEach((banner, index) => {
        if (banner.imageFile) {
          // If new file, send as 'imageUrl' (backend will upload and return imageUrl)
          formData.append(`banners[${index}][imageUrl]`, banner.imageFile);
        } else if (banner.imageUrl) {
          // If existing URL, send directly (backend will use this imageUrl)
          formData.append(`banners[${index}][imageUrl]`, banner.imageUrl);
        }
        formData.append(`banners[${index}][title]`, banner.title || "");
        formData.append(`banners[${index}][description]`, banner.description || "");
      });
      
      // Add featured sections - structure matches featuredCategorySchema: { title, products[] }
      form.featuredSections.forEach((section, index) => {
        formData.append(`featuredSections[${index}][title]`, section.title || "");
        // Send products as array - backend will convert to ObjectIds
        section.products.forEach((productId, pIndex) => {
          formData.append(`featuredSections[${index}][products][${pIndex}]`, productId);
        });
      });
      
      await dispatch(updateHome(formData));
      
      // Clean up blob URLs from imageFile previews
      form.banners.forEach((banner) => {
        if (banner.imageUrl && banner.imageUrl.startsWith('blob:')) {
          URL.revokeObjectURL(banner.imageUrl);
        }
      });
      
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

  // Banner management handlers
  const handleBannerImageChange = (file: File) => {
    setBannerForm({
      ...bannerForm,
      imageFile: file,
      imageUrl: URL.createObjectURL(file),
    });
  };

  const handleBannerFieldChange = (field: 'title' | 'description', value: string) => {
    setBannerForm({ ...bannerForm, [field]: value });
  };

  const resetBannerForm = () => {
    if (bannerForm.imageUrl && bannerForm.imageUrl.startsWith('blob:')) {
      URL.revokeObjectURL(bannerForm.imageUrl);
    }
    setBannerForm({ title: "", description: "" });
    setEditBannerId(null);
  };

  const handleAddBanner = async () => {
    setActionLoadingId("addBanner");
    const formData = new FormData();
    
    if (bannerForm.imageFile) {
      formData.append("imageUrl", bannerForm.imageFile);
    } else if (bannerForm.imageUrl && !bannerForm.imageUrl.startsWith('blob:')) {
      formData.append("imageUrl", bannerForm.imageUrl);
    }
    formData.append("title", bannerForm.title || "");
    formData.append("description", bannerForm.description || "");
    
    const result = await dispatch(addBanner(formData));
    if (result) {
      resetBannerForm();
      setBannerDialogOpen(false);
    }
    setActionLoadingId(null);
  };

  const handleEditBanner = (banner: Banner) => {
    setEditBannerId(banner._id || null);
    setBannerForm({
      imageUrl: banner.imageUrl || "",
      title: banner.title || "",
      description: banner.description || "",
    });
    setBannerDialogOpen(true);
  };

  const handleUpdateBanner = async () => {
    if (!editBannerId) return;
    
    setActionLoadingId(editBannerId);
    const formData = new FormData();
    
    if (bannerForm.imageFile) {
      formData.append("imageUrl", bannerForm.imageFile);
    } else if (bannerForm.imageUrl && !bannerForm.imageUrl.startsWith('blob:')) {
      formData.append("imageUrl", bannerForm.imageUrl);
    }
    formData.append("title", bannerForm.title || "");
    formData.append("description", bannerForm.description || "");
    
    const result = await dispatch(updateBanner(editBannerId, formData));
    if (result) {
      resetBannerForm();
      setBannerDialogOpen(false);
    }
    setActionLoadingId(null);
  };

  const handleDeleteBanner = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this banner?")) {
      setActionLoadingId(id);
      await dispatch(deleteBanner(id));
      setActionLoadingId(null);
    }
  };

  // Section management handlers
  const handleSectionFieldChange = (field: 'title', value: string) => {
    setSectionForm({ ...sectionForm, [field]: value });
  };

  const handleProductToggle = (productId: string) => {
    const currentIds = sectionForm.products
      ? sectionForm.products.split(',').map(p => p.trim()).filter(p => p)
      : [];
    
    const isSelected = currentIds.includes(productId);
    let newIds: string[];
    
    if (isSelected) {
      newIds = currentIds.filter(id => id !== productId);
    } else {
      newIds = [...currentIds, productId];
    }
    
    setSectionForm({ ...sectionForm, products: newIds.join(',') });
  };

  const resetSectionForm = () => {
    setSectionForm({ title: "", products: "" });
    setEditSectionId(null);
  };

  const handleAddSection = async () => {
    setActionLoadingId("addSection");
    
    // Convert comma-separated string to array
    const productIds = sectionForm.products
      ? sectionForm.products.split(',').map(p => p.trim()).filter(p => p)
      : [];
    
    // Send as JSON object
    const payload = {
      title: sectionForm.title || "",
      products: productIds,
    };
    
    const result = await dispatch(addSection(payload));
    if (result) {
      resetSectionForm();
      setSectionDialogOpen(false);
    }
    setActionLoadingId(null);
  };

  const handleEditSection = (section: FeaturedCategory) => {
    setEditSectionId(section._id || null);
    // Extract product IDs from product objects if they are objects
    let productIds: string[] = [];
    if (Array.isArray(section.products)) {
      productIds = section.products.map((p) => {
        if (typeof p === 'object' && p !== null && '_id' in p && typeof p._id === 'string') {
          return p._id;
        }
        return String(p);
      });
    }
    // Convert products array to comma-separated string
    const productsStr = productIds.join(',');
    setSectionForm({
      title: section.title || "",
      products: productsStr,
    });
    setSectionDialogOpen(true);
  };

  const handleUpdateSection = async () => {
    if (!editSectionId) return;
    
    setActionLoadingId(editSectionId);
    
    // Convert comma-separated string to array
    const productIds = sectionForm.products
      ? sectionForm.products.split(',').map(p => p.trim()).filter(p => p)
      : [];
    
    // Send as JSON object
    const payload = {
      title: sectionForm.title || "",
      products: productIds,
    };
    
    const result = await dispatch(updateSection(editSectionId, payload));
    if (result) {
      resetSectionForm();
      setSectionDialogOpen(false);
    }
    setActionLoadingId(null);
  };

  const handleDeleteSection = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this section?")) {
      setActionLoadingId(id);
      await dispatch(deleteSection(id));
      setActionLoadingId(null);
    }
  };

  return (
    <div className="w-full mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Home Entries</h1>
        <div className="flex gap-2">
          {/* Banner Management Dialog */}
          <Dialog open={bannerDialogOpen} onOpenChange={(open) => {
            setBannerDialogOpen(open);
            if (!open) {
              resetBannerForm();
            }
          }}>
            <DialogTrigger asChild>
              <Button variant="outline" onClick={() => { resetBannerForm(); }}>
                Manage Banners
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editBannerId ? "Edit Banner" : "Add Banner"}</DialogTitle>
              </DialogHeader>
              <form
                onSubmit={e => {
                  e.preventDefault();
                  editBannerId ? handleUpdateBanner() : handleAddBanner();
                }}
                className="space-y-4"
              >
                <div>
                  <Label htmlFor="banner-image">Image</Label>
                  <input
                    id="banner-image"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleBannerImageChange(file);
                    }}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/80 mt-2"
                  />
                  {bannerForm.imageUrl && (
                    <div className="mt-2">
                      <Image 
                        src={bannerForm.imageUrl} 
                        alt="Banner Preview" 
                        className="h-32 w-64 object-cover rounded" 
                        width={256} 
                        height={128} 
                      />
                    </div>
                  )}
                </div>
                <div>
                  <Label htmlFor="banner-title">Title</Label>
                  <Input
                    id="banner-title"
                    placeholder="Banner Title"
                    value={bannerForm.title}
                    onChange={(e) => handleBannerFieldChange('title', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="banner-desc">Description</Label>
                  <Input
                    id="banner-desc"
                    placeholder="Banner Description"
                    value={bannerForm.description}
                    onChange={(e) => handleBannerFieldChange('description', e.target.value)}
                    required
                  />
                </div>
                <DialogFooter>
                  <Button 
                    type="submit" 
                    disabled={!!(loading || actionLoadingId === "addBanner" || (editBannerId && actionLoadingId === editBannerId))}
                  >
                    {(loading || actionLoadingId === "addBanner" || (editBannerId && actionLoadingId === editBannerId)) && (
                      <Loader className="animate-spin mr-2" size={18} />
                    )}
                    {editBannerId ? "Update" : "Add"}
                  </Button>
                  <DialogClose asChild>
                    <Button type="button" variant="outline" onClick={() => { resetBannerForm(); }}>Cancel</Button>
                  </DialogClose>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          
          {/* Section Management Dialog */}
          <Dialog open={sectionDialogOpen} onOpenChange={(open) => {
            setSectionDialogOpen(open);
            if (!open) {
              resetSectionForm();
            }
          }}>
            <DialogTrigger asChild>
              <Button variant="outline" onClick={() => { resetSectionForm(); }}>
                Manage Sections
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editSectionId ? "Edit Section" : "Add Section"}</DialogTitle>
              </DialogHeader>
              <form
                onSubmit={e => {
                  e.preventDefault();
                  editSectionId ? handleUpdateSection() : handleAddSection();
                }}
                className="space-y-4"
              >
                <div>
                  <Label htmlFor="section-title">Title</Label>
                  <Input
                    id="section-title"
                    placeholder="Section Title"
                    value={sectionForm.title}
                    onChange={(e) => handleSectionFieldChange('title', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label className="mb-3 block">Select Products</Label>
                  <div className="max-h-60 overflow-y-auto border rounded-md p-3 space-y-2">
                    {products && products.length > 0 ? (
                      products.map((product: Product) => {
                        const selectedIds = sectionForm.products
                          ? sectionForm.products.split(',').map(p => p.trim()).filter(p => p)
                          : [];
                        const isChecked = selectedIds.includes(product._id || '');
                        return (
                          <div key={product._id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`product-${product._id}`}
                              checked={isChecked}
                              onCheckedChange={() => handleProductToggle(product._id || '')}
                            />
                            <Label
                              htmlFor={`product-${product._id}`}
                              className="text-sm font-normal cursor-pointer flex-1"
                            >
                              {product.name}
                            </Label>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-sm text-muted-foreground">No products available</p>
                    )}
                  </div>
                  {sectionForm.products && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Selected IDs: {sectionForm.products}
                    </p>
                  )}
                </div>
                <DialogFooter>
                  <Button 
                    type="submit" 
                    disabled={!!(loading || actionLoadingId === "addSection" || (editSectionId && actionLoadingId === editSectionId))}
                  >
                    {(loading || actionLoadingId === "addSection" || (editSectionId && actionLoadingId === editSectionId)) && (
                      <Loader className="animate-spin mr-2" size={18} />
                    )}
                    {editSectionId ? "Update" : "Add"}
                  </Button>
                  <DialogClose asChild>
                    <Button type="button" variant="outline" onClick={() => { resetSectionForm(); }}>Cancel</Button>
                  </DialogClose>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          
          {/* Home Management Dialog */}
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
                  <Button type="button" variant="outline" size="sm" onClick={addBannerToForm}>
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
                          if (file) handleBannerImageChangeInForm(index, file);
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
      </div>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      
      {/* Banners List */}
      <div className="bg-white rounded shadow p-4 mb-6">
        <h2 className="text-xl font-bold mb-4">Banners</h2>
        {banners && banners.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {banners.map((banner: Banner, index: number) => (
              <div key={banner._id || index} className="border rounded-lg p-4 space-y-3">
                {banner.imageUrl && (
                  <Image 
                    src={banner.imageUrl} 
                    alt={banner.title || "Banner"} 
                    className="w-full h-32 object-cover rounded" 
                    width={400} 
                    height={128} 
                  />
                )}
                <div>
                  <p className="font-medium">{banner.title || "Untitled"}</p>
                  <p className="text-sm text-gray-600">{banner.description || "-"}</p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleEditBanner(banner)}
                    disabled={actionLoadingId === banner._id}
                  >
                    {actionLoadingId === banner._id && editBannerId === banner._id ? (
                      <Loader className="animate-spin mr-2" size={16} />
                    ) : null}
                    Edit
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive" 
                    onClick={() => handleDeleteBanner(banner._id!)}
                    disabled={actionLoadingId === banner._id}
                  >
                    {actionLoadingId === banner._id ? (
                      <Loader className="animate-spin mr-2" size={16} />
                    ) : null}
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No banners found.
          </div>
        )}
      </div>
      
      {/* Sections List */}
      <div className="bg-white rounded shadow p-4 mb-6">
        <h2 className="text-xl font-bold mb-4">Sections</h2>
        {sections && sections.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sections.map((section: FeaturedCategory, index: number) => {
              // Check if products are objects or IDs
              const productsArray = Array.isArray(section.products) ? section.products : [];
              const hasProductObjects = productsArray.length > 0 && typeof productsArray[0] === 'object' && productsArray[0] !== null;
              
              return (
                <div key={section._id || index} className="border rounded-lg p-4 space-y-3">
                  <div>
                    <p className="font-medium">{section.title || "Untitled"}</p>
                    <p className="text-sm text-gray-600 mb-2">
                      Products: {productsArray.length}
                    </p>
                    {hasProductObjects && productsArray.length > 0 && (
                      <div className="space-y-2 mt-2">
                        {productsArray.slice(0, 3).map((product, pIdx: number) => {
                          const productObj = product as ProductObject;
                          return (
                            <div key={productObj._id || pIdx} className="flex gap-2 items-center border rounded p-2">
                              {productObj.imageUrl && (
                                <Image
                                  src={productObj.imageUrl}
                                  alt={productObj.name || "Product"}
                                  className="h-12 w-12 object-cover rounded"
                                  width={48}
                                  height={48}
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{productObj.name || "Unknown"}</p>
                                {productObj.category && (
                                  <p className="text-xs text-gray-500">{productObj.category}</p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                        {productsArray.length > 3 && (
                          <p className="text-xs text-gray-500">+ {productsArray.length - 3} more products</p>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleEditSection(section)}
                      disabled={actionLoadingId === section._id}
                    >
                      {actionLoadingId === section._id && editSectionId === section._id ? (
                        <Loader className="animate-spin mr-2" size={16} />
                      ) : null}
                      Edit
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive" 
                      onClick={() => handleDeleteSection(section._id!)}
                      disabled={actionLoadingId === section._id}
                    >
                      {actionLoadingId === section._id ? (
                        <Loader className="animate-spin mr-2" size={16} />
                      ) : null}
                      Delete
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No sections found.
          </div>
        )}
      </div>
      
      {/* Home Entries */}
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
                    <div className="space-y-4">
                      {home.featuredSections.map((section: FeaturedCategory, idx: number) => {
                        const productsArray = Array.isArray(section.products) ? section.products : [];
                        const hasProductObjects = productsArray.length > 0 && typeof productsArray[0] === 'object' && productsArray[0] !== null;
                        
                        return (
                          <div key={idx} className="border rounded p-4 space-y-3">
                            <p className="font-medium text-lg">{section.title || `Section ${idx + 1}`}</p>
                            <p className="text-sm text-gray-600">
                              {productsArray.length} product(s)
                            </p>
                            {hasProductObjects && productsArray.length > 0 ? (
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
                                {productsArray.map((product, pIdx: number) => {
                                  const productObj = product as ProductObject;
                                  return (
                                    <div key={productObj._id || pIdx} className="border rounded-lg p-3 flex gap-3">
                                      {productObj.imageUrl && (
                                        <Image
                                          src={productObj.imageUrl}
                                          alt={productObj.name || "Product"}
                                          className="h-16 w-16 object-cover rounded"
                                          width={64}
                                          height={64}
                                        />
                                      )}
                                      <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm">{productObj.name || "Unknown Product"}</p>
                                        {productObj.category && (
                                          <p className="text-xs text-gray-500">{productObj.category}</p>
                                        )}
                                        {productObj.price && Array.isArray(productObj.price) && productObj.price.length > 0 && (
                                          <p className="text-xs text-gray-600 mt-1">
                                            ₹{Math.min(...productObj.price)} - ₹{Math.max(...productObj.price)}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <p className="text-xs text-gray-500 mt-1">
                                Product IDs: {productsArray.join(', ')}
                              </p>
                            )}
                          </div>
                        );
                      })}
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