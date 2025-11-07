"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchOrders,
  updateOrder,
  selectOrders,
  selectOrderLoading,
  selectOrderError,
} from "@/lib/redux/orderSlice";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { selectUsers, fetchUsers } from "@/lib/redux/userSlice";
import { Button } from "@/components/ui/button";
import { Loader, Loader2 } from "lucide-react";
import type { AppDispatch } from "@/lib/store";
import type { Order } from "@/lib/redux/orderSlice";
import { OrderStatus } from "@/lib/redux/orderSlice";
import type { User } from "@/lib/redux/userSlice";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
// import { useRouter } from 'next/navigation';
import { assignDeliveryPartner } from "@/lib/redux/orderSlice";

type OrderEditData = {
  status: OrderStatus;
};

type OrderAssignData = {
  deliveryBoyId: string;
};

const OrdersPage = () => {
  // const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const orders = useSelector(selectOrders);
  const loading = useSelector(selectOrderLoading);
  const error = useSelector(selectOrderError);
  const users = useSelector(selectUsers);

  // Filter delivery partners
  const deliveryPartners = users.filter(
    (user: User) => user.role === "delivery" || user.role === "deliveryBoy"
  );

  const [editOrder, setEditOrder] = useState<Order | null>(null);
  const [assignOrder, setAssignOrder] = useState<Order | null>(null);
  const [editModalData, setEditModalData] = useState<OrderEditData>({ status: OrderStatus.Pending });
  const [assignModalData, setAssignModalData] = useState<OrderAssignData>({ deliveryBoyId: "none" });
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchUsers());
    dispatch(fetchOrders());
  }, [dispatch]);

  const openEditModal = (order: Order) => {
    setEditOrder(order);
    setEditModalData({
      status: order.status || OrderStatus.Pending,
    });
    setEditModalOpen(true);
  };

  const openAssignModal = (order: Order) => {
    setAssignOrder(order);
    setAssignModalData({
      deliveryBoyId: order.deliveryBoy || "none",
    });
    setAssignModalOpen(true);
  };

  const handleEditModalChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    setEditModalData({ status: value as OrderStatus });
  };

  const handleAssignModalChange = (value: string) => {
    setAssignModalData({ deliveryBoyId: value });
  };

  const handleEditModalSave = async () => {
    if (!editOrder || !editOrder._id) return;
    setActionLoadingId(editOrder._id);

    const payload: Record<string, unknown> = {
      status: editModalData.status,
    };

    await dispatch(updateOrder(editOrder._id, payload));
    dispatch(fetchOrders());

    // Close modal
    setEditOrder(null);
    setEditModalOpen(false);
    setActionLoadingId(null);
  };

  const handleAssignModalSave = async () => {
    if (!assignOrder || !assignOrder._id) return;
    setActionLoadingId(assignOrder._id);

    const payload: Record<string, unknown> = {
      orderId: assignOrder._id,
      deliveryBoyId: assignModalData.deliveryBoyId === "none" ? undefined : assignModalData.deliveryBoyId,
    };

    await dispatch(assignDeliveryPartner(payload));
    dispatch(fetchOrders());

    // Close modal
    setAssignOrder(null);
    setAssignModalOpen(false);
    setActionLoadingId(null);
  };

  // const handleViewInvoice = (order: Order) => {
  //   localStorage.setItem('currentOrder', JSON.stringify(order));
  //   router.push('/dashboard/orders/print-invoice');
  // };

  const getUserName = (userId: string) =>
    users.find((u: User) => u._id === userId)?.name || userId || "Unknown";

  return (
    <div className="w-full mx-auto">
      <h1 className="text-2xl font-bold mb-6">Orders</h1>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <div className="bg-white rounded shadow p-4">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="animate-spin h-8 w-8 text-purple-500" />
          </div>
        ) : (
          <>
            {/* Edit Order Modal */}
            <Dialog open={editModalOpen} onOpenChange={open => setEditModalOpen(!!open)}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Order Status</DialogTitle>
                </DialogHeader>
                <form
                  onSubmit={e => {
                    e.preventDefault();
                    handleEditModalSave();
                  }}
                  className="space-y-4"
                >
                  <div>
                    <Label htmlFor="status" className="mb-2">Status</Label>
                    <select
                      id="status"
                      name="status"
                      value={editModalData.status}
                      onChange={handleEditModalChange}
                      className="w-full border rounded px-2 py-2"
                      required
                    >
                      <option value="Pending">Pending</option>
                      <option value="Accepted">Accepted</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                  <DialogFooter>
                    <Button
                      type="submit"
                      disabled={Boolean(actionLoadingId && editOrder && actionLoadingId === editOrder._id)}
                    >
                      {actionLoadingId && editOrder && actionLoadingId === editOrder._id ? (
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

            {/* Assign Delivery Partner Modal */}
            <Dialog open={assignModalOpen} onOpenChange={open => setAssignModalOpen(!!open)}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Assign Delivery Partner</DialogTitle>
                </DialogHeader>
                <form
                  onSubmit={e => {
                    e.preventDefault();
                    handleAssignModalSave();
                  }}
                  className="space-y-4"
                >
                  <div>
                    <Label htmlFor="deliveryBoyId" className="mb-2">
                      Delivery Partner
                    </Label>
                    <Select
                      value={assignModalData.deliveryBoyId}
                      onValueChange={handleAssignModalChange}
                    >
                      <SelectTrigger id="deliveryBoyId" className="w-full">
                        <SelectValue placeholder="Select Delivery Partner" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {deliveryPartners && deliveryPartners.length > 0 ? (
                          deliveryPartners.map((partner: User) => (
                            <SelectItem key={partner._id} value={partner._id!}>
                              {partner.name}{" "}
                              {partner.phone
                                ? `(${partner.phone})`
                                : partner.email
                                  ? `(${partner.email})`
                                  : ""}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="none" disabled>No delivery partners available</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <DialogFooter>
                    <Button
                      type="submit"
                      disabled={Boolean(actionLoadingId && assignOrder && actionLoadingId === assignOrder._id)}
                    >
                      {actionLoadingId && assignOrder && actionLoadingId === assignOrder._id ? (
                        <Loader className="animate-spin mr-2" size={18} />
                      ) : null}
                      Assign
                    </Button>
                    <DialogClose asChild>
                      <Button type="button" variant="outline" onClick={() => setAssignModalOpen(false)}>Cancel</Button>
                    </DialogClose>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            <div className="overflow-x-auto">
              <table className="w-full text-left mb-4 border-collapse">
                <thead>
                  <tr>
                    <th className="py-2 px-4 border-b">Order ID</th>
                    <th className="py-2 px-4 border-b">Date</th>
                    <th className="py-2 px-4 border-b">Products</th>
                    <th className="py-2 px-4 border-b">User</th>
                    <th className="py-2 px-4 border-b">Total Amount</th>
                    <th className="py-2 px-4 border-b">Delivery Address</th>
                    <th className="py-2 px-4 border-b">Payment Mode</th>
                    <th className="py-2 px-4 border-b">Status</th>
                    <th className="py-2 px-4 border-b">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders && orders.length > 0 ? (
                    orders.map((order: Order) => (
                      <tr key={order._id}>
                        <td className="py-2 px-4 text-xs">{order._id}</td>
                        <td className="py-2 px-4">
                          {order.createdAt
                            ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                            : "--"}
                        </td>
                        <td className="py-2 px-4">
                          {order.products && order.products.length > 0 ? (
                            <div className="space-y-1">
                              {order.products.map((product, idx) => (
                                <div key={idx} className="text-sm">
                                  {product.productName} - {product.quantity} ({product.quantityPacket} pkts)
                                </div>
                              ))}
                            </div>
                          ) : (
                            "--"
                          )}
                        </td>
                        <td className="py-2 px-4">{getUserName(order.user || "")}</td>
                        <td className="py-2 px-4">₹{order.totalAmount?.toFixed(2) || "0.00"}</td>
                        <td className="py-2 px-4 text-sm max-w-xs truncate">
                          {order.deliveryAddress || "--"}
                        </td>
                        <td className="py-2 px-4">
                          <span className="capitalize">{order.paymentMode || "--"}</span>
                          {order.paymentVerified && (
                            <span className="ml-1 text-green-600">✓</span>
                          )}
                        </td>
                        <td className="py-2 px-4">
                          <span className={`capitalize px-2 py-1 rounded text-xs ${order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                              order.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                                order.status === 'Accepted' ? 'bg-blue-100 text-blue-800' :
                                  'bg-gray-100 text-gray-800'
                            }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="py-2 px-4">
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => openEditModal(order)}>
                              Edit
                            </Button>
                            <Button size="sm" variant="default" onClick={() => openAssignModal(order)}>
                              Assign
                            </Button>
                            {/* <Button size="sm" variant="default" onClick={() => handleViewInvoice(order)}>
                              Invoice
                            </Button> */}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="text-center py-4 text-muted-foreground">
                        No orders found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;