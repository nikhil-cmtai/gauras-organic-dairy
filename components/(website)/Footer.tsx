"use client"
import React from 'react';
import Link from 'next/link';

const Footer: React.FC = () => {

  return (
    <footer className="w-full bg-gradient-to-br from-pink-100/10 to-sea-green-100/40 text-gray-800">
      <div className="container mx-auto px-6 py-8">
        <div className="pt-8 border-t border-gray-500 flex flex-col sm:flex-row justify-between items-center text-sm text-gray-500">
          <p className="mb-4 sm:mb-0 font-medium text-gray-700 text-left w-full sm:w-auto">
            © 2025 Gauras Organic Dairy | All Rights Reserved
          </p>
          <div className="flex gap-6 w-full sm:w-auto justify-end">
            <Link href="/privacy-policy" className="hover:text-black transition-colors font-medium text-gray-700">
              Privacy Policy
            </Link>
            |
            <Link href="/terms" className="hover:text-black transition-colors font-medium text-gray-700">
              Terms & Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;