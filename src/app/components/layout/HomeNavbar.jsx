"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import {
  selectIsAuthenticated,
  selectUser,
  selectAuthLoading,
  userLogout,
} from "@/redux/auth/authSlices";
import { HelpCircle } from "lucide-react";

export default function HomeNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);
  const authLoading = useSelector(selectAuthLoading);
  const dispatch = useDispatch();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [menuOpen]);

  const handleSignOut = async () => {
    try {
      await dispatch(userLogout()).unwrap();
      window.location.href = "/";
    } catch (err) {
      console.error("Logout failed:", err);
      window.location.href = "/";
    }
  };

  const getUserDisplayName = () => {
    if (!user) return "User";
    if (user.first_name && user.last_name) return `${user.first_name} ${user.last_name}`;
    if (user.name) return user.name;
    if (user.email) return user.email;
    return "User";
  };

  const getUserInitials = () => {
    const name = getUserDisplayName();
    const words = name.split(" ");
    return words.length >= 2
      ? `${words[0][0]}${words[1][0]}`.toUpperCase()
      : name.substring(0, 2).toUpperCase();
  };

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

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            {isAuthenticated ? (
              <>
                <Link
                  href="/organizations"
                  className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                >
                  Organizations
                </Link>

                {/* Profile dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600"
                  >
                    <div className="h-8 w-8 rounded-full bg-gradient-to-r from-[#0A0DC4] to-[#8B0782] flex items-center justify-center text-white text-sm font-bold">
                      {getUserInitials()}
                    </div>
                    <span>{getUserDisplayName()}</span>
                    <svg
                      className={`h-4 w-4 text-gray-500 transition-transform ${
                        dropdownOpen ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black/10">
                      <div className="py-1">
                        <Link
                          href="/auth/profile"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setDropdownOpen(false)}
                        >
                          Profile
                        </Link>
                        <Link
                          href="/help"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <HelpCircle className="mr-2 h-4 w-4 text-gray-500" /> Help
                        </Link>
                        <Link
                          href="/configure-meeting-tools"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setDropdownOpen(false)}
                        >
                          Configure Meeting Platforms
                        </Link>
                        <div className="border-t border-gray-100"></div>
                        <button
                          onClick={handleSignOut}
                          disabled={authLoading}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                        >
                          {authLoading ? "Signing Out..." : "Logout"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
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

                <Link
                  href="/help"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors rounded-md"
                  onClick={() => setDropdownOpen(false)}
                >
                  <HelpCircle className="mr-2 h-4 w-4 text-gray-500" /> Help
                </Link>
              </>
            )}
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
          <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
            {/* Logo */}
            <Link href="/" onClick={() => setMenuOpen(false)}>
              <img src="/nous_logo.png" alt="Nous Meeting Logo" className="h-12" />
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
            {isAuthenticated ? (
              <>
                {/* User Info Section */}
                <div className="flex flex-row items-center gap-2 space-y-2 mb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#0A0DC4] to-[#8B0782] flex items-center justify-center text-white font-bold text-xl shadow-md">
                    {getUserInitials()}
                  </div>
                  <p className="text-gray-800 font-semibold text-lg">
                    {getUserDisplayName()}
                  </p>
                </div>

                {/* Links */}
                <Link
                  href="/organizations"
                  className="text-gray-700 hover:text-blue-600 transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  Organizations
                </Link>
                <Link
                  href="/auth/profile"
                  className="text-gray-700 hover:text-blue-600 transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  Profile
                </Link>
                <Link
                  href="/help"
                  className="text-gray-700 hover:text-blue-600 transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  Help
                </Link>
                <Link
                  href="/configure-meeting-tools"
                  className="text-gray-700 hover:text-blue-600 transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  Configure
                </Link>
                <button
                  onClick={() => {
                    handleSignOut();
                    setMenuOpen(false);
                  }}
                  disabled={authLoading}
                  className="px-4 py-2 rounded-md bg-gradient-to-r from-[#0A0DC4] to-[#8B0782] text-white font-medium shadow-md hover:from-[#080aa8] hover:to-[#6d0668] disabled:opacity-50 transition-all"
                >
                  {authLoading ? "Signing Out..." : "Logout"}
                </button>
              </>
            ) : (
              <>
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

                <Link
                  href="/help"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors rounded-md"
                  onClick={() => setMenuOpen(false)}
                >
                  <HelpCircle className="mr-2 h-4 w-4 text-gray-500" /> Help
                </Link>
              </>
            )}
          </div>
        </div>
      )}

    </nav>
  );
}
