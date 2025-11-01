"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchSubscriptions,
  updateSubscription,
  selectSubscriptions,
  selectSubscriptionsLoading,
  selectSubscriptionsError,
} from "@/lib/redux/subscriptionSlice";
import { selectProducts, fetchProducts } from "@/lib/redux/productSlice";
import { selectUsers, fetchUsers } from "@/lib/redux/userSlice";
import { Button } from "@/components/ui/button";
import { Loader, Loader2 } from "lucide-react";
import type { AppDispatch } from "@/lib/store";
import type {
  Subscription,
  SubscriptionStatus,
} from "@/lib/redux/subscriptionSlice";
import type { Product } from "@/lib/redux/productSlice";
import type { User } from "@/lib/redux/userSlice";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

type SubscriptionEditData = {
  status: SubscriptionStatus;
  deliveryBoy?: string;
};

const SubscriptionsPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const subscriptions = useSelector(selectSubscriptions);
  const loading = useSelector(selectSubscriptionsLoading);
  const error = useSelector(selectSubscriptionsError);
  const products = useSelector(selectProducts);
  const users = useSelector(selectUsers);

  // Filter delivery partners
  const deliveryPartners = users.filter(
    (user: User) => user.role === "delivery" || user.role === "deliveryBoy"
  );

  const [editSubscription, setEditSubscription] = useState<Subscription | null>(null);
  const [editModalData, setEditModalData] = useState<SubscriptionEditData>({
    status: "Active",
    deliveryBoy: "none",
  });
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchSubscriptions());
    dispatch(fetchProducts());
    dispatch(fetchUsers());
  }, [dispatch]);

  const openEditModal = (subscription: Subscription) => {
    setEditSubscription(subscription);
    setEditModalData({
      status: subscription.status || "Active",
      deliveryBoy: subscription.deliveryBoy || "none",
    });
    setEditModalOpen(true);
  };

  const handleModalChange = (field: string, value: string) => {
    setEditModalData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleModalSave = async () => {
    if (!editSubscription || !editSubscription._id) return;
    setActionLoadingId(editSubscription._id);

    const payload: Partial<Subscription> = {
      status: editModalData.status,
      deliveryBoy: editModalData.deliveryBoy === "none" ? undefined : editModalData.deliveryBoy,
    };

    await dispatch(updateSubscription(editSubscription._id, payload));
    dispatch(fetchSubscriptions());

    setEditSubscription(null);
    setEditModalOpen(false);
    setActionLoadingId(null);
  };

  const getProductName = (productId: string) =>
    products.find((p: Product) => p._id === productId)?.name || "Unknown";

  const getUserName = (userId: string) =>
    users.find((u: User) => u._id === userId)?.name || userId;

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="w-full mx-auto">
      <h1 className="text-2xl font-bold mb-6">Subscriptions</h1>
      {error && <div className="text-red-500 mb-4">{error}</div>}

      <div className="bg-white rounded shadow p-4">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="animate-spin h-8 w-8 text-purple-500" />
          </div>
        ) : (
          <>
            <Dialog open={editModalOpen} onOpenChange={(open) => setEditModalOpen(!!open)}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Subscription</DialogTitle>
                </DialogHeader>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleModalSave();
                  }}
                  className="space-y-4"
                >
                  <div>
                    <Label htmlFor="status" className="mb-2">
                      Status
                    </Label>
                    <Select
                      value={editModalData.status}
                      onValueChange={(value) =>
                        handleModalChange("status", value)
                      }
                      required
                    >
                      <SelectTrigger id="status">
                        <SelectValue placeholder="Select Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Expired">Expired</SelectItem>
                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="deliveryBoy" className="mb-2">
                      Delivery Partner
                    </Label>
                    <Select
                      value={editModalData.deliveryBoy || "none"}
                      onValueChange={(value) =>
                        handleModalChange("deliveryBoy", value)
                      }
                    >
                      <SelectTrigger id="deliveryBoy">
                        <SelectValue placeholder="Select Delivery Partner" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {deliveryPartners.map((partner: User) => (
                          <SelectItem key={partner._id} value={partner._id!}>
                            {partner.name} ({partner.phone})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <DialogFooter>
                    <Button
                      type="submit"
                      disabled={
                        !!(
                          actionLoadingId &&
                          editSubscription &&
                          actionLoadingId === editSubscription._id
                        )
                      }
                    >
                      {actionLoadingId &&
                      editSubscription &&
                      actionLoadingId === editSubscription._id ? (
                        <Loader className="animate-spin mr-2" size={18} />
                      ) : null}
                      Save
                    </Button>
                    <DialogClose asChild>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setEditModalOpen(false)}
                      >
                        Cancel
                      </Button>
                    </DialogClose>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            <Accordion type="multiple" className="w-full">
              {subscriptions && subscriptions.length > 0 ? (
                subscriptions.map((subscription: Subscription) => (
                  <AccordionItem key={subscription._id} value={subscription._id || ""}>
                    <AccordionTrigger>
                      <div className="flex items-center gap-4">
                        <span className="font-semibold">
                          Subscription #{subscription._id?.substring(0, 8) || "N/A"}
                        </span>
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            subscription.status === "Active"
                              ? "bg-green-100 text-green-800"
                              : subscription.status === "Expired"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {subscription.status}
                        </span>
                        <span className="text-sm text-gray-500">
                          {getUserName(subscription.user)}
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-medium text-gray-500">
                              Subscription Type
                            </Label>
                            <p className="font-medium">
                              {subscription.subscriptionType}
                            </p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-500">
                              Product
                            </Label>
                            <p className="font-medium">
                              {getProductName(subscription.productId)}
                            </p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-500">
                              User
                            </Label>
                            <p className="font-medium">
                              {getUserName(subscription.user)}
                            </p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-500">
                              Delivery Partner
                            </Label>
                            <p className="font-medium">
                              {subscription.deliveryBoy
                                ? getUserName(subscription.deliveryBoy)
                                : "Not Assigned"}
                            </p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-500">
                              Delivery Day
                            </Label>
                            <p className="font-medium">
                              {subscription.deliveryDays || "N/A"}
                            </p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-500">
                              Number of Packets
                            </Label>
                            <p className="font-medium">
                              {subscription.numberPacket || 0}
                            </p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-500">
                              Start Date
                            </Label>
                            <p className="font-medium">
                              {formatDate(subscription.startDate)}
                            </p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-500">
                              End Date
                            </Label>
                            <p className="font-medium">
                              {formatDate(subscription.endDate)}
                            </p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-500">
                              Renewal Date
                            </Label>
                            <p className="font-medium">
                              {formatDate(subscription.renewalDate)}
                            </p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-500">
                              Total Amount
                            </Label>
                            <p className="font-medium">
                              ₹{subscription.total?.toFixed(2) || "0.00"}
                            </p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-500">
                              Payment Mode
                            </Label>
                            <p className="font-medium">
                              {subscription.paymentMode || "N/A"}
                            </p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-500">
                              Payment Verified
                            </Label>
                            <p className="font-medium">
                              {subscription.paymentVerified ? (
                                <span className="text-green-600">✓ Verified</span>
                              ) : (
                                <span className="text-red-600">✗ Not Verified</span>
                              )}
                            </p>
                          </div>
                          {subscription.deliveryFee !== undefined && (
                            <div>
                              <Label className="text-sm font-medium text-gray-500">
                                Delivery Fee
                              </Label>
                              <p className="font-medium">
                                ₹{subscription.deliveryFee?.toFixed(2) || "0.00"}
                              </p>
                            </div>
                          )}
                          {subscription.gst !== undefined && (
                            <div>
                              <Label className="text-sm font-medium text-gray-500">
                                GST
                              </Label>
                              <p className="font-medium">
                                ₹{subscription.gst?.toFixed(2) || "0.00"}
                              </p>
                            </div>
                          )}
                          {subscription.discount !== undefined && (
                            <div>
                              <Label className="text-sm font-medium text-gray-500">
                                Discount
                              </Label>
                              <p className="font-medium">
                                ₹{subscription.discount?.toFixed(2) || "0.00"}
                              </p>
                            </div>
                          )}
                        </div>

                        <div>
                          <Label className="text-sm font-medium text-gray-500">
                            Delivery Address
                          </Label>
                          <p className="font-medium mt-1">
                            {subscription.address || "N/A"}
                          </p>
                        </div>

                        {subscription.skippedDates &&
                          subscription.skippedDates.length > 0 && (
                            <div>
                              <Label className="text-sm font-medium text-gray-500">
                                Skipped Dates
                              </Label>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {subscription.skippedDates.map((date, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-1 bg-gray-100 rounded text-xs"
                                  >
                                    {formatDate(date)}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                        {subscription.createdAt && (
                          <div>
                            <Label className="text-sm font-medium text-gray-500">
                              Created At
                            </Label>
                            <p className="font-medium">
                              {formatDate(subscription.createdAt)}
                            </p>
                          </div>
                        )}

                        <div className="flex gap-2 pt-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditModal(subscription)}
                            disabled={actionLoadingId === subscription._id}
                          >
                            {actionLoadingId === subscription._id ? (
                              <Loader className="animate-spin mr-2" size={16} />
                            ) : null}
                            Edit
                          </Button>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  No subscriptions found.
                </div>
              )}
            </Accordion>
          </>
        )}
      </div>
    </div>
  );
};

export default SubscriptionsPage;
