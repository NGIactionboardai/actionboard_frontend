"use client";

import { motion } from "framer-motion";
import { Clock, FileText, XCircle } from "lucide-react";

const problems = [
  {
    title: "Meetings Waste Time",
    desc: "Hours lost without clear outcomes.",
    icon: Clock,
  },
  {
    title: "Notes get lost",
    desc: "No central, searchable memory.",
    icon: FileText,
  },
  {
    title: "Manual Follow-ups Fail",
    desc: "Action items missed, no accountability.",
    icon: XCircle,
  },
];

export default function WhySection() {
  return (
    <section className="relative py-24 px-6 lg:px-16 bg-white overflow-hidden">

      {/* subtle divider feel */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
      </div>

      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-[900px] mx-auto text-center mb-16"
      >
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
          Why Nous Meeting
        </h2>

        <p className="text-gray-600 text-lg">
          Meetings should create clarity, not confusion.
        </p>
      </motion.div>

      {/* Cards */}
      <motion.div
        className="max-w-[1200px] mx-auto grid gap-8 md:grid-cols-2 lg:grid-cols-3"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={{
          hidden: {},
          visible: {
            transition: { staggerChildren: 0.15 },
          },
        }}
      >
        {problems.map((item, i) => {
          const Icon = item.icon;

          return (
            <motion.div
              key={i}
              variants={{
                hidden: { opacity: 0, y: 40 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.5 },
                },
              }}
              className="group relative rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-6 shadow-sm hover:shadow-lg transition-all duration-300"
            >
              {/* subtle gradient hover */}
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition duration-300 bg-gradient-to-br from-[#0A0DC4]/5 to-[#8B0782]/5" />

              {/* Icon */}
              <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-gradient-to-br from-[#0A0DC4] to-[#8B0782] mb-4">
                <Icon className="w-6 h-6 text-white" />
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {item.title}
              </h3>

              <p className="text-gray-600 text-sm">
                {item.desc}
              </p>
            </motion.div>
          );
        })}
      </motion.div>

    </section>
  );
}