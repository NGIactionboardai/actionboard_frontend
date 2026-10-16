// src/app/(nous-bot)/layout.js
"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Bot } from "lucide-react";
import NewNavbar from "../components/layout/NewNavbar";
import { fetchSubscription } from "@/redux/billing/billingSlice";
import { selectIsAuthenticated } from "@/redux/auth/authSlices";

export default function NousBotLayout({ children }) {
  const dispatch = useDispatch();

  // Feature gating (useFeature) always reads the viewing user's own
  // subscription — Subscription is a per-user model, there's no org-level
  // plan. Unlike (dashboard), this route group never mounts AuthHydrator, so
  // nothing else ever performs the *first* billing fetch — on a cold load
  // (direct link, fresh tab) billing.status is still 'idle' and billing.orgId
  // is still its initial null, which looks identical to "already has the
  // correct user-level data". Fetch it ourselves whenever that's the case, or
  // whenever it holds stale org-scoped data from a dashboard page elsewhere.
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const billingOrgId = useSelector((state) => state.billing.orgId);
  const billingStatus = useSelector((state) => state.billing.status);
  useEffect(() => {
    if (!isAuthenticated || billingStatus === 'loading') return;
    if (billingStatus === 'idle' || billingOrgId !== null) dispatch(fetchSubscription());
  }, [isAuthenticated, billingOrgId, billingStatus, dispatch]);

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
