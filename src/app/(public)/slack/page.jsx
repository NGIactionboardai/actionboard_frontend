"use client";

import Link from "next/link";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  MessageSquare,
  Bell,
  Building2,
  Hash,
  Shield,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import { selectIsAuthenticated } from "@/redux/auth/authSlices";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: "easeOut" },
  }),
};

const features = [
  {
    icon: <MessageSquare className="w-6 h-6" />,
    title: "Instant Summaries",
    desc: "AI-generated meeting summaries delivered to your Slack channels the moment your meeting ends.",
    gradient: "from-blue-500 to-cyan-500",
    bg: "from-blue-50 to-cyan-50",
  },
  {
    icon: <Hash className="w-6 h-6" />,
    title: "Department Routing",
    desc: "Route action items to department-specific channels so each team only sees what's relevant.",
    gradient: "from-[#0A0DC4] to-[#8B0782]",
    bg: "from-blue-50 to-purple-50",
  },
  {
    icon: <Bell className="w-6 h-6" />,
    title: "Real-time Notifications",
    desc: "Get notified the moment a meeting summary is ready — no more checking dashboards manually.",
    gradient: "from-purple-500 to-pink-500",
    bg: "from-purple-50 to-pink-50",
  },
  {
    icon: <Building2 className="w-6 h-6" />,
    title: "Multi-Workspace",
    desc: "Connect multiple Slack workspaces to different Nous organizations with full granular control.",
    gradient: "from-emerald-500 to-teal-500",
    bg: "from-emerald-50 to-teal-50",
  },
];

const steps = [
  {
    step: "01",
    title: "Create your Nous Meeting account",
    desc: "Sign up for free at Nous Meeting. No credit card required to get started.",
    action: { label: "Sign in / Register", href: "/auth/login" },
  },
  {
    step: "02",
    title: 'Click "Add to Slack" to begin',
    desc: "Click the Add to Slack button on this page. You'll be prompted to sign in to Nous Meeting if you haven't already.",
    action: null,
  },
  {
    step: "03",
    title: "Authorize Nous Meeting in Slack",
    desc: "Review and grant the necessary Slack permissions for Nous to post summaries to your workspace.",
    action: null,
  },
  {
    step: "04",
    title: "Map your organizations to channels",
    desc: "In Integrations → Slack, connect your Nous organizations to the Slack channels where summaries should appear.",
    action: { label: "Go to Integrations", href: "/integrations" },
  },
  {
    step: "05",
    title: "Receive AI meeting intelligence",
    desc: "Run your next meeting. Nous automatically posts summaries, action items, and insights to your configured Slack channels.",
    action: null,
  },
];

