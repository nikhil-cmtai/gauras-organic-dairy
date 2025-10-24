"use client";

import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import type { AppDispatch } from "@/lib/store";
import {
  fetchAdminById,
  updateUserProfile,
  selectUser,
  selectIsLoading,
  selectError,
} from "@/lib/redux/authSlice";
import Image from "next/image";

const SettingsPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector(selectUser);
  const loading = useSelector(selectIsLoading);
  const error = useSelector(selectError);

  // Original profile data from API
  const [originalProfile, setOriginalProfile] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    address: "",
    pincode: "",
    state: "",
    signature: "",
    gstNumber: "",
    bankAccountNumber: "",
    bankIfsc: "",
    bankAddress: "",
    bankName: "",
    accountHolderName: "",
  });
  
  // Editable profile data (only changed when editing)
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    address: "",
    pincode: "",
    state: "",
    signature: "",
    gstNumber: "",
    bankAccountNumber: "",
    bankIfsc: "",
    bankAddress: "",
    bankName: "",
    accountHolderName: "",
  });
  
  const [success, setSuccess] = useState("");
  const [editMode, setEditMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch admin data only once on component mount
  useEffect(() => {
    // Get admin id from cookie named 'admin_token'
    let adminId = null;
    if (typeof document !== "undefined") {
      const match = document.cookie.match(/(?:^|;\s*)admin_token=([^;]*)/);
      if (match) {
        adminId = decodeURIComponent(match[1]);
      }
    }
    if (adminId) {
      dispatch(fetchAdminById(adminId));
    }
  }, [dispatch]);

  // Update both original and editable profile when user data changes
  useEffect(() => {
    if (user) {
      const userData = {
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        password: "", // Always blank for security
        address: user.address || "",
        pincode: user.pincode || "",
        state: user.state || "",
        signature: user.signature || "",
        gstNumber: user.gstNumber || "",
        bankAccountNumber: user.bankAccountNumber || "",
        bankIfsc: user.bankIfsc || "",
        bankAddress: user.bankAddress || "",
        bankName: user.bankName || "",
        accountHolderName: user.accountHolderName || "",
      };
      setOriginalProfile(userData);
      setProfile(userData);
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Store the selected file
    setSelectedFile(file);
    
    // Create a preview URL for display
    const previewUrl = URL.createObjectURL(file);
    setProfile((prev) => ({ ...prev, signature: previewUrl }));
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent any default action
    console.log("Edit mode activated - No API call");
    setEditMode(true);
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent any default action
    console.log("Edit cancelled - No API call");
    // Reset form to original values on cancel
    setProfile(originalProfile);
    setSelectedFile(null);
    setEditMode(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess("");
    setIsSaving(true);
    
    // Create FormData for file upload
    const formData = new FormData();
    
    // Add all profile fields except password if blank
    Object.entries(profile).forEach(([key, value]) => {
      if (key === 'password') {
        if (value) {
          formData.append('password', value);
        }
      } else if (key !== 'signature' || !selectedFile) {
        formData.append(key, value);
      }
    });
    
    // Add file if selected
    if (selectedFile) {
      formData.append('signature', selectedFile);
    }
    
    try {
      // Only make API call when saving
      const res = await dispatch(updateUserProfile(formData, user?._id || ""));
      setEditMode(false);

      
      if (res?.payload) {
        console.log("API call successful");
        setSuccess("Profile updated successfully!");
        setEditMode(false); // Turn off edit mode on success
        setSelectedFile(null);
        
        // Update original profile after successful save
        if (user) {
          setOriginalProfile({
            name: user.name || "",
            email: user.email || "",
            phone: user.phone || "",
            password: user.password || "",
            address: user.address || "",
            pincode: user.pincode || "",
            state: user.state || "",
            signature: user.signature || "",
            gstNumber: user.gstNumber || "",
            bankAccountNumber: user.bankAccountNumber || "",
            bankIfsc: user.bankIfsc || "",
            bankAddress: user.bankAddress || "",
            bankName: user.bankName || "",
            accountHolderName: user.accountHolderName || "",
          });
        }
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccess("");
        }, 3000);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full flex justify-center">
      <div className="max-w-3xl w-full">
        <h1 className="text-3xl font-bold mb-6">Settings</h1>
        {error && (
          <div className="flex items-center gap-2 text-red-600 mb-4">
            <XCircle size={20} /> {error}
          </div>
        )}
        {success && (
          <div className="flex items-center gap-2 text-green-600 mb-4">
            <CheckCircle2 size={20} /> {success}
          </div>
        )}
        <form onSubmit={handleSave} className="bg-white rounded shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <Input name="name" value={profile.name} onChange={handleChange} disabled={!editMode} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <Input name="email" value={profile.email} onChange={handleChange} disabled={!editMode} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <Input name="phone" value={profile.phone} onChange={handleChange} disabled={!editMode} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <Input name="password" value={profile.password} onChange={handleChange} disabled={!editMode} type="password" placeholder="Leave blank to keep unchanged" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">GST Number</label>
              <Input name="gstNumber" value={profile.gstNumber} onChange={handleChange} disabled={!editMode} required />
            </div>
            <div> 
              <label className="block text-sm font-medium mb-1">Bank Account Number</label>
              <Input name="bankAccountNumber" value={profile.bankAccountNumber} onChange={handleChange} disabled={!editMode} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Bank IFSC</label>
              <Input name="bankIfsc" value={profile.bankIfsc} onChange={handleChange} disabled={!editMode} required />
              </div>
            <div>
              <label className="block text-sm font-medium mb-1">Bank Address</label>
              <Input name="bankAddress" value={profile.bankAddress} onChange={handleChange} disabled={!editMode} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Bank Name</label>
              <Input name="bankName" value={profile.bankName} onChange={handleChange} disabled={!editMode} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Bank Account Holder Name</label>
              <Input name="accountHolderName" value={profile.accountHolderName} onChange={handleChange} disabled={!editMode} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Address</label>
              <textarea
                name="address"
                value={profile.address}
                onChange={handleChange}
                disabled={!editMode}
                required
                className="w-full rounded-lg border border-gray-300 shadow-sm px-3 py-2 min-h-[70px] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                placeholder="Enter your address"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Pincode</label>
              <Input name="pincode" value={profile.pincode} onChange={handleChange} disabled={!editMode} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">State</label>
              <Input name="state" value={profile.state} onChange={handleChange} disabled={!editMode} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Signature</label>
              {profile.signature && (
                <Image src={profile.signature} alt="Signature Preview" width={100} height={200} className="h-16 mb-2 border rounded" />
              )}
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                disabled={!editMode}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-6">
            {editMode ? (
              <>
                <Button type="submit" disabled={loading || isSaving} className="bg-red-600 hover:bg-red-700">
                  {(loading || isSaving) && <Loader2 className="animate-spin mr-2" size={18} />}
                  {isSaving ? 'Saving...' : 'Save'}
                </Button>
                <Button type="button" variant="outline" onClick={(e) => handleCancel(e)}>
                  Cancel
                </Button>
              </>
            ) : (
              <Button type="button" variant="outline" onClick={(e) => handleEdit(e)}>
                Edit
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsPage;
