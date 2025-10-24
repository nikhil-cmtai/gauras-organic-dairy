"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchDistributorOrders,
  fetchWholesaleOrders,
  updateOrder,
  updateDistributorOrder,
  selectWholesaleOrders,
  selectDistributorOrders,
  selectLoading,
  selectError,
} from "@/lib/redux/orderSlice";
import { selectProducts, fetchProducts } from "@/lib/redux/productSlice";
import { selectDistributors, fetchDistributors } from "@/lib/redux/distributorSlice";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader, Loader2 } from "lucide-react";
import type { AppDispatch } from "@/lib/store";
import type { Order } from "@/lib/redux/orderSlice";
import type { Product } from "@/lib/redux/productSlice";
import type { Distributor } from "@/lib/redux/distributorSlice";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { useRouter } from 'next/navigation';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

// Function to generate WhatsApp message based on order status
const generateWhatsAppMessage = (order: Order, productName: string, distributorName: string) => {
  if (!order.orders[0]) return "";
  
  const orderDetails = order.orders[0];
  const status = orderDetails.status;
  const quantity = orderDetails.quantity || 0;
  const price = orderDetails.price || 0;
  const quantityDelivered = orderDetails.quantityDelievered || 0;
  const quantityPending = orderDetails.quantityPending || 0;
  
  let message = `Dear ${distributorName},\n\n`;
  
  switch (status) {
    case "complete":
      message += `Your order for ${productName} has been dispatched successfully.\n\n`;
      message += `Product: ${productName}\n`;
      message += `Quantity: ${quantity}\n`;
      message += `Price: ₹${price}\n`;
      message += `Status: Completed\n\n`;
      message += `Thank you for your business!`;
      break;
      
    case "partially completed":
      message += `Your order for ${productName} has been partially dispatched.\n\n`;
      message += `Product: ${productName}\n`;
      message += `Total Quantity: ${quantity}\n`;
      message += `Delivered: ${quantityDelivered}\n`;
      message += `Pending: ${quantityPending}\n`;
      message += `Price: ₹${price}\n`;
      message += `Status: Partially Completed\n\n`;
      message += `We will update you when the remaining items are dispatched.`;
      break;
      
    case "pending":
      message += `Your order for ${productName} is being processed.\n\n`;
      message += `Product: ${productName}\n`;
      message += `Quantity: ${quantity}\n`;
      message += `Price: ₹${price}\n`;
      message += `Status: Pending\n\n`;
      message += `We will notify you once your order is dispatched.`;
      break;
      
    case "cancel":
      message += `Your order for ${productName} has been cancelled as requested.\n\n`;
      message += `Product: ${productName}\n`;
      message += `Quantity: ${quantity}\n`;
      message += `Status: Cancelled\n\n`;
      message += `Please contact us if you have any questions.`;
      break;
      
    default:
      message += `Update regarding your order for ${productName}.\n\n`;
      message += `Product: ${productName}\n`;
      message += `Quantity: ${quantity}\n`;
      message += `Status: ${status}\n\n`;
      message += `Thank you for your business.`;
  }
  
  return message;
};

type OrderEditData = {
  status: string;
  quantity: number;
  quantityDelievered?: number;
  quantityPending?: number;
};

// Helper to group orders by order._id
const groupOrdersById = (orders: Order[]) => {
  const map: Record<string, Order[]> = {};
  orders.forEach(order => {
    if (!map[order._id]) map[order._id] = [];
    map[order._id].push(order);
  });
  return map;
};

