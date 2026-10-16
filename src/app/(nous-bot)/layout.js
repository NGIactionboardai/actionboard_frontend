// src/app/(nous-bot)/layout.js
"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Bot } from "lucide-react";
import NewNavbar from "../components/layout/NewNavbar";
import { fetchSubscription } from "@/redux/billing/billingSlice";

export default function NousBotLayout({ children }) {
  const dispatch = useDispatch();

  // Feature gating (useFeature) always reads the viewing user's own
  // subscription — Subscription is a per-user model, there's no org-level
  // plan. This route never fetches billing itself, so without this it shows
  // whatever was last loaded elsewhere (e.g. an org-scoped admin view from a
  // dashboard page for a different org), which can wrongly paywall a Pro user.
  const billingOrgId = useSelector((state) => state.billing.orgId);
  const billingStatus = useSelector((state) => state.billing.status);
  useEffect(() => {
    if (billingStatus === 'idle' || billingStatus === 'loading') return;
    if (billingOrgId !== null) dispatch(fetchSubscription());
  }, [billingOrgId, billingStatus, dispatch]);

  return (
    <div className="min-h-[calc(100vh-4.5rem)] flex flex-col bg-gray-50">
      {/* Bot Header */}
      {/* <div className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="px-6 py-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-r from-[#0A0DC4] to-[#8B0782] flex items-center justify-center text-white">
            <Bot size={18} />
          </div>

          <div>
            <h1 className="text-lg font-semibold text-gray-800">
              Nous Bot
            </h1>
            <p className="text-sm text-gray-500">
              Meeting assistant & notes
            </p>
          </div>
        </div>
      </div> */}

      <NewNavbar />

      {/* Page Content */}
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
