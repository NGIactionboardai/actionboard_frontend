"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useEffect } from "react"
import Link from "next/link"

export default function ThankYouPage() {

  const searchParams = useSearchParams()
  const router = useRouter()

  const name = searchParams.get("name")

  useEffect(() => {
    if (!name) {
      router.replace("/pre-register")
    }
  }, [name, router])

  if (!name) return null

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6">

      <div className="max-w-xl w-full bg-white shadow-xl rounded-2xl p-10 text-center border border-gray-100">

        {/* Icon */}
        <div className="w-16 h-16 mx-auto flex items-center justify-center rounded-full bg-gradient-to-r from-[#0A0DC4] to-[#8B0782] text-white text-2xl font-bold mb-6">
          ✓
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Thank You, {name}!
        </h1>

        <p className="text-gray-600 text-lg mb-6">
          Your pre-registration for <span className="font-semibold">Nous Meeting</span> has been successfully received.
        </p>

        <p className="text-gray-600 mb-8">
          Our team will review your request and notify you when early access becomes available.
        </p>

        <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 text-sm text-indigo-700">
          Keep an eye on your inbox — we’ll send you an update as soon as your access is approved.
        </div>

        <div className="mt-8">
          <Link
            href="/"
            className="inline-block px-6 py-3 rounded-lg text-white font-medium bg-gradient-to-r from-[#0A0DC4] to-[#8B0782] hover:opacity-90 transition"
          >
            Back to Homepage
          </Link>
        </div>

      </div>

    </div>
  )
}