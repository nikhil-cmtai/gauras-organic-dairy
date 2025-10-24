"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const Header = () => {
  return (
    <header className="w-full bg-white py-3">
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between px-4">
        <Link href="/" className="text-xl font-bold text-purple-700">
        <Image src="/logo.jpeg" alt="NLP Logo" width={200} height={200} />
        </Link>
        <nav className="flex gap-6 mt-2 sm:mt-0">
          <Link href="/" className="text-gray-700 hover:text-purple-700 font-medium transition-colors">Home</Link>
          <Link href="#aboutus" className="text-gray-700 hover:text-purple-700 font-medium transition-colors">About</Link>
          <Link href="#download" className="text-gray-700 hover:text-purple-700 font-medium transition-colors">Download App</Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
