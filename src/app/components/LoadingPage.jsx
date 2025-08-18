import React from 'react';
import Navbar from './layout/Navbar';
// import Navbar from './Navbar'; // Adjust path as needed

export default function LoadingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navbar with full auth logic */}
      <Navbar />

      {/* Main loading content */}
      <main className="flex-grow flex flex-col items-center justify-center px-4">
        <div className="relative w-32 h-32">
          {/* Spinner ring */}
          <svg
            className="absolute inset-0 w-32 h-32 animate-spin text-indigo-600"
            viewBox="0 0 66 66"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              className="opacity-25"
              cx="33"
              cy="33"
              r="30"
              stroke="currentColor"
              strokeWidth="6"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M33 3a30 30 0 0 1 0 60 30 30 0 0 1 0-60z"
            />
          </svg>

          {/* Logo */}
          <img
            src="/main-logo.png"
            alt="Nous Meeting Logo"
            className="relative w-24 h-24 rounded-full bg-white p-2 shadow-md mx-auto"
          />
        </div>

        <p className="mt-6 text-gray-700 font-semibold text-lg tracking-wide">
          Loading, please wait...
        </p>
      </main>
    </div>
  );
}
