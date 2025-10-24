import React from 'react';

export default function TermsPage() {
  return (
    <main className="max-w-2xl mx-auto py-16 px-4">
      <h1 className="text-3xl font-bold text-red-700 mb-6">Terms & Conditions</h1>
      <p className="mb-4 text-gray-700">Welcome to NLP Enterprises! By using our website or app, you agree to the following terms and conditions. Please read them carefully.</p>
      <h2 className="text-xl font-semibold mt-8 mb-2">Use of Service</h2>
      <ul className="list-disc list-inside mb-4 text-gray-700">
        <li>Our products and services are for personal and business use only.</li>
        <li>You agree to provide accurate information when placing orders or registering.</li>
        <li>Do not misuse our services or attempt unauthorized access.</li>
      </ul>
      <h2 className="text-xl font-semibold mt-8 mb-2">Orders & Payments</h2>
      <ul className="list-disc list-inside mb-4 text-gray-700">
        <li>All orders are subject to availability and confirmation.</li>
        <li>Prices and offers may change without notice.</li>
        <li>Payments must be made through approved methods only.</li>
      </ul>
      <h2 className="text-xl font-semibold mt-8 mb-2">Returns & Refunds</h2>
      <p className="mb-4 text-gray-700">Please refer to our return policy for details on returns, exchanges, and refunds.</p>
      <h2 className="text-xl font-semibold mt-8 mb-2">Limitation of Liability</h2>
      <p className="mb-4 text-gray-700">NLP Enterprises is not liable for any indirect or consequential damages arising from the use of our products or services.</p>
      <h2 className="text-xl font-semibold mt-8 mb-2">Contact Us</h2>
      <p className="mb-4 text-gray-700">For any questions, please contact us at <a href="mailto:gaurasorganicdairy@gmail.com" className="underline text-red-700">gaurasorganicdairy@gmail.com</a>.</p>
      <p className="text-xs text-gray-500 mt-8">Last updated: 24-10-2025</p>
    </main>
  );
}
