// src/app/(dashboard)/billing/upgrade/page.jsx
"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { fetchSubscription } from "@/redux/billing/billingSlice";
import { ArrowLeft, Crown, Check, X } from "lucide-react";

const formatDate = (dateStr) => {
  if (!dateStr) return null;

  const date = new Date(dateStr);

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};


export default function UpgradePage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const billing = useSelector((state) => state.billing);

  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(null);
  const [billingCycle, setBillingCycle] = useState("monthly");

  const sub = billing.subscription;

  const isExpired = sub?.is_expired;
  const isCanceled = sub && !["active", "trialing"].includes(sub.status);
  const expiryDate = formatDate(sub?.current_period_end);

  const isActive = ["active", "trialing"].includes(sub?.status);

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    fetchPlans();
  }, []);

  

  const fetchPlans = async () => {
    try {
      const res = await axios.get(`${API_BASE}/billing/plans/`);
      setPlans(res.data);
    } catch (err) {
      console.error("Failed to fetch plans");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async (plan) => {
    try {
      setCheckoutLoading(plan.id);

      const res = await axios.post(
        `${API_BASE}/billing/checkout/`,
        {
          plan_id: plan.id,
          billing_cycle: billingCycle,
        }
      );

      if (res.data.type === "free") {
        await dispatch(fetchSubscription());
        router.push("/organizations");
        return;
      }

      if (res.data.type === "paid") {
        window.location.href = res.data.checkout_url;
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCheckoutLoading(null);
    }
  };

  const handleCustomerPortal = async () => {
    try {
      const res = await axios.get(`${API_BASE}/billing/customer-portal/`);
      window.location.href = res.data.url;
    } catch (err) {
      console.error("Failed to open portal");
    }
  };

  const currentPlanId = billing.subscription?.plan?.plan_id;

  const sortedPlans = [...plans].sort((a, b) => a.id - b.id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-10 px-4">

      {/* CENTER WRAPPER */}
      <div className="max-w-5xl mx-auto">

        {/* 🔙 Back */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6 text-sm font-medium"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        {/* HEADER (CENTERED) */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900">
            Upgrade Your Plan
          </h1>
          <p className="text-gray-600 mt-2">
            Unlock powerful features and scale your productivity
          </p>
        </div>

        {(isExpired || isCanceled) && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm text-center">
            {isExpired
              ? "Your free plan has expired. Upgrade to continue using the platform."
              : "Your subscription is inactive. Please upgrade or renew to continue."}
          </div>
        )}

        {sub?.current_period_end && (
          <div className="mb-6 p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-sm text-center">
            {isExpired ? (
              <>
                Your plan expired on <span className="font-semibold">{expiryDate}</span>.
              </>
            ) : isActive ? (
              <>
                Your current plan will expire on{" "}
                <span className="font-semibold">{expiryDate}</span>.
              </>
            ) : null}
          </div>
        )}

        {/* TOGGLE (CENTERED) */}
        <div className="flex justify-center mb-10">
          <div className="flex bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-4 py-2 rounded-lg text-sm ${
                billingCycle === "monthly"
                  ? "bg-[#0A0DC4] text-white"
                  : "text-gray-600"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`px-4 py-2 rounded-lg text-sm ${
                billingCycle === "yearly"
                  ? "bg-[#8B0782] text-white"
                  : "text-gray-600"
              }`}
            >
              Yearly
            </button>
          </div>
        </div>

        {/* PLANS */}
        {loading ? (
          <p className="text-center">Loading...</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">

            {sortedPlans.map((plan) => {
              const pricing = plan.pricing[billingCycle];
              const isCurrent = plan.id === currentPlanId;
              const isUpgrade = plan.id > currentPlanId;
              const isDowngrade = plan.id < currentPlanId;

              return (
                <div
                  key={plan.id}
                  className={`relative p-6 rounded-2xl border transition-all
                    ${isCurrent
                      ? "border-purple-500 shadow-lg bg-white"
                      : "border-gray-200 bg-white"}
                  `}
                >

                  {/* CURRENT BADGE */}
                  {isCurrent && (
                    <div className="absolute top-3 right-3 flex items-center gap-1 text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                      <Crown className="w-3 h-3" />
                      Current
                    </div>
                  )}

                  {/* PLAN NAME */}
                  <h2 className="text-xl font-semibold text-gray-900">
                    {plan.name}
                  </h2>

                  {/* PRICE */}
                  <p className="text-3xl font-bold mt-3">
                    {pricing?.price
                      ? `$ ${pricing.price / 100}`
                      : "Free"}
                  </p>

                  <p className="text-sm text-gray-500 mb-6">
                    per {billingCycle}
                  </p>

                  {/* FEATURES */}
                  <ul className="space-y-3 text-sm mb-6">
                    {plan.features.map((f) => {
                      const label = f.feature_key.replaceAll("_", " ");

                      return (
                        <li key={f.feature_key} className="flex items-center gap-2">

                          {f.enabled ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <X className="w-4 h-4 text-gray-300" />
                          )}

                          <span className={f.enabled ? "" : "text-gray-400"}>
                            {label}
                            {f.limit && ` (${f.limit})`}
                          </span>
                        </li>
                      );
                    })}
                  </ul>

                  {/* CTA */}
                  {isCurrent ? (
                    <button
                      disabled
                      className="w-full bg-gray-200 text-gray-500 py-2 rounded-lg"
                    >
                      Current Plan
                    </button>
                  ) : isDowngrade ? (
                    <button
                      disabled
                      className="w-full bg-gray-100 text-gray-400 py-2 rounded-lg"
                    >
                      Not Available
                    </button>
                  ) : (
                    <button
                      onClick={() => handleCheckout(plan)}
                      disabled={checkoutLoading === plan.id}
                      className="w-full bg-gradient-to-r from-[#0A0DC4] to-[#8B0782] text-white py-2 rounded-lg hover:opacity-90"
                    >
                      {checkoutLoading === plan.id
                        ? "Processing..."
                        : isExpired || isCanceled ? "Continue" : "Upgrade"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-10 text-center">
          <p className="text-sm text-gray-600 mb-3">
            Already have a subscription? Manage billing, update payment method, or cancel anytime.
          </p>

          <button
            onClick={handleCustomerPortal}
            className="text-sm text-blue-600 hover:underline"
          >
            Manage Subscription
          </button>
        </div>
      </div>
    </div>
  );
}