function AddToSlackButton({ variant = "dark", large = false }) {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const router = useRouter();

  const handleClick = () => {
    router.push(isAuthenticated ? "/integrations" : "/auth/login");
  };

  const sizeClasses = large
    ? "px-8 py-4 text-base gap-3"
    : "px-6 py-3 text-sm gap-2.5";

  if (variant === "light") {
    return (
      <button
        onClick={handleClick}
        className={`inline-flex items-center ${sizeClasses} bg-white text-[#4A154B] font-semibold rounded-lg hover:bg-gray-50 shadow-md hover:shadow-xl transition-all duration-200 hover:scale-105`}
      >
        <img
          src="/integrations/slack-logo.png"
          alt="Slack"
          className={large ? "w-6 h-6" : "w-5 h-5"}
        />
        Add to Slack
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center ${sizeClasses} bg-[#4A154B] hover:bg-[#3d1040] text-white font-semibold rounded-lg shadow-md hover:shadow-xl transition-all duration-200 hover:scale-105`}
    >
      <img
        src="/integrations/slack-logo.png"
        alt="Slack"
        className={large ? "w-6 h-6" : "w-5 h-5"}
      />
      Add to Slack
    </button>
  );
}

export default function SlackLandingPage() {
  return (
    <div className="min-h-screen bg-white">

      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pt-32 pb-24">
        {/* Background orbs */}
        <div className="absolute top-16 right-24 w-80 h-80 bg-[#0A0DC4]/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-16 w-96 h-96 bg-[#8B0782]/15 rounded-full blur-[140px] pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-6 text-center">

          {/* Logo lockup */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={0}
            className="flex items-center justify-center gap-5 mb-10"
          >
            <img src="/nous_logo.png" alt="Nous Meeting" className="h-14 w-auto" />
            <span className="w-px h-10 bg-gray-300 block" />
            <img
              src="/integrations/slack-logo.png"
              alt="Slack"
              className="h-11 w-auto"
            />
          </motion.div>

          <motion.h1
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={1}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6"
          >
            <span className="bg-gradient-to-r from-[#0A0DC4] to-[#8B0782] bg-clip-text text-transparent">
              AI Meeting Intelligence
            </span>
            <br />
            <span className="text-gray-900">delivered to Slack</span>
          </motion.h1>

          <motion.p
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={2}
            className="text-gray-600 text-lg sm:text-xl max-w-2xl mx-auto mb-10"
          >
            Connect Nous Meeting to your Slack workspace and receive instant
            AI-powered summaries, action items, and meeting insights directly
            in your channels — the moment your meeting ends.
          </motion.p>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={3}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <AddToSlackButton large />
            <Link
              href="/auth/login"
              className="text-gray-500 hover:text-[#0A0DC4] text-sm transition-colors"
            >
              Sign in first →
            </Link>
          </motion.div>

          <motion.p
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={4}
            className="mt-5 text-sm text-gray-400"
          >
            Requires a free Nous Meeting account.{" "}
            <Link
              href="/pre-register"
              className="text-[#0A0DC4] hover:underline"
            >
              Pre-register here
            </Link>
          </motion.p>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-center mb-14"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              What you get with{" "}
              <span className="bg-gradient-to-r from-[#0A0DC4] to-[#8B0782] bg-clip-text text-transparent">
                Nous&nbsp;+&nbsp;Slack
              </span>
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              Stop copying meeting notes. Let Nous automatically deliver what
              matters to the right people.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i * 0.15}
                className={`p-6 rounded-2xl bg-gradient-to-br ${f.bg} border border-white/60 shadow-sm hover:shadow-md transition-shadow`}
              >
                <div
                  className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r ${f.gradient} text-white mb-4 shadow-md`}
                >
                  {f.icon}
                </div>
                <h3 className="font-semibold text-gray-900 text-base mb-2">
                  {f.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-3xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-center mb-14"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              How to install
            </h2>
            <p className="text-gray-500 text-lg">
              Set up in minutes, not hours.
            </p>
          </motion.div>

          <div className="space-y-5">
            {steps.map((s, i) => (
              <motion.div
                key={s.step}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i * 0.1}
                className="flex gap-5 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex-shrink-0 w-11 h-11 rounded-full bg-gradient-to-br from-[#0A0DC4] to-[#8B0782] text-white font-bold text-xs flex items-center justify-center shadow-md">
                  {s.step}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-base mb-1">
                    {s.title}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    {s.desc}
                  </p>
                  {s.action && (
                    <Link
                      href={s.action.href}
                      className="inline-flex items-center gap-1 mt-3 text-sm font-medium text-[#0A0DC4] hover:text-[#8B0782] transition-colors"
                    >
                      {s.action.label}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
                <CheckCircle className="flex-shrink-0 self-center w-5 h-5 text-gray-200" />
              </motion.div>
            ))}
          </div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={6}
            className="mt-10 text-center"
          >
            <AddToSlackButton large />
          </motion.div>
        </div>
      </section>

      {/* ── PRIVACY ── */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="flex flex-col sm:flex-row items-start sm:items-center gap-5 p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-100"
          >
            <Shield className="w-10 h-10 text-[#0A0DC4] flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 text-lg mb-1">
                Your privacy matters
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Nous Meeting only uses the Slack permissions required to post
                summaries to channels you configure. We never read your Slack
                messages or access private data beyond what is necessary. View
                our{" "}
                <Link
                  href="/privacy-policy"
                  className="text-[#0A0DC4] underline hover:text-[#8B0782]"
                >
                  Privacy Policy
                </Link>{" "}
                and{" "}
                <Link
                  href="/terms"
                  className="text-[#0A0DC4] underline hover:text-[#8B0782]"
                >
                  Terms of Service
                </Link>{" "}
                for full details.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-24 bg-gradient-to-r from-[#0A0DC4] to-[#8B0782]">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-3xl sm:text-4xl font-bold text-white mb-4"
          >
            Ready to supercharge your team&apos;s Slack?
          </motion.h2>
          <motion.p
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={1}
            className="text-blue-100 text-lg mb-10"
          >
            Join teams who never miss a meeting insight again.
          </motion.p>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={2}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <AddToSlackButton variant="light" large />
            <Link
              href="/pre-register"
              className="text-blue-200 hover:text-white text-sm transition-colors"
            >
              No account yet? Pre-register →
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
