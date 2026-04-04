"use client";

import { useRouter } from "next/navigation";
import { XCircle } from "lucide-react";

export default function BillingCancelPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-10 text-center max-w-md w-full">

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Payment Cancelled
        </h1>

        {/* Subtitle */}
        <p className="text-gray-600 mb-6">
          No worries — you can upgrade anytime to unlock premium features.
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => router.push("/pricing")}
            className="w-full bg-gradient-to-r from-[#0A0DC4] to-[#8B0782] text-white py-2 rounded-lg hover:opacity-90 transition"
          >
            View Plans
          </button>

          <button
            onClick={() => router.push("/organizations")}
            className="w-full border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}