"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchSubscription } from "@/redux/billing/billingSlice";
import { useRouter } from "next/navigation";
import { CheckCircle } from "lucide-react";

export default function BillingSuccessPage() {
  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() => {
    const handleSuccess = async () => {
      // wait for webhook (important)
      setTimeout(async () => {
        await dispatch(fetchSubscription());

        // redirect to main app
        router.replace("/organizations");
      }, 2000);
    };

    handleSuccess();
  }, [dispatch, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-10 text-center max-w-md w-full">

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Payment Successful 🎉
        </h1>

        {/* Subtitle */}
        <p className="text-gray-600 mb-6">
          Your subscription is now active. You’ll be redirected shortly.
        </p>

        {/* Loader */}
        <div className="flex justify-center">
          <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>

        {/* Manual fallback */}
        <button
          onClick={() => router.push("/organizations")}
          className="mt-6 w-full bg-gradient-to-r from-[#0A0DC4] to-[#8B0782] text-white py-2 rounded-lg hover:opacity-90 transition"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}