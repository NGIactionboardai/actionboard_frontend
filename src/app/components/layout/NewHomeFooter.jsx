"use client";

import Link from "next/link";
import { Twitter, Linkedin, Github, Youtube, X, TwitterIcon, Facebook, LucideYoutube, Instagram } from "lucide-react";

export default function NewHomeFooter() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-6 py-12 md:py-16 grid grid-cols-1 md:grid-cols-5 gap-10">
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
            <li><Link href="/#features" className="hover:text-[#0A0DC4]">Features</Link></li>
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

        {/* Socials */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-4">Socials</h4>
          <ul className="space-y-3 text-gray-600 text-sm">
            <li>
              <Link
                href="https://www.linkedin.com/company/nous-meeting/"
                target="_blank"
                className="flex items-center gap-2 hover:text-[#0A0DC4]"
              >
                <Linkedin className="w-4 h-4" />
                LinkedIn
              </Link>
            </li>

            <li>
              <Link
                href="https://www.instagram.com/nous_meeting/"
                target="_blank"
                className="flex items-center gap-2 hover:text-[#0A0DC4]"
              >
                <Instagram className="w-4 h-4" />
                Instagram
              </Link>
            </li>

            <li>
              <Link
                href="https://www.facebook.com/profile.php?id=61582344688316#"
                target="_blank"
                className="flex items-center gap-2 hover:text-[#0A0DC4]"
              >
                <Facebook className="w-4 h-4" />
                Facebook
              </Link>
            </li>

            <li>
              <Link
                href="https://www.youtube.com/@NousMeeting-2025"
                target="_blank"
                className="flex items-center gap-2 hover:text-[#0A0DC4]"
              >
                <LucideYoutube className="w-4 h-4" />
                YouTube
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-200 mt-8">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row justify-between items-center text-sm text-gray-500">
          <p className="text-center sm:text-left">
            © {new Date().getFullYear()} Nous Meeting. All rights reserved.
            <br className="sm:hidden" />
            <span className="text-gray-400">
              {" "}A product of{" "}
              <Link
                href="https://nexgeninnovation.com/"
                target="_blank"
                className="font-medium text-gray-600 hover:text-[#0A0DC4]"
              >
                Next Generation Innovation L.L.C
              </Link>
            </span>
          </p>

        </div>
      </div>
    </footer>
  );
}