const OrdersPage = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const wholesaleOrders = useSelector(selectWholesaleOrders);
  const distributorOrders = useSelector(selectDistributorOrders);
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);
  const products = useSelector(selectProducts);
  const distributors = useSelector(selectDistributors);

  const [tab, setTab] = useState<"distributor" | "wholesale">("distributor");
  const [editOrder, setEditOrder] = useState<Order | null>(null);
  const [editModalData, setEditModalData] = useState<OrderEditData>({ status: '', quantity: 0, quantityDelievered: 0, quantityPending: 0 });
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchDistributors());
  }, [dispatch]);

  useEffect(() => {
    if (tab === "distributor") {
      dispatch(fetchDistributorOrders());
    } else {
      dispatch(fetchWholesaleOrders());
    }
    setEditOrder(null);
    setEditModalData({ status: "", quantity: 0, quantityDelievered: 0, quantityPending: 0 });
  }, [tab, dispatch]);

  const openEditModal = (order: Order) => {
    setEditOrder(order);
    setEditModalData({
      status: order.orders[0]?.status || '',
      quantity: order.orders[0]?.quantity || 0,
      quantityDelievered: order.orders[0]?.quantityDelievered || 0,
      quantityPending: order.orders[0]?.quantityPending || 0,
    });
    setEditModalOpen(true);
  };

  const handleModalChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (name === 'quantityDelievered') {
      // When delivered changes, auto-update pending
      const delivered = Number(value);
      setEditModalData(prev => ({
        ...prev,
        quantityDelievered: delivered,
        quantityPending: Math.max(0, Number(prev.quantity) - delivered),
      }));
    } else {
      setEditModalData(prev => ({
        ...prev,
        [name]: (type === "number" || name === "quantity" || name === "quantityDelievered" || name === "quantityPending")
          ? Number(value)
          : value
      }));
    }
  };

  const handleModalSave = async () => {
    if (!editOrder) return;
    setActionLoadingId(editOrder.orders[0]?._id ?? '');
    let payload: Record<string, unknown>;
    if (editModalData.status === 'partially completed') {
      payload = {
        status: editModalData.status,
        quantityDelievered: Number(editModalData.quantityDelievered),
        // Calculate and ensure quantityPending is never negative
        quantityPending: Math.max(0, Number(editModalData.quantity) - Number(editModalData.quantityDelievered || 0)),
      };
    } else {
      payload = {
        status: editModalData.status,
        quantity: Number(editModalData.quantity),
      };
    }
    
    if (tab === 'distributor') {
      await dispatch(updateDistributorOrder(editOrder.orders[0]?._id ?? '', payload));
      dispatch(fetchDistributorOrders());
    } else {
      await dispatch(updateOrder(editOrder.orders[0]?._id ?? '', payload));
      dispatch(fetchWholesaleOrders());
    }
    
    // Close modal immediately
    setEditOrder(null);
    setEditModalOpen(false);
    setActionLoadingId(null);
    
    // After saving, check if we should send a WhatsApp message
    const distributor = distributors.find((d: Distributor) => d._id === editOrder.distributorId);
    
    // Make sure we have the product ID and it's valid
    const productId = editOrder.orders[0]?.productId;
    
    // Find the product by ID
    const product = productId ? products.find((p: Product) => p._id === productId) : null;
    
    if (distributor && distributor.phone) {
      // If product is null, use a fallback name
      const productName = product ? product.name : "your ordered product";
      
      // Generate message based on updated order status
      const updatedOrder = { 
        ...editOrder, 
        orders: [{ 
          ...editOrder.orders[0],
          status: editModalData.status,
          quantity: Number(editModalData.quantity),
          quantityDelievered: Number(editModalData.quantityDelievered || 0),
          quantityPending: Math.max(0, Number(editModalData.quantity) - Number(editModalData.quantityDelievered || 0))
        }] 
      };
      
      const message = generateWhatsAppMessage(updatedOrder, productName, distributor.name);
      const encodedMessage = encodeURIComponent(message);
      
      // For WhatsApp, we need to remove any non-numeric characters
      // If the number starts with a '+', we need to replace it with the country code
      let cleanPhone = distributor.phone;
      
      // Remove any non-numeric characters except the leading '+'
      if (cleanPhone.startsWith('+')) {
        // If it starts with '+', remove the '+' but keep the country code
        cleanPhone = cleanPhone.substring(1);
      }
      
      // Remove any remaining non-numeric characters
      cleanPhone = cleanPhone.replace(/\D/g, '');
      
      // Create the WhatsApp URL
      const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
      
      // Open WhatsApp in a new tab after a short delay
      setTimeout(() => {
        try {
          // Using window.open with _blank to ensure it opens in a new tab
          const newWindow = window.open(whatsappUrl, '_blank');
          
          // If popup is blocked, alert the user
          if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
            alert("WhatsApp redirect was blocked. Please allow popups for this site to automatically open WhatsApp.");
          }
        } catch (error) {
          alert("Failed to open WhatsApp. Please check console for details.");
          console.error("Error opening WhatsApp:", error);
        }
      }, 1500);
    } else {
      console.warn("Cannot send WhatsApp: missing distributor, product, or phone number");
      if (!distributor) console.warn("Distributor not found");
      if (!product) console.warn("Product not found");
      if (distributor && !distributor.phone) console.warn("Distributor has no phone number");
    }
  };

  const handleViewInvoice = (order: Order) => {
    // Store order data in localStorage for the print page
    localStorage.setItem('currentOrder', JSON.stringify({
      ...order,
      distributorName: getDistributorName(order.distributorId || ""),
      productName: getProductName(order.orders[0]?.productId || "")
    }));
    
    // Navigate to the print invoice page
    router.push('/dashboard/orders/print-invoice');
  };

  const getProductName = (productId: string) => {
    return products.find((p: Product) => p._id === productId)?.name || "Unknown";
  };

  const getDistributorName = (distributorId: string) => {
    return distributors.find((d: Distributor) => d._id === distributorId)?.name || distributorId;
  };

  return (
    <div className="w-full mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Button variant={tab === "distributor" ? "default" : "outline"} onClick={() => setTab("distributor")}>Distributor Orders</Button>
        <Button variant={tab === "wholesale" ? "default" : "outline"} onClick={() => setTab("wholesale")}>Wholesale Orders</Button>
      </div>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <div className="bg-white rounded shadow p-4">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="animate-spin h-8 w-8 text-purple-500" />
          </div>
        ) : (
          <>
            <Dialog open={editModalOpen} onOpenChange={open => setEditModalOpen(!!open)}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Order</DialogTitle>
                </DialogHeader>
                <form
                  onSubmit={e => {
                    e.preventDefault();
                    handleModalSave();
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium mb-1">Status</label>
                    <select
                      name="status"
                      value={editModalData.status}
                      onChange={handleModalChange}
                      className="w-full border rounded px-2 py-2"
                      required
                    >
                      <option value="">Select status</option>
                      <option value="cancel">Cancel</option>
                      <option value="complete">Complete</option>
                      <option value="partially completed">Partially Completed</option>
                    </select>
                  </div>
                  {editModalData.status === 'partially completed' && (
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="block text-sm font-medium mb-1">Quantity Delivered</label>
                        <Input
                          name="quantityDelievered"
                          type="number"
                          value={editModalData.quantityDelievered}
                          onChange={handleModalChange}
                          min={0}
                          max={editModalData.quantity}
                          className="w-full"
                          required
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-medium mb-1">Quantity Pending</label>
                        <Input
                          name="quantityPending"
                          type="number"
                          value={editModalData.quantityPending}
                          readOnly
                          className="w-full bg-gray-100 cursor-not-allowed"
                        />
                      </div>
                    </div>
                  )}
                  <DialogFooter>
                    <Button type="submit" disabled={Boolean(actionLoadingId && editOrder && actionLoadingId === editOrder.orders[0]?._id)}>
                      {actionLoadingId && editOrder && actionLoadingId === editOrder.orders[0]?._id ? (
                        <Loader className="animate-spin mr-2" size={18} />
                      ) : null}
                      Save
                    </Button>
                    <DialogClose asChild>
                      <Button type="button" variant="outline" onClick={() => setEditModalOpen(false)}>Cancel</Button>
                    </DialogClose>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            {tab === "distributor" ? (
              <Accordion type="multiple" className="w-full">
                {distributorOrders && distributorOrders.length > 0 ? (
                  Object.entries(groupOrdersById(distributorOrders)).map(([orderId, orders]) => (
                    <AccordionItem key={orderId} value={orderId}>
                      <AccordionTrigger>
                        <span className="font-semibold">
                          Order ID: {orderId}
                          {orders[0]?.createdAt && (
                            <> &nbsp;|&nbsp; <span className="font-normal text-sm text-gray-500">Date: {new Date(orders[0].createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span></>
                          )}
                        </span>
                      </AccordionTrigger>
                      <AccordionContent>
                        <table className="w-full text-left mb-4">
                          <thead>
                            <tr>
                              <th className="py-2">Product</th>
                              <th className="py-2">Distributor</th>
                              <th className="py-2">Quantity</th>
                              <th className="py-2">Delivered</th>
                              <th className="py-2">Pending</th>
                              <th className="py-2">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {orders[0].orders.map((product, idx) => (
                              <tr key={product._id || idx}>
                                <td className="py-2">{getProductName(product.productId || "")}</td>
                                <td className="py-2">{getDistributorName(orders[0].distributorId || "")}</td>
                                <td className="py-2">{product.quantity}</td>
                                <td className="py-2">{product.status === 'partially completed'
                                  ? product.quantityDelievered ?? 0
                                  : product.status === 'complete'
                                    ? product.quantity
                                    : 0}</td>
                                <td className="py-2">{product.status === 'partially completed'
                                  ? Math.max(0, product.quantityPending ?? 0)
                                  : product.status === 'pending' || product.status === ''
                                    ? product.quantity
                                    : 0}</td>
                                <td className="py-2"><span className="capitalize">{product.status}</span></td>
                                <td className="py-2 flex gap-2">
                                  <Button size="sm" variant="outline" onClick={() => openEditModal({
                                    ...orders[0],
                                    orders: [product]
                                  })}>
                                    Edit
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <div className="flex gap-2 mt-2">
                          <Button size="sm" variant="default" onClick={() => handleViewInvoice(orders[0])}>
                            Invoice
                          </Button>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))
                ) : (
                  <div className="text-center py-4 text-muted-foreground">No orders found.</div>
                )}
              </Accordion>
            ) : (
              <Accordion type="multiple" className="w-full">
                {wholesaleOrders && wholesaleOrders.length > 0 ? (
                  Object.entries(groupOrdersById(wholesaleOrders)).map(([orderId, orders]) => (
                    <AccordionItem key={orderId} value={orderId}>
                      <AccordionTrigger>
                        <span className="font-semibold">
                          Order ID: {orderId}
                          {orders[0]?.createdAt && (
                            <> &nbsp;|&nbsp; <span className="font-normal text-sm text-gray-500">Date: {new Date(orders[0].createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span></>
                          )}
                        </span>
                      </AccordionTrigger>
                      <AccordionContent>
                        <table className="w-full text-left mb-4">
                          <thead>
                            <tr>
                              <th className="py-2">Product</th>
                              <th className="py-2">Distributor</th>
                              <th className="py-2">Quantity</th>
                              <th className="py-2">Delivered</th>
                              <th className="py-2">Pending</th>
                              <th className="py-2">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {orders[0].orders.map((product, idx) => (
                              <tr key={product._id || idx}>
                                <td className="py-2">{getProductName(product.productId || "")}</td>
                                <td className="py-2">{getDistributorName(orders[0].distributorId || "")}</td>
                                <td className="py-2">{product.quantity}</td>
                                <td className="py-2">{product.status === 'partially completed'
                                  ? product.quantityDelievered ?? 0
                                  : product.status === 'complete'
                                    ? product.quantity
                                    : 0}</td>
                                <td className="py-2">{product.status === 'partially completed'
                                  ? Math.max(0, product.quantityPending ?? 0)
                                  : product.status === 'pending' || product.status === ''
                                    ? product.quantity
                                    : 0}</td>
                                <td className="py-2"><span className="capitalize">{product.status}</span></td>
                                <td className="py-2 flex gap-2">
                                  <Button size="sm" variant="outline" onClick={() => openEditModal({
                                    ...orders[0],
                                    orders: [product]
                                  })}>
                                    Edit
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </AccordionContent>
                    </AccordionItem>
                  ))
                ) : (
                  <div className="text-center py-4 text-muted-foreground">No orders found.</div>
                )}
              </Accordion>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;