"use client";

import Link from "next/link";
import { Twitter, Linkedin, Github, Youtube, X, TwitterIcon, Facebook, LucideYoutube } from "lucide-react";

export default function NewHomeFooter() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-6 py-12 md:py-16 grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Brand */}
        <div>
          <Link href="/" className="flex items-center space-x-2">
            <img
              src="/nous_logo.png"
              alt="Nous Meeting Logo"
              className="h-10"
            />
          </Link>
          <p className="text-gray-600 mt-4 text-sm">
            AI-powered transcription, summaries, and meeting insights that turn
            conversations into action.
          </p>
        </div>

        {/* Product */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-4">Product</h4>
          <ul className="space-y-3 text-gray-600 text-sm">
            <li><Link href="/features" className="hover:text-[#0A0DC4]">Features</Link></li>
            {/* <li><Link href="/pricing" className="hover:text-[#0A0DC4]">Pricing</Link></li> */}
            <li><Link href="/help" className="hover:text-[#0A0DC4]">Help Center</Link></li>
            <li><Link href="/help/#faq" className="hover:text-[#0A0DC4]">FAQ</Link></li>
          </ul>
        </div>

        {/* Company */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-4">Company</h4>
          <ul className="space-y-3 text-gray-600 text-sm">
            <li><Link href="/about" className="hover:text-[#0A0DC4]">About Us</Link></li>
            {/* <li><Link href="/blog" className="hover:text-[#0A0DC4]">Blog</Link></li>
            <li><Link href="/careers" className="hover:text-[#0A0DC4]">Careers</Link></li> */}
            <li><Link href="/contact" className="hover:text-[#0A0DC4]">Contact</Link></li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-4">Legal</h4>
          <ul className="space-y-3 text-gray-600 text-sm">
            <li><Link href="/privacy-policy" className="hover:text-[#0A0DC4]">Privacy Policy</Link></li>
            <li><Link href="/terms" className="hover:text-[#0A0DC4]">Terms of use</Link></li>
            {/* <li><Link href="/cookies" className="hover:text-[#0A0DC4]">Cookie Policy</Link></li> */}
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-200 mt-8">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row justify-between items-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Nous Meeting. All rights reserved.</p>

          {/* Social Icons */}
          <div className="flex space-x-6 mt-4 sm:mt-0 group">
            {/* X (formerly Twitter) */}
            <Link
              href="https://x.com/home"
              target="_blank"
              className="transition-opacity duration-300 group-hover:opacity-50 hover:!opacity-100 hover:text-[#0A0DC4]"
            >
              <TwitterIcon className="w-5 h-5" />
            </Link>

            {/* Facebook */}
            <Link
              href="https://www.facebook.com/profile.php?id=61582344688316"
              target="_blank"
              className="transition-opacity duration-300 group-hover:opacity-50 hover:!opacity-100 hover:text-[#0A0DC4]"
            >
              <Facebook className="w-5 h-5" />
            </Link>

            {/* GitHub — same as before */}
            {/* <Link
              href="https://github.com"
              target="_blank"
              className="transition-opacity duration-300 group-hover:opacity-50 hover:!opacity-100 hover:text-[#0A0DC4]"
            >
              <Github className="w-5 h-5" />
            </Link> */}

            {/* YouTube */}
            <Link
              href="https://www.youtube.com/@NousMeeting-2025"
              target="_blank"
              className="transition-opacity duration-300 group-hover:opacity-50 hover:!opacity-100 hover:text-[#0A0DC4]"
            >
              <LucideYoutube className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
