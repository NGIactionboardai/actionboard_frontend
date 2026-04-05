"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Check, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { fetchSubscription } from "@/redux/billing/billingSlice";
import toast from "react-hot-toast";


export default function PricingPage() {
  const [plans, setPlans] = useState([]);
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(null);

  const router = useRouter();
  const dispatch = useDispatch();

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/billing/plans/`
      );
      setPlans(res.data);
    } catch (err) {
      console.error("Failed to fetch plans", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async (plan) => {
    try {
      setCheckoutLoading(plan.id);
  
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/billing/checkout/`,
        {
          plan_id: plan.id,
          billing_cycle: billingCycle,
        }
      );
  
      // ✅ FREE PLAN FLOW
      if (res.data.type === "free") {
        toast.success("Free plan activated");
  
        await dispatch(fetchSubscription());
  
        setTimeout(() => {
          window.location.href = "/organizations";
        }, 800);
  
        return;
      }
  
      // ✅ PAID PLAN FLOW
      if (res.data.type === "paid") {
        toast.loading("Redirecting to secure checkout...");
  
        window.location.href = res.data.checkout_url;
        return;
      }
  
    } catch (err) {
      console.error("Checkout failed", err);
  
      // 🔥 HANDLE BACKEND MESSAGE (your free cap error will show here)
      const message =
        err?.response?.data?.error ||
        "Something went wrong. Please try again.";
  
      toast.error(message);
  
    } finally {
      setCheckoutLoading(null);
    }
  };

  const formatPrice = (price) => {
    if (!price) return "Free";
    return `$ ${price / 100}`;
  };

  const getFeatureLabel = (feature) => {
    const labels = {
      org_creation: "Organization Creation",
      org_meetings: "Organization Meetings",
      member_management: "Member Management",
      org_calendar: "Organization Calendar",
      personal_calendar: "Personal Calendar",
      upload_transcribe: "Upload & Transcribe",
      ai_notetaker: "AI Notetaker",
      ai_assistant: "AI Assistant",
    };

    

    let label = labels[feature.feature_key] || feature.feature_key;

    if (feature.limit) {
      label += ` (${feature.limit})`;
    }

    return label;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-10 w-10 border-b-4 border-indigo-600 rounded-full"></div>
      </div>
    );
  }

  const sortedPlans = [...plans].sort((a, b) => a.id - b.id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Choose Your Plan
          </h1>
          <p className="text-gray-600">
            Upgrade to unlock powerful AI features
          </p>
        </div>

        {/* Toggle */}
        <div className="flex justify-center mb-10">
          <div className="bg-white border border-gray-200 rounded-xl p-1 flex">
            {["monthly", "yearly"].map((cycle) => (
              <button
                key={cycle}
                onClick={() => setBillingCycle(cycle)}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                  billingCycle === cycle
                    ? "bg-gradient-to-r from-[#0A0DC4] to-[#8B0782] text-white shadow"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {cycle === "monthly" ? "Monthly" : "Yearly"}
              </button>
            ))}
          </div>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {sortedPlans.map((plan) => {
            const pricing = plan.pricing[billingCycle];

            return (
              <div
                key={plan.id}
                className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 flex flex-col"
              >
                {/* Plan Name */}
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </h2>

                {/* Price */}
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">
                    {formatPrice(pricing.price)}
                  </span>
                  {pricing.price && (
                    <span className="text-gray-500 text-sm ml-2">
                      / {billingCycle}
                    </span>
                  )}
                </div>

                {/* Features */}
                <div className="flex-1 space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 text-sm"
                    >
                      {feature.enabled ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <X className="w-4 h-4 text-gray-400" />
                      )}
                      <span
                        className={
                          feature.enabled
                            ? "text-gray-700"
                            : "text-gray-400 line-through"
                        }
                      >
                        {getFeatureLabel(feature)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                {plan.name === "Free" || pricing.available ? (
                  <button
                    onClick={() => handleCheckout(plan)}
                    disabled={checkoutLoading === plan.id}
                    className="w-full cursor-pointer bg-gradient-to-r from-[#0A0DC4] to-[#8B0782] hover:from-[#080aa8] hover:to-[#6d0668] text-white font-medium py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    {checkoutLoading === plan.id
                      ? "Processing..."
                      : plan.name === "Free"
                      ? "Get Started"
                      : "Subscribe"}
                  </button>
                ) : (
                  <button
                    disabled
                    className="w-full bg-gray-200 text-gray-500 py-3 rounded-lg"
                  >
                    Not Available
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="text-center mt-10 text-sm text-gray-500">
          Need help? Contact support anytime.
        </div>
      </div>
    </div>
  );
}