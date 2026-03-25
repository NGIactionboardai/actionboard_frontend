"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Zap, Users, Brain } from "lucide-react";

const steps = [
  {
    title: "Quick Setup",
    desc: "Get started in minutes with our intuitive interface",
    icon: Zap,
    video: 'https://www.youtube.com/embed/HQvixIwL6sw?si=pzag0IbcMNzJQErf?rel=0&modestbranding=1&playsinline=1',
  },
  {
    title: "Seamless Integration",
    desc: "Connect directly with your Zoom account",
    icon: Users,
    video: "https://www.youtube.com/embed/dyP_l0B5r5A?si=nB4RQUXEH9WifVLU?rel=0&modestbranding=1&playsinline=1",
  },
  {
    title: "Smart Features",
    desc: "Automatic transcription and AI-powered summaries",
    icon: Brain,
    video: "https://www.youtube.com/embed/eKFTkx1qwyo?si=b1A6PykcsTAAA4dX?rel=0&modestbranding=1&playsinline=1",
  },
];

export default function HowItWorksSection() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section className="relative py-24 px-6 lg:px-16 bg-gradient-to-b from-gray-100 to-white">

      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center max-w-[800px] mx-auto mb-16"
      >
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
          See How It Works
        </h2>

        <p className="text-gray-600 text-lg">
          Watch how Nous Meeting transforms your workflow step-by-step.
        </p>
      </motion.div>

      {/* Content */}
      <div className="max-w-[1400px] mx-auto grid lg:grid-cols-[1fr_1.4fr] gap-12 items-center">

        {/* LEFT SIDE - STEPS */}
        <div className="space-y-6">

          {steps.map((step, i) => {
            const Icon = step.icon;
            const isActive = i === activeIndex;

            return (
              <motion.div
                key={i}
                onMouseEnter={() => {
                    clearTimeout(window.__hoverTimeout);
                    window.__hoverTimeout = setTimeout(() => {
                      setActiveIndex(i);
                    }, 150);
                }}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`cursor-pointer rounded-2xl p-6 border transition-all duration-300
                  ${
                    isActive
                      ? "border-transparent bg-gradient-to-r from-[#0A0DC4]/10 to-[#8B0782]/10 shadow-md"
                      : "border-gray-200 bg-white hover:shadow-sm"
                  }
                `}
              >
                <div className="flex items-start gap-4">

                  {/* Icon */}
                  <div
                    className={`w-12 h-12 flex items-center justify-center rounded-lg 
                    ${
                      isActive
                        ? "bg-gradient-to-br from-[#0A0DC4] to-[#8B0782] text-white"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>

                  {/* Text */}
                  <div>
                    <h3
                      className={`text-lg font-semibold ${
                        isActive ? "text-gray-900" : "text-gray-800"
                      }`}
                    >
                      {step.title}
                    </h3>

                    <p className="text-gray-600 text-sm mt-1">
                      {step.desc}
                    </p>
                  </div>

                  {/* Step number */}
                  <div className="ml-auto text-sm font-semibold text-gray-400">
                    {i + 1}
                  </div>

                </div>
              </motion.div>
            );
          })}

        </div>

        {/* RIGHT SIDE - VIDEO */}
        <div className="relative w-full rounded-2xl overflow-hidden shadow-xl">

            <div className="relative w-full pt-[56.25%]">

                {steps.map((step, i) => (
                    <iframe
                    key={i}
                    src={step.video}
                    title={`video-${i}`}
                    className={`absolute top-0 left-0 w-full h-full rounded-2xl transition-opacity duration-500 ${
                        i === activeIndex ? "opacity-100 z-10" : "opacity-0 z-0"
                    }`}
                    allowFullScreen
                    />
                ))}

            </div>

            {/* subtle gradient border */}
            <div className="pointer-events-none absolute inset-0 rounded-2xl border border-transparent bg-gradient-to-r from-[#0A0DC4]/20 to-[#8B0782]/20" />

        </div>

      </div>

    </section>
  );
}