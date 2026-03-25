"use client";

import { motion } from "framer-motion";
import { BarChart3, Calendar, Mic, LayoutDashboard, Globe } from "lucide-react";

const features = [
    {
      title: "AI Note Taker",
      desc: "Automatically capture meeting notes, action items, and key insights in real time.",
      icon: Mic,
    },
    {
      title: "Interactive Dashboard",
      desc: "Search, track, and manage all meetings in one place.",
      icon: LayoutDashboard,
    },
    {
      title: "Personalized Calendar",
      desc: "Meetings and schedules synced to your workflow.",
      icon: Calendar,
    },
    {
      title: "Speaker Sentiment Analysis",
      desc: "Understand tone, engagement, and speaker intent.",
      icon: BarChart3,
    },
    {
      title: "Import Audio & Transcribe",
      desc: "Upload recordings and instantly convert them into accurate transcripts.",
      icon: Mic, // you can change this if you want variation
    },
    {
      title: "Multilingual Support",
      desc: "Supports multiple languages for global teams.",
      icon: Globe,
    },
  ];

export default function FeatureCardsSection() {
  return (
    <section className="relative py-24 px-6 lg:px-16 bg-gradient-to-b from-gray-50 to-gray-100 overflow-hidden">

      {/* soft background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-20 w-[300px] h-[300px] bg-[#0A0DC4]/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-10 right-20 w-[300px] h-[300px] bg-[#8B0782]/10 blur-[120px] rounded-full" />
      </div>

      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative max-w-[1400px] mx-auto text-center mb-16"
      >
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-gray-900">
          Experience the Future of Meetings
        </h2>

        <p className="text-gray-600 max-w-2xl mx-auto text-lg">
          Discover how our platform transforms the way you collaborate,
          communicate, and connect.
        </p>
      </motion.div>

      {/* Cards */}
      <motion.div
        className="relative max-w-[1600px] mx-auto grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={{
          hidden: {},
          visible: {
            transition: {
              staggerChildren: 0.12,
            },
          },
        }}
      >
        {features.map((feature, i) => {
          const Icon = feature.icon;

          return (
            <motion.div
              key={i}
              variants={{
                hidden: { opacity: 0, y: 40, scale: 0.96 },
                visible: {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: {
                    duration: 0.5,
                    ease: "easeOut",
                  },
                },
              }}
              className="group relative rounded-2xl border border-gray-200 bg-white p-6 flex flex-col items-center text-center shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              {/* subtle gradient hover glow */}
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition duration-300 bg-gradient-to-br from-[#0A0DC4]/5 to-[#8B0782]/5" />

              {/* Icon */}
              <div className="relative w-20 h-20 flex items-center justify-center rounded-full bg-gradient-to-br from-[#0A0DC4]/10 to-[#8B0782]/10 mb-6">
                <Icon className="w-10 h-10 text-[#8B0782]" />
              </div>

              <h3 className="text-lg font-semibold mb-2 text-gray-900">
                {feature.title}
              </h3>

              <p className="text-sm text-gray-600">
                {feature.desc}
              </p>
            </motion.div>
          );
        })}
      </motion.div>

    </section>
  );
}