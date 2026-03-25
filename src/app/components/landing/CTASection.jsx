"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function CTASection() {
  const router = useRouter();

  return (
    <section className="relative py-28 px-6 lg:px-16 overflow-hidden">

      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0A0DC4] to-[#8B0782]" />

      {/* Soft glow orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-80px] left-[-80px] w-[300px] h-[300px] bg-white/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-80px] right-[-80px] w-[300px] h-[300px] bg-white/10 blur-[120px] rounded-full" />
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative max-w-[900px] mx-auto text-center text-white"
      >
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
          Stop losing insights from your meetings
        </h2>

        <p className="text-lg text-white/80 mb-10 max-w-2xl mx-auto">
          Join early and be the first to experience smarter meetings with AI-powered insights, summaries, and automation.
        </p>

        <Button
          onClick={() => router.push("/pre-register")}
          className="px-10 py-5 cursor-pointer rounded-full text-lg bg-white text-[#0A0DC4] hover:bg-gray-100 shadow-xl transition-all duration-300"
        >
          Pre-register
        </Button>

        {/* Optional trust hint */}
        <p className="text-sm text-white/70 mt-6">
          Early access. Be among the first.
        </p>
      </motion.div>

    </section>
  );
}