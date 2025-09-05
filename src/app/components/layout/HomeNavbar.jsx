"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function HomeNavbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? "backdrop-blur-md bg-white/70 shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="w-full px-4 sm:px-6 lg:px-8">
      {/* <div className="mx-auto w-full px-6 py-4"> */}
        <div className="flex justify-between h-20 ">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <img
              src="/nous_logo.png"
              alt="Nous Meeting Logo"
              className="h-16 pt-1" // slightly bigger + padded from top
            />
          </Link>

          {/* Auth buttons */}
          <div className="flex items-center space-x-4">
            <Link
              href="/auth/login"
              className="px-4 py-2 text-sm font-bold text-gray-700 hover:text-blue-600 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/auth/register"
              className="px-4 py-2 rounded-lg text-sm font-bold text-white 
              bg-gradient-to-r from-[#0A0DC4] to-[#8B0782] 
              hover:from-[#080aa8] hover:to-[#6d0668] shadow-lg transition-colors"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
