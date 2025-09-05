"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const heroVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.3,
      duration: 0.8,
      ease: "easeOut",
    },
  }),
};

export default function Home03Hero() {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
    {/* Background Image */}
    <Image
        src="/home03/home-03-hero-cover.png"
        alt="Hero Cover"
        fill
        className="object-cover"
        priority
    />

    {/* Black Overlay */}
    <div className="absolute inset-0 bg-black/60" />

    {/* Content */}
    <div className="relative z-10 max-w-6xl mx-auto px-6 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        {/* Left Side (Heading + Subtext) */}
        <div className="text-left">
            <motion.h1
            custom={1}
            initial="hidden"
            animate="visible"
            variants={heroVariants}
            className="text-4xl sm:text-6xl md:text-7xl font-bold leading-tight text-white"
            style={{ fontFamily: "Museo Modern, sans-serif" }}
            >
            Turn Every Meeting into{" "}
            <span className="text-[#3B82F6]">Outcomes</span>
            </motion.h1>

            <motion.p
            custom={2}
            initial="hidden"
            animate="visible"
            variants={heroVariants}
            className="mt-6 text-lg sm:text-xl text-gray-200 max-w-2xl"
            >
            Turns your meetings into actionable transcripts, live notes, 
            intelligent summaries and many more…
            </motion.p>
        </div>

        {/* Right Side (Feature List) */}
        <motion.ul
            custom={3}
            initial="hidden"
            animate="visible"
            variants={heroVariants}
            className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-white text-lg font-medium text-right"
        >
            <li>✔ Live Transcription</li>
            <li>✔ AI Generated Summaries</li>
            <li>✔ Sentiment Analysis</li>
            <li>✔ Personalized Calendar</li>
            <li>✔ Interactive Dashboard</li>
            <li>✔ Multilingual Translation</li>
        </motion.ul>
        </div>
    </div>
    </section>
  );
}
