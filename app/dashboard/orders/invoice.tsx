'use client';

import React, { useState } from 'react';
import type { Order } from '@/lib/redux/orderSlice';
import { useSelector } from 'react-redux';
import { selectUser } from '@/lib/redux/authSlice';
import { convertToWords } from '@/lib/utils';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface InvoiceProps {
  order: Order;
  distributorName: string;
  productName: string;
}

const Invoice: React.FC<InvoiceProps> = ({ order, distributorName, productName }) => {
  const router = useRouter();
  const user = useSelector(selectUser);
  const [orderItems, setOrderItems] = useState(order.orders.map(item => ({
    ...item,
    manualPrice: item.price.toString()
  })));
  
  const currentDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: '2-digit'
  });

  // Handle price change
  const handlePriceChange = (index: number, value: string) => {
    const newItems = [...orderItems];
    newItems[index].manualPrice = value;
    setOrderItems(newItems);
  };

  // Calculate totals
  const calculateTotal = () => {
    let total = 0;
    orderItems.forEach(item => {
      const price = parseFloat(item.manualPrice) || item.price;
      total += price * item.quantity;
    });
    return total;
  };

  // Handle print with Next.js component
  const handlePrintWithNextJs = () => {
    // Store current order and user data in localStorage for the print page to access
    localStorage.setItem('currentOrder', JSON.stringify({
      ...order,
      orders: orderItems,
      distributorName
    }));
    
    // Navigate to the print page
    router.push('/dashboard/orders/print-invoice?autoPrint=true');
  };

  const totalAmount = calculateTotal();
  const amountInWords = convertToWords(totalAmount);
  
  return (
    <>
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 10mm;
          }
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
            background-color: white !important;
          }
          .print-container {
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background-color: white !important;
          }
          .invoice-table {
            width: 100% !important;
            border-collapse: collapse !important;
          }
          .invoice-table th, .invoice-table td {
            border: 1px solid #000 !important;
            padding: 8px !important;
            color: black !important;
          }
          .invoice-border {
            border: 1px solid #000 !important;
            background-color: white !important;
          }
          input {
            border: none !important;
            padding: 0 !important;
            background: transparent !important;
          }
          
          /* Fix layout for print */
          .header-grid {
            display: flex !important;
            justify-content: space-between !important;
            margin-bottom: 20px !important;
          }
          
          .grid-section {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 16px !important;
            margin-bottom: 20px !important;
          }
          
          /* Ensure colors print */
          .bg-gray-50 {
            background-color: #f9fafb !important;
          }
          
          .border-amber-200 {
            border-color: #fde68a !important;
          }
          
          /* Text styles */
          .text-center { text-align: center !important; }
          .text-right { text-align: right !important; }
          .text-left { text-align: left !important; }
          .font-bold { font-weight: bold !important; }
          .text-3xl { font-size: 1.875rem !important; }
          .text-2xl { font-size: 1.5rem !important; }
          
          /* Fix signature image */
          img {
            display: block !important;
            max-width: 150px !important;
          }
          
          /* Hide UI elements not needed for print */
          button, .no-print {
            display: none !important;
          }
        }
      `}</style>
      <div className="bg-white p-6 max-w-6xl mx-auto print-container">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">INVOICE</h1>
          <button 
            onClick={handlePrintWithNextJs}
            className="bg-blue-600 text-white px-4 py-2 rounded no-print"
          >
            Print Invoice
          </button>
        </div>
        
        <div className="flex justify-between mb-8 header-grid">
          <div>
            <div className="font-bold text-2xl">{user?.name || "NLP ENTERPRISES"}</div>
            <div>{user?.state || "Jharkhand"}</div>
            <div>Phone: {user?.phone || "1234567890"}</div>
            <div>E-Mail: {user?.email || "nlp.enterprises@gmail.com"}</div>
          </div>
          <div className="text-right">
            <div><span className="font-bold">Invoice No.</span> {order._id ? order._id.slice(-4) : 'feec'}</div>
            <div><span className="font-bold">Dated</span> {currentDate}</div>
            <div><span className="font-bold">Mode/Terms of Payment</span></div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-6 grid-section">
          <div className="border border-amber-200 p-4 invoice-border">
            <div className="font-bold mb-2">Consignee (Ship to)</div>
            <div>{distributorName}</div>
            <div>GROUND FLOOR BHATTACHAYA,</div>
            <div>UPPER BAZAR, RANCHI</div>
          </div>
          <div className="border border-amber-200 p-4 invoice-border">
            <div className="font-bold mb-2">Buyer (Bill to)</div>
            <div>{distributorName}</div>
            <div>GROUND FLOOR BHATTACHAYA,</div>
            <div>UPPER BAZAR, RANCHI</div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-6 grid-section">
          <div className="border border-amber-200 p-4 invoice-border">
            <div><span className="font-bold">Buyer&apos;s Order No.</span></div>
            <div><span className="font-bold">Dispatch Doc No.</span> {order._id ? order._id.slice(-4) : 'feec'}</div>
            <div><span className="font-bold">Dispatched through</span> TATA MAGIC</div>
          </div>
          <div className="border border-amber-200 p-4 invoice-border">
            <div><span className="font-bold">Dated</span></div>
            <div><span className="font-bold">Delivery Note Date</span></div>
            <div><span className="font-bold">Destination</span> RANCHI</div>
            <div><span className="font-bold">Terms of Delivery</span></div>
          </div>
        </div>
        
        <table className="w-full mb-6 invoice-table">
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
              const price = parseFloat(item.manualPrice) || item.price;
              const amount = price * item.quantity;
              
              return (
                <tr key={index}>
                  <td className="border border-amber-200 p-2 text-center">{index + 1}</td>
                  <td className="border border-amber-200 p-2">{item.name || productName}</td>
                  <td className="border border-amber-200 p-2 text-center">{item.quantity} Pcs</td>
                  <td className="border border-amber-200 p-2 text-right">
                    <input
                      type="text"
                      value={item.manualPrice}
                      onChange={(e) => handlePriceChange(index, e.target.value)}
                      className="w-20 text-right border-b border-gray-300 focus:outline-none"
                    />
                  </td>
                  <td className="border border-amber-200 p-2 text-right">{amount.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <td className="border border-amber-200 p-2 text-right font-bold" colSpan={4}>Total</td>
              <td className="border border-amber-200 p-2 text-right font-bold">₹ {totalAmount.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
        
        <div className="mb-6 border border-amber-200 p-4 invoice-border">
          <div className="font-bold">Amount Chargeable (in words)</div>
          <div className="italic">Indian Rupees {amountInWords} Only</div>
        </div>
        
        <div className="mt-10 text-right">
          <div>{user?.name || "NLP"}</div>
          {user?.signature && (
            <div className="mt-2 mb-2">
              <Image 
                src={user.signature} 
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

export default Invoice; 