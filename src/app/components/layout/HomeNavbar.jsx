"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export default function HomeNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

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
        scrolled ? "backdrop-blur-md bg-white/70 shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <img
              src="/nous_logo.png"
              alt="Nous Meeting Logo"
              className="h-14 sm:h-16 pt-1"
            />
          </Link>

          {/* Desktop Buttons */}
          <div className="hidden md:flex items-center space-x-4">
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

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 text-gray-700 hover:text-[#0A0DC4]"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Fullscreen Menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 bg-white/95 backdrop-blur-md flex flex-col transition-all duration-300">
          {/* Top Bar inside overlay */}
          <div className="flex justify-between items-center px-6 py-4">
            {/* Logo inside overlay */}
            <Link href="/" onClick={() => setMenuOpen(false)}>
              <img
                src="/nous_logo.png"
                alt="Nous Meeting Logo"
                className="h-12"
              />
            </Link>

            {/* Close Button */}
            <button
              onClick={() => setMenuOpen(false)}
              className="p-2 text-gray-600 hover:text-gray-900"
            >
              <X size={28} />
            </button>
          </div>

          {/* Nav Links */}
          <div className="flex flex-col items-center justify-center flex-1 space-y-6 text-lg font-semibold">
            <Link
              href="/auth/login"
              className="text-gray-700 hover:text-blue-600 transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              Sign In
            </Link>
            <Link
              href="/auth/register"
              className="px-6 py-3 rounded-lg text-white bg-gradient-to-r from-[#0A0DC4] to-[#8B0782] 
              hover:from-[#080aa8] hover:to-[#6d0668] shadow-lg transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              Sign Up
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
