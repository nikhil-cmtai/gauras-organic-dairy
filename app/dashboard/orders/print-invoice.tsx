'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { updateOrder } from '@/lib/redux/orderSlice';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '@/lib/store';

// Helper function to convert number to words (simplified version)
function convertToWords(num: number) {
  const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  if (num === 0) return 'Zero';
  
  function convertLessThanThousand(n: number) {
    if (n === 0) return '';
    
    let result = '';
    
    if (n >= 100) {
      result += units[Math.floor(n / 100)] + ' Hundred ';
      n %= 100;
      if (n !== 0) result += 'and ';
    }
    
    if (n >= 20) {
      result += tens[Math.floor(n / 10)] + ' ';
      n %= 10;
    }
    
    if (n >= 10 && n < 20) {
      result += teens[n - 10] + ' ';
      n = 0;
    }
    
    if (n > 0) {
      result += units[n] + ' ';
    }
    
    return result;
  }
  
  let result = '';
  let n = Math.floor(num);
  
  if (n >= 100000) {
    result += convertLessThanThousand(Math.floor(n / 100000)) + 'Lakh ';
    n %= 100000;
  }
  
  if (n >= 1000) {
    result += convertLessThanThousand(Math.floor(n / 1000)) + 'Thousand ';
    n %= 1000;
  }
  
  result += convertLessThanThousand(n);
  
  return result.trim();
}

function formatDate(dateString: string) {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return ''; // Invalid date
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: '2-digit'
  }).replace(',', '');
}

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  manualPrice?: string;
  manualQuantity?: string;
}

interface Order {
  _id?: string;
  orders: OrderItem[];
  distributorName?: string;
  distributorId?: string;  // Added this field
  productName?: string;
  shippingAddress?: string;
  billingAddress?: string;
  dispatchDate?: string;
  invoiceNo?: string;
  amount?: number;
  discount?: number;
  discountLabel?: string;
  finalAmount?: number;
  amountInWords?: string;
  interstate?: boolean;
  igst?: number;
  cgst?: number;
  sgst?: number;
  roundOff?: number;
}

interface User {
  name?: string;
  state?: string;
  phone?: string;
  email?: string;
  signature?: string;
  gstNumber?: string;
  bankAccountNumber?: string;
  bankIfsc?: string;
  bankAddress?: string;
  bankName?: string;
  accountHolderName?: string;
}

