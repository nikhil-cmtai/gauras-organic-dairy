"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchHomes,
  addHome,
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
import type { Banner, FeaturedCategory } from "@/lib/redux/homeSlice";

// Type for product objects in featured sections
type ProductObject = {
  _id: string;
  name: string;
  category?: string;
  price?: number[];
  imageUrl?: string;
  [key: string]: unknown;
};


const HomePage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const homes = useSelector(selectHomes);
  const banners = useSelector(selectBanners);
  const sections = useSelector(selectSections);
  const products = useSelector(selectProducts);
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);

  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [homeDialogOpen, setHomeDialogOpen] = useState(false);
  const [homeForm, setHomeForm] = useState<{
    urlLivelink: string;
  }>({ urlLivelink: "" });
  const [isEditingHome, setIsEditingHome] = useState(false);
  
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

  // Load home data when homes are fetched
  useEffect(() => {
    if (homes && homes.length > 0) {
      const firstHome = homes[0];
      const urlLivelink = (firstHome as { urlLivelink?: string })?.urlLivelink || "";
      setHomeForm({ urlLivelink });
      setIsEditingHome(!!firstHome._id);
    }
  }, [homes]);


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

  // Home management handlers
  const handleHomeSave = async () => {
    setActionLoadingId("home");

    const payload: { urlLivelink?: string } = {
      urlLivelink: homeForm.urlLivelink || undefined,
    };

    // Har vaar add ke hit hoge (Always hit "addHome", never update)
    await dispatch(addHome(payload));

    dispatch(fetchHomes());
    setHomeDialogOpen(false);
    setActionLoadingId(null);
  };

  const openHomeDialog = () => {
    if (homes && homes.length > 0) {
      const firstHome = homes[0];
      const urlLivelink = (firstHome as { urlLivelink?: string })?.urlLivelink || "";
      setHomeForm({ urlLivelink });
      setIsEditingHome(!!firstHome._id);
    } else {
      setHomeForm({ urlLivelink: "" });
      setIsEditingHome(false);
    }
    setHomeDialogOpen(true);
  };

  return (
    <div className="w-full mx-auto px-2 sm:px-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold">Home Entries</h1>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
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
            <DialogContent className="max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full max-w-lg">
              <DialogHeader>
                <DialogTitle className="text-lg sm:text-xl">{editBannerId ? "Edit Banner" : "Add Banner"}</DialogTitle>
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
                  {bannerForm.imageUrl && bannerForm.imageUrl.trim() !== "" && (
                    <div className="mt-2">
                      <Image 
                        src={bannerForm.imageUrl} 
                        alt="Banner Preview" 
                        className="h-32 w-full sm:w-64 object-cover rounded" 
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
                <DialogFooter className="flex-col sm:flex-row gap-2">
                  <Button 
                    type="submit" 
                    className="w-full sm:w-auto"
                    disabled={!!(loading || actionLoadingId === "addBanner" || (editBannerId && actionLoadingId === editBannerId))}
                  >
                    {(loading || actionLoadingId === "addBanner" || (editBannerId && actionLoadingId === editBannerId)) && (
                      <Loader className="animate-spin mr-2" size={18} />
                    )}
                    {editBannerId ? "Update" : "Add"}
                  </Button>
                  <DialogClose asChild>
                    <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => { resetBannerForm(); }}>Cancel</Button>
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
            <DialogContent className="max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full max-w-lg">
              <DialogHeader>
                <DialogTitle className="text-lg sm:text-xl">{editSectionId ? "Edit Section" : "Add Section"}</DialogTitle>
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
                </div>
                <DialogFooter className="flex-col sm:flex-row gap-2">
                  <Button 
                    type="submit" 
                    className="w-full sm:w-auto"
                    disabled={!!(loading || actionLoadingId === "addSection" || (editSectionId && actionLoadingId === editSectionId))}
                  >
                    {(loading || actionLoadingId === "addSection" || (editSectionId && actionLoadingId === editSectionId)) && (
                      <Loader className="animate-spin mr-2" size={18} />
                    )}
                    {editSectionId ? "Update" : "Add"}
                  </Button>
                  <DialogClose asChild>
                    <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => { resetSectionForm(); }}>Cancel</Button>
                  </DialogClose>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          
        </div>
      </div>
      {error && <div className="text-red-500 mb-4">{error}</div>}

      {/* Live Link Display Section */}
      <div className="bg-white rounded shadow p-3 sm:p-4 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1">
            <h2 className="text-lg sm:text-xl font-bold mb-2">Live Link</h2>
            {homes && homes.length > 0 && (homes[0] as { urlLivelink?: string })?.urlLivelink ? (
              <p className="text-sm sm:text-base text-gray-600 break-words">
                {(homes[0] as { urlLivelink?: string }).urlLivelink}
              </p>
            ) : (
              <p className="text-sm text-gray-500">No live link set</p>
            )}
          </div>
          <Button variant="outline" onClick={openHomeDialog}>
            {homes && homes.length > 0 && (homes[0] as { urlLivelink?: string })?.urlLivelink ? "Edit" : "Add"}
          </Button>
        </div>
      </div>

      {/* Home Management Dialog */}
      <Dialog open={homeDialogOpen} onOpenChange={(open) => {
        setHomeDialogOpen(open);
        if (!open) {
          if (homes && homes.length > 0) {
            const firstHome = homes[0];
            const urlLivelink = (firstHome as { urlLivelink?: string })?.urlLivelink || "";
            setHomeForm({ urlLivelink });
          } else {
            setHomeForm({ urlLivelink: "" });
          }
        }
      }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">
              {isEditingHome ? "Edit Live Link" : "Add Live Link"}
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={e => {
              e.preventDefault();
              handleHomeSave();
            }}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="urlLivelink" className="mb-2">
                Live Link URL
              </Label>
              <Input
                id="urlLivelink"
                name="urlLivelink"
                type="url"
                placeholder="https://example.com"
                value={homeForm.urlLivelink || ""}
                onChange={e => setHomeForm({ ...homeForm, urlLivelink: e.target.value })}
              />
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                type="submit"
                className="w-full sm:w-auto"
                disabled={!!(loading || actionLoadingId === "home")}
              >
                {(loading || actionLoadingId === "home") && (
                  <Loader className="animate-spin mr-2" size={18} />
                )}
                {isEditingHome ? "Update" : "Add"}
              </Button>
              <DialogClose asChild>
                <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => {
                  if (homes && homes.length > 0) {
                    const firstHome = homes[0];
                    const urlLivelink = (firstHome as { urlLivelink?: string })?.urlLivelink || "";
                    setHomeForm({ urlLivelink });
                  } else {
                    setHomeForm({ urlLivelink: "" });
                  }
                }}>
                  Cancel
                </Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Banners List */}
      <div className="bg-white rounded shadow p-3 sm:p-4 mb-6">
        <h2 className="text-lg sm:text-xl font-bold mb-4">Banners</h2>
        {banners && banners.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {banners.map((banner: Banner, index: number) => (
              <div key={banner._id || index} className="border rounded-lg p-3 sm:p-4 space-y-3">
                {banner.imageUrl && banner.imageUrl.trim() !== "" && (
                  <Image 
                    src={banner.imageUrl} 
                    alt={banner.title || "Banner"} 
                    className="w-full h-32 object-cover rounded" 
                    width={400} 
                    height={128} 
                  />
                )}
                <div>
                  <p className="font-medium text-sm sm:text-base">{banner.title || "Untitled"}</p>
                  <p className="text-xs sm:text-sm text-gray-600">{banner.description || "-"}</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleEditBanner(banner)}
                    disabled={actionLoadingId === banner._id}
                    className="w-full sm:w-auto"
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
                    className="w-full sm:w-auto"
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
      <div className="bg-white rounded shadow p-3 sm:p-4 mb-6">
        <h2 className="text-lg sm:text-xl font-bold mb-4">Sections</h2>
        {sections && sections.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {sections.map((section: FeaturedCategory, index: number) => {
              // Check if products are objects or IDs
              const productsArray = Array.isArray(section.products) ? section.products : [];
              const hasProductObjects = productsArray.length > 0 && typeof productsArray[0] === 'object' && productsArray[0] !== null;
              
              return (
                <div key={section._id || index} className="border rounded-lg p-3 sm:p-4 space-y-3">
                  <div>
                    <p className="font-medium text-sm sm:text-base">{section.title || "Untitled"}</p>
                    <p className="text-xs sm:text-sm text-gray-600 mb-2">
                      Products: {productsArray.length}
                    </p>
                    {hasProductObjects && productsArray.length > 0 && (
                      <div className="space-y-2 mt-2">
                        {productsArray.slice(0, 3).map((product, pIdx: number) => {
                          const productObj = product as ProductObject;
                          return (
                            <div key={productObj._id || pIdx} className="flex gap-2 items-center border rounded p-2">
                              {productObj.imageUrl && typeof productObj.imageUrl === "string" && productObj.imageUrl.trim() !== "" && (
                                <Image
                                  src={productObj.imageUrl}
                                  alt={productObj.name || "Product"}
                                  className="h-10 w-10 sm:h-12 sm:w-12 object-cover rounded flex-shrink-0"
                                  width={48}
                                  height={48}
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-xs sm:text-sm font-medium truncate">{productObj.name || "Unknown"}</p>
                                {productObj.category && (
                                  <p className="text-xs text-gray-500 truncate">{productObj.category}</p>
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
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleEditSection(section)}
                      disabled={actionLoadingId === section._id}
                      className="w-full sm:w-auto"
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
                      className="w-full sm:w-auto"
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
      
    </div>
  );
};

export default HomePage;