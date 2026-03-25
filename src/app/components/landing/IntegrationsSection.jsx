"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const integrations = [
  {
    name: "Zoom",
    desc: "Automatically capture meetings from Zoom",
    logo: "/integrations/zoom-logo.png",
    available: true,
  },
  {
    name: "Google Meet",
    desc: "Capture and transcribe Google Meet sessions",
    logo: "/integrations/gmeet-logo.png",
    available: true,
  },
  {
    name: "Microsoft Teams",
    desc: "Coming Soon",
    logo: "/integrations/teams-logo.png",
    available: false,
  },
  {
    name: "Jira",
    desc: "Coming Soon",
    logo: "/integrations/jira-logo.png",
    available: false,
  },
  {
    name: "Slack",
    desc: "Coming Soon",
    logo: "/integrations/slack-logo.png",
    available: false,
  },
  {
    name: "WhatsApp",
    desc: "Coming Soon",
    logo: "/integrations/whatsapp-logo.png",
    available: false,
  },
];

export default function IntegrationsSection() {
  return (
    <section className="relative py-24 px-6 lg:px-16 bg-gradient-to-b from-white to-gray-50 overflow-hidden">

      {/* soft glow background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-20 w-[300px] h-[300px] bg-[#0A0DC4]/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-10 right-20 w-[300px] h-[300px] bg-[#8B0782]/10 blur-[120px] rounded-full" />
      </div>

      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center max-w-[800px] mx-auto mb-16"
      >
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
          Integrations
        </h2>

        <p className="text-gray-600 text-lg">
          Connect seamlessly with the tools you already use.
        </p>
      </motion.div>

      {/* Cards */}
      <motion.div
        className="max-w-[1400px] mx-auto grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={{
          hidden: {},
          visible: {
            transition: { staggerChildren: 0.08 },
          },
        }}
      >
        {integrations.map((item, i) => (
          <motion.div
            key={i}
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: { opacity: 1, y: 0 },
            }}
            className={`group relative rounded-2xl border p-6 flex flex-col items-center text-center transition-all duration-300
              ${
                item.available
                  ? "bg-white border-gray-200 hover:shadow-lg hover:-translate-y-1"
                  : "bg-gray-50 border-gray-200 opacity-80"
              }
            `}
          >
            {/* subtle hover glow */}
            {item.available && (
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition duration-300 bg-gradient-to-br from-[#0A0DC4]/5 to-[#8B0782]/5" />
            )}

            {/* Logo */}
            <div className="relative w-14 h-14 mb-4">
              <Image
                src={item.logo}
                alt={item.name}
                fill
                className="object-contain"
              />
            </div>

            <h3 className="text-sm font-semibold text-gray-900">
              {item.name}
            </h3>

            <p className="text-xs text-gray-500 mt-1">
              {item.desc}
            </p>

            {/* Coming Soon Badge */}
            {!item.available && (
              <span className="mt-3 text-[10px] px-2 py-1 rounded-full bg-gray-200 text-gray-600">
                Coming Soon
              </span>
            )}

          </motion.div>
        ))}
      </motion.div>

    </section>
  );
}