const PrintInvoice = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [isLoading, setIsLoading] = useState(true);
  const [orderData, setOrderData] = useState<Order | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [discount, setDiscount] = useState("");
  const [discountLabel, setDiscountLabel] = useState("Discount");
  const [isInterstate, setIsInterstate] = useState(false);
  const [invoiceNo, setInvoiceNo] = useState("");
  const [dispatchDate, setDispatchDate] = useState("");
  const [orderDate, setOrderDate] = useState("");
  // GST fields
  const [cgst, setCgst] = useState("");
  const [sgst, setSgst] = useState("");
  const [igst, setIgst] = useState("");
  
  useEffect(() => {
    // Get data from localStorage
    try {
      const storedOrder = localStorage.getItem('currentOrder');
      const storedUser = localStorage.getItem('user');
      
      if (storedOrder) {
        const parsedOrder = JSON.parse(storedOrder);
        
        // Initialize all form values first
        setInvoiceNo(parsedOrder.invoiceNo || '');
        setDispatchDate(formatDate(parsedOrder.dispatchDate) || '');
        setDiscount(parsedOrder.discount?.toString() || '');
        setDiscountLabel(parsedOrder.discountLabel || 'Discount');
        setIsInterstate(parsedOrder.interstate || false);
        setCgst(parsedOrder.cgst?.toString() || '');
        setSgst(parsedOrder.sgst?.toString() || '');
        setIgst(parsedOrder.igst?.toString() || '');
        
        // Format current date if no order date exists
        setOrderDate(parsedOrder.orderDate ? formatDate(parsedOrder.orderDate) : formatDate(new Date().toISOString()));
        
        // Initialize order items
        if (parsedOrder.orders && parsedOrder.orders.length > 0) {
          setOrderItems(parsedOrder.orders.map((item: OrderItem) => ({
            ...item,
            manualPrice: item.price?.toString() || '0',
            manualQuantity: item.quantity?.toString() || '0'
          })));
        }
        
        // Set order data
        setOrderData(parsedOrder);
        
        if (storedUser) {
          setUserData(JSON.parse(storedUser));
        }
        
        // Mark loading as complete after all state is set
        setIsLoading(false);
      } else {
        // If no order data, go back to orders page
        alert('No invoice data found. Returning to orders page.');
        router.push('/dashboard/orders');
        return;
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setIsLoading(false);
    }
  }, [router]);

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }
  
  // Handle price change
  const handlePriceChange = (index: number, value: string) => {
    const newItems = [...orderItems];
    newItems[index].manualPrice = value;
    setOrderItems(newItems);
  };

  // Handle quantity change
  const handleQuantityChange = (index: number, value: string) => {
    const newItems = [...orderItems];
    newItems[index].manualQuantity = value;
    setOrderItems(newItems);
  };
  
  // Handle going back to orders page
  const handleBack = () => {
    router.push('/dashboard/orders');
  };
  
  // Handle print with updated prices
  const handlePrint = () => {
    if (orderData) {
      // Calculate final values
      const updatedOrders = orderItems.map(item => ({
        ...item,
        price: parseFloat(item.manualPrice || '') || item.price,
        quantity: parseFloat(item.manualQuantity || '') || item.quantity
      }));

      // Determine if the value should be saved as discount or roundOff
      const isRoundOff = discountLabel.toLowerCase().includes('round') || discountLabel.toLowerCase().includes('roundoff');
      
      // Only save essential data
      const {...orderDataWithoutId } = orderData;
      const essentialOrderData = {
        ...orderDataWithoutId,
        orders: updatedOrders.map(order => ({
          ...order,
          price: parseFloat(order.manualPrice || '') || order.price,
          quantity: parseFloat(order.manualQuantity || '') || order.quantity,
        })),
        invoiceNo,
        // Convert date format back to ISO for storage
        dispatchDate: dispatchDate ? new Date(dispatchDate.split(' ').join(' ')).toISOString() : undefined,
        orderDate: orderDate ? new Date(orderDate.split(' ').join(' ')).toISOString() : undefined,
        amount: subtotal,
        // Only include either discount or roundOff
        ...(isRoundOff 
          ? { roundOff: discountValue }
          : { discount: discountValue, discountLabel }
        ),
        finalAmount,
        amountInWords,
        interstate: isInterstate,
        // Save just the GST percentage rates
        igst: isInterstate ? igstValue : undefined,
        cgst: !isInterstate ? cgstValue : undefined,
        sgst: !isInterstate ? sgstValue : undefined,
        // Preserve shipping and billing addresses
        shippingAddress: orderDataWithoutId.shippingAddress,
        billingAddress: orderDataWithoutId.billingAddress,
        distributorName: orderDataWithoutId.distributorName,
        distributorId: orderDataWithoutId.distributorId
      };

      dispatch(updateOrder(orderData._id || '', essentialOrderData));
            
      // Trigger print
      setTimeout(() => {
        window.print();
      }, 100);
    }
  };
  
  // Calculate totals
  const calculateTotal = () => {
    let total = 0;
    orderItems.forEach(item => {
      const price = parseFloat(item.manualPrice || '') || item.price;
      const quantity = parseFloat(item.manualQuantity || '') || item.quantity;
      total += price * quantity;
    });
    return total;
  };
  
  const subtotal = calculateTotal();
  const cgstValue = parseFloat(cgst) || 0;
  const sgstValue = parseFloat(sgst) || 0;
  const igstValue = parseFloat(igst) || 0;
  
  // Calculate GST amounts based on which type is being used
  const isIgst = igstValue > 0;
  const cgstAmount = isIgst ? 0 : subtotal * (cgstValue / 100);
  const sgstAmount = isIgst ? 0 : subtotal * (sgstValue / 100);
  const igstAmount = isIgst ? subtotal * (igstValue / 100) : 0;
  const totalGst = cgstAmount + sgstAmount + igstAmount;
  
  const discountValue = parseFloat(discount) || 0;
  const finalAmount = Math.max(0, subtotal + totalGst - discountValue);
  const amountInWords = convertToWords(finalAmount);
  
  return (
    <>
      <style jsx global>{`
        @page {
          size: A4;
          margin: 8mm;  /* Reduced margin */
        }
        
        body {
          font-family: Arial, sans-serif;
          font-size: 12px;  /* Reduced font size */
          line-height: 1.3;  /* Reduced line height */
          color: #000;
          background-color: white;
          padding: 0;
          margin: 0;
        }
        
        @media print {
          /* Hide header and other UI elements */
          header, nav, #__next > header, #__next > nav {
            display: none !important;
          }
          
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          
          .print-container {
            width: 100% !important;
            padding: 5mm !important;  /* Reduced padding */
            margin: 0 !important;
            max-width: none !important;
          }
          
          .no-print {
            display: none !important;
          }
          
          /* Compress table cells */
          table td, table th {
            padding: 4px !important;  /* Reduced padding */
          }
          
          /* Reduce spacing between sections */
          .mb-6 {
            margin-bottom: 0.75rem !important;
          }
          
          .mb-8 {
            margin-bottom: 1rem !important;
          }
          
          .mb-4 {
            margin-bottom: 0.5rem !important;
          }
          
          .p-4 {
            padding: 0.5rem !important;
          }
          
          .p-8 {
            padding: 1rem !important;
          }
          
          /* Ensure colors print */
          .bg-gray-50 {
            background-color: #f9fafb !important;
          }
          
          .border-amber-200 {
            border-color: #fde68a !important;
          }
          
          /* Hide input borders when printing */
          input {
            border: none !important;
            background: transparent !important;
            -webkit-appearance: none !important;
            appearance: none !important;
          }
          
          /* Adjust font sizes for print */
          .text-3xl {
            font-size: 1.5rem !important;
          }
          
          .text-2xl {
            font-size: 1.25rem !important;
          }
          
          .text-xl {
            font-size: 1.1rem !important;
          }
          
          /* Compress bank details and amount in words sections */
          .border.border-amber-200.mb-2,
          .border.border-amber-200.p-2.mb-6,
          .mb-6.border.border-amber-200.p-4 {
            margin-bottom: 0.5rem !important;
            padding: 0.25rem !important;
          }
          
          /* Adjust signature area spacing */
          .mt-10 {
            margin-top: 1rem !important;
          }
          
          /* Make table more compact */
          .table {
            font-size: 11px !important;
          }
          
          /* Ensure page breaks don't occur within critical elements */
          tr, .border {
            page-break-inside: avoid;
          }
        }
        
        /* Style for price input */
        .price-input, .quantity-input {
          width: 80px;
          text-align: right;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
          padding: 2px 6px;
        }
        
        .price-input:focus, .quantity-input:focus {
          outline: 2px solid #3b82f6;
          border-color: transparent;
        }
      `}</style>
      
      <div className="print-container bg-white max-w-4xl mx-auto p-8">
        <div className="flex justify-between mb-4 no-print">
          <button 
            onClick={handleBack} 
            className="bg-gray-500 text-white px-4 py-2 rounded"
          >
            Back to Orders
          </button>
          <button 
            onClick={handlePrint} 
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Print Invoice
          </button>
        </div>
        
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold">INVOICE</h1>
          <div className="mt-2 flex items-center justify-center gap-2 no-print">
            <input
              type="checkbox"
              id="interstate"
              checked={isInterstate}
              onChange={(e) => {
                setIsInterstate(e.target.checked);
                // Clear GST values when switching
                if (e.target.checked) {
                  setCgst("");
                  setSgst("");
                } else {
                  setIgst("");
                }
              }}
              className="form-checkbox h-4 w-4"
            />
            <label htmlFor="interstate">Interstate Invoice (IGST)</label>
          </div>
        </div>
        
        <div className="flex justify-between mb-8">
          <div>
            <div className="font-bold text-2xl">{userData?.name || "Gauras Organic Dairy"}</div>
            <div>{userData?.state || "Jharkhand"}</div>
            <div>Phone: {userData?.phone || "1234567890"}</div>
            <div>E-Mail: {userData?.email || "gaurasorganicdairy@gmail.com"}</div>
            <div><span className="font-bold">GST No:</span> {userData?.gstNumber || "20AABCU9603R1Z2"}</div>
          </div>
          <div className="text-right">
            <div>
              <span className="font-bold">Invoice No.</span>{" "}
              <input
                type="text"
                value={invoiceNo}
                onChange={e => setInvoiceNo(e.target.value)}
                className="w-24 text-right focus:outline-none border-b border-gray-300"
                placeholder="XXXX"
              />
            </div>
            <div>
              <span className="font-bold">Order Date</span>{" "}
              <span className="w-24 text-right inline-block">{orderDate}</span>
            </div>
            <div>
              <span className="font-bold">Dispatch Date</span>{" "}
              <input
                type="text"
                value={dispatchDate}
                onChange={e => setDispatchDate(e.target.value)}
                className="w-24 text-right focus:outline-none border-b border-gray-300"
                placeholder="DD MMM YY"
              />
            </div>
            <div><span className="font-bold">Mode/Terms of Payment</span></div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="border border-amber-200 p-4">
            <div className="font-bold mb-2">Consignee (Ship to)</div>
            <div>{orderData?.distributorName || "DISTRIBUTOR NAME"}</div>
            <div>{orderData?.shippingAddress || "UPPER BAZAR, RANCHI"}</div>
          </div>
          <div className="border border-amber-200 p-4">
            <div className="font-bold mb-2">Buyer (Bill to)</div>
            <div>{orderData?.distributorName || "DISTRIBUTOR NAME"}</div>
            <div>{orderData?.billingAddress || "UPPER BAZAR, RANCHI"}</div>
          </div>
        </div>
        
        <table className="w-full mb-6 border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-amber-200 p-2 text-left">SI No.</th>
              <th className="border border-amber-200 p-2 text-left">Description of Goods</th>
              <th className="border border-amber-200 p-2 text-center">Quantity</th>
              <th className="border border-amber-200 p-2 text-right">Rate</th>
              <th className="border border-amber-200 p-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {orderItems.map((item, index) => {
              const price = parseFloat(item.manualPrice || '') || item.price;
              const quantity = parseFloat(item.manualQuantity || '') || item.quantity;
              const amount = price * quantity;
              
              return (
                <tr key={index}>
                  <td className="border border-amber-200 p-2 text-center">{index + 1}</td>
                  <td className="border border-amber-200 p-2">{item.name || orderData?.productName || "Product"}</td>
                  <td className="border border-amber-200 p-2 text-center">
                    <input
                      type="text"
                      value={item.manualQuantity}
                      onChange={(e) => handleQuantityChange(index, e.target.value)}
                      className="quantity-input"
                    /> Pcs
                  </td>
                  <td className="border border-amber-200 p-2 text-right">
                    <input
                      type="text"
                      value={item.manualPrice}
                      onChange={(e) => handlePriceChange(index, e.target.value)}
                      className="price-input"
                    />
                  </td>
                  <td className="border border-amber-200 p-2 text-right">{amount.toFixed(2)}</td>
                </tr>
              );
            })}
            {(!orderItems || orderItems.length === 0) && (
              <tr>
                <td className="border border-amber-200 p-2 text-center">1</td>
                <td className="border border-amber-200 p-2">{orderData?.productName || "Product"}</td>
                <td className="border border-amber-200 p-2 text-center">
                  <input
                    type="text"
                    value="1"
                    className="quantity-input"
                    readOnly
                  /> Pcs
                </td>
                <td className="border border-amber-200 p-2 text-right">
                  <input
                    type="text"
                    value="0.00"
                    className="price-input"
                    readOnly
                  />
                </td>
                <td className="border border-amber-200 p-2 text-right">0.00</td>
              </tr>
            )}
          </tbody>
          <tfoot>
            {/* GST rows as per new format */}
            {!isInterstate && (
              <>
                <tr>
                  <td className="border border-amber-200 p-2 text-center"></td>
                  <td className="border border-amber-200 p-2 font-bold">CGST</td>
                  <td className="border border-amber-200 p-2 text-center"></td>
                  <td className="border border-amber-200 p-2 text-right">
                    <input
                      type="text"
                      value={cgst}
                      onChange={e => setCgst(e.target.value)}
                      className="w-16 text-right border-b border-gray-300 focus:outline-none"
                      placeholder="%"
                    /> %
                  </td>
                  <td className="border border-amber-200 p-2 text-right">₹ {cgstAmount.toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="border border-amber-200 p-2 text-center"></td>
                  <td className="border border-amber-200 p-2 font-bold">SGST</td>
                  <td className="border border-amber-200 p-2 text-center"></td>
                  <td className="border border-amber-200 p-2 text-right">
                    <input
                      type="text"
                      value={sgst}
                      onChange={e => setSgst(e.target.value)}
                      className="w-16 text-right border-b border-gray-300 focus:outline-none"
                      placeholder="%"
                    /> %
                  </td>
                  <td className="border border-amber-200 p-2 text-right">₹ {sgstAmount.toFixed(2)}</td>
                </tr>
              </>
            )}
            {isInterstate && (
              <tr>
                <td className="border border-amber-200 p-2 text-center"></td>
                <td className="border border-amber-200 p-2 font-bold">IGST</td>
                <td className="border border-amber-200 p-2 text-center"></td>
                <td className="border border-amber-200 p-2 text-right">
                  <input
                    type="text"
                    value={igst}
                    onChange={e => setIgst(e.target.value)}
                    className="w-16 text-right border-b border-gray-300 focus:outline-none"
                    placeholder="%"
                  /> %
                </td>
                <td className="border border-amber-200 p-2 text-right">₹ {igstAmount.toFixed(2)}</td>
              </tr>
            )}
            <tr>
              <td className="border border-amber-200 p-2 text-right font-bold" colSpan={4}>
                <input
                  type="text"
                  value={discountLabel}
                  onChange={e => setDiscountLabel(e.target.value)}
                  className="w-24 text-right font-bold focus:outline-none"
                  placeholder="Discount"
                />
              </td>
              <td className="border border-amber-200 p-2 text-right font-bold">
                <input
                  type="text"
                  value={discount}
                  onChange={e => setDiscount(e.target.value)}
                  className="w-20 text-right border-b border-gray-300 focus:outline-none"
                  placeholder="0"
                />
              </td>
            </tr>
            <tr>
              <td className="border border-amber-200 p-2 text-right font-bold" colSpan={4}>Total</td>
              <td className="border border-amber-200 p-2 text-right font-bold">₹ {finalAmount.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
        {/* Bank Account Details Section */}
        <div className="border border-amber-200 mb-2">
          <div className="font-bold bg-gray-100 border-b border-amber-200 p-2">Bank Account Details</div>
          <div className="p-2">
            <div><span className="font-semibold">Beneficiary Name :</span> {userData?.accountHolderName || userData?.name || 'Gauras Organic Dairy'}</div>
            <div><span className="font-semibold">Account Number :</span> {userData?.bankAccountNumber || 'XXXXXXXXXXXX'}</div>
            <div><span className="font-semibold">IFSC CODE :</span> {userData?.bankIfsc || 'ICIC0000433'}</div>
            <div><span className="font-semibold">Bank :</span> {userData?.bankName || 'ICICI'}{userData?.bankAddress ? `, Branch : ${userData.bankAddress}` : ''}</div>
          </div>
        </div>
        {/* Tax Amount in Words Row */}
        <div className="border border-amber-200 p-2 mb-6 flex items-center">
          <span className="font-semibold mr-2">Tax Amount(In Word) :-</span>
          <span className="uppercase tracking-wider">{amountInWords} RUPEES ONLY</span>
        </div>
        
        <div className="mb-6 border border-amber-200 p-4">
          <div className="font-bold">Amount Chargeable (in words)</div>
          <div className="italic">Indian Rupees {amountInWords} Only</div>
        </div>
        
        <div className="mt-10 text-right">
          <div>{userData?.name || "Gauras Organic Dairy"}</div>
          {userData?.signature && (
            <div className="mt-2 mb-2">
              <Image 
                src={userData.signature} 
                width={150}
                height={100}
                alt="Authorised Signature" 
                className="h-24 ml-auto object-contain"
              />
            </div>
          )}
          <div>Authorised Signatory</div>
        </div>
        
        <div className="text-center text-xs mt-10">
          This is a Computer Generated Invoice
        </div>
      </div>
    </>
  );
};

export default PrintInvoice; 