import React from 'react';

export default function PrivacyPolicyPage() {
  return (
    <main className="max-w-2xl mx-auto py-16 px-4">
      <h1 className="text-3xl font-bold text-red-700 mb-6">Privacy Policy</h1>
      <p className="mb-4 text-gray-700">Your privacy is important to us. This Privacy Policy explains how NLP Enterprises collects, uses, and protects your information when you use our website and mobile app.</p>
      <h2 className="text-xl font-semibold mt-8 mb-2">Information We Collect</h2>
      <ul className="list-disc list-inside mb-4 text-gray-700">
        <li>Personal information (name, phone, address) provided during registration or order placement.</li>
        <li>Order and delivery details.</li>
        <li>Usage data (app/website interactions, device info).</li>
      </ul>
      <h2 className="text-xl font-semibold mt-8 mb-2">How We Use Your Information</h2>
      <ul className="list-disc list-inside mb-4 text-gray-700">
        <li>To process orders and deliver products.</li>
        <li>To improve our services and user experience.</li>
        <li>To send important updates and offers (you can opt out anytime).</li>
      </ul>
      <h2 className="text-xl font-semibold mt-8 mb-2">Data Security</h2>
      <p className="mb-4 text-gray-700">We use industry-standard security measures to protect your data. Your information is never sold to third parties.</p>
      <h2 className="text-xl font-semibold mt-8 mb-2">Contact Us</h2>
      <p className="mb-4 text-gray-700">If you have any questions about this policy, please contact us at <a href="mailto:gaurasorganicdairy@gmail.com" className="underline text-red-700">gaurasorganicdairy@gmail.com</a>.</p>
      <p className="text-xs text-gray-500 mt-8">Last updated: 24-10-2025</p>
    </main>
  );
}
