"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function Home01() {
  const features = [
    {
      title: "Live Transcription",
      desc: "Capture every word with precision. Our real-time transcription engine converts spoken conversations into accurate, speaker-labeled text as your meeting unfolds—no lag, no missed moments.",
      img: "/features/feature-01.png",
    },
    {
      title: "AI Generated Summaries",
      desc: "Let AI do the heavy lifting. Instantly extract key takeaways, action items, sentiment shifts, and speaker summaries—so you leave every meeting with clarity and direction.",
      img: "/features/feature-02.png",
    },
    {
      title: "Analyze Speaker Sentiment",
      desc: "Visualize how your meetings feel. Our AI analyzes tone and language to detect sentiment shifts—displayed through intuitive charts and graphs so you can spot engagement and alignment at a glance.",
      img: "/features/feature-03.png",
    },
    {
      title: "Interactive Dashboard",
      desc: "Stay in control with a real-time dashboard that organizes your meeting transcripts, speaker summaries, action items, and AI insights—all in one place.",
      img: "/features/feature-04.png",
    },
    {
        title: "Personalized Calendar",
        desc: "Keep track of key action items, follow-ups, and meeting insights—automatically synced to your calendar. ActionBoard AI highlights what matters most and helps you plan smarter, not harder.",
        img: "/features/feature-05.png",
    },
  ];

  const heroVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: (i = 1) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.2,
        duration: 0.6,
        ease: "easeOut",
      },
    }),
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section with Background Image */}
      <section className="relative h-screen flex flex-col items-center justify-center text-center px-6 sm:px-12 overflow-hidden bg-black">
        {/* Animated neon grid */}
        <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(10,13,196,0.15),transparent_70%)]" />
            <div className="absolute inset-0 opacity-20">
            <div className="w-full h-full bg-[linear-gradient(90deg,transparent_95%,rgba(139,7,130,0.6)_100%),linear-gradient(0deg,transparent_95%,rgba(10,13,196,0.6)_100%)] bg-[length:50px_50px]" />
            </div>

            {/* Neon scan animation */}
            <motion.div
            className="absolute inset-0 bg-gradient-to-r from-[#0A0DC4]/10 via-[#8B0782]/30 to-[#0A0DC4]/10"
            animate={{
                x: ["-100%", "100%"],
            }}
            transition={{
                duration: 8,
                repeat: Infinity,
                ease: "linear",
            }}
            />
        </div>

        {/* Floating neon particles */}
        <div className="absolute inset-0 z-0 overflow-hidden">
            {[...Array(20)].map((_, i) => (
            <motion.span
                key={i}
                className="absolute rounded-full bg-gradient-to-r from-[#0A0DC4] to-[#8B0782] opacity-60 blur-sm"
                style={{
                width: Math.random() * 14 + 8 + "px",
                height: Math.random() * 14 + 8 + "px",
                top: Math.random() * 100 + "%",
                left: Math.random() * 100 + "%",
                }}
                animate={{
                y: [0, -80, 0],
                x: [0, i % 2 === 0 ? 60 : -60, 0],
                opacity: [0.3, 0.9, 0.3],
                scale: [1, 1.8, 1],
                }}
                transition={{
                duration: Math.random() * 5 + 5,
                repeat: Infinity,
                ease: "easeInOut",
                }}
            />
            ))}
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-3xl mx-auto">
            {/* Title */}
            <motion.h1
            custom={1}
            initial="hidden"
            animate="visible"
            variants={heroVariants}
            className="relative text-4xl sm:text-6xl font-extrabold mb-6 sm:whitespace-nowrap"
            >
            {/* Glow behind text */}
            <span className="absolute inset-0 blur-2xl bg-gradient-to-r from-[#0A0DC4] to-[#8B0782] opacity-40 -z-10"></span>

            {/* Actual Text */}
            <span className="bg-gradient-to-r from-[#4F46E5] via-[#0A0DC4] to-[#D946EF] bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(139,7,130,0.8)]">
                From Meetings to Meaning
            </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
            custom={2}
            initial="hidden"
            animate="visible"
            variants={heroVariants}
            className="relative text-lg sm:text-xl mb-8 max-w-xl mx-auto leading-relaxed"
            >
            {/* Subtle frosted backdrop for readability */}
            <span className="absolute inset-0 rounded-lg backdrop-blur-sm -z-10"></span>

            <span className="text-gray-200 drop-shadow-[0_0_12px_rgba(79,70,229,0.7)]">
                Actionboard turns your Zoom meetings into searchable transcripts, 
                smart summaries, and insights — so you never miss what matters.
            </span>
            </motion.p>

            {/* Buttons */}
            <motion.div
            custom={3}
            initial="hidden"
            animate="visible"
            variants={heroVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center"
            >
            {/* Primary Button with neon glow */}
            <button className="px-6 py-3 rounded-2xl font-semibold bg-gradient-to-r from-[#4F46E5] to-[#D946EF] text-white shadow-[0_0_20px_rgba(217,70,239,0.7)] hover:scale-105 transition-transform">
                Get Started
            </button>

            {/* Secondary Button with glass effect */}
            <button 
                onClick={() => {
                    document
                    .getElementById("features")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className="px-6 py-3 rounded-2xl font-semibold text-white border border-white/30 backdrop-blur-sm bg-black/40 hover:bg-white/10 shadow-[0_0_15px_rgba(255,255,255,0.4)] hover:scale-105 transition-transform">
                 View Features
            </button>
            </motion.div>
        </div>

        </section>

      {/* Features */}
      <section
        id="features"
        className="space-y-24 py-16 scroll-mt-20"
      >
        <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-4xl sm:text-5xl font-bold text-center mb-16"
        >
            Our Features
        </motion.h2>

        {features.map((f, i) => (
            <motion.div
            key={i}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, delay: i * 0.2 }}
            className={`flex flex-col ${
                i % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
            } items-center max-w-6xl mx-auto gap-12 px-6`}
            >
            <motion.div
                initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, delay: i * 0.2 }}
                className="lg:w-1/2"
            >
                <Image
                src={f.img}
                alt={f.title}
                width={600}
                height={400}
                className="rounded-2xl shadow-lg"
                />
            </motion.div>

            <motion.div
                initial={{ opacity: 0, x: i % 2 === 0 ? 50 : -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, delay: i * 0.3 }}
                className="lg:w-1/2 text-center lg:text-left"
            >
                <h2 className="text-3xl font-bold mb-4">{f.title}</h2>
                <p className="text-gray-600 text-lg">{f.desc}</p>
            </motion.div>
            </motion.div>
        ))}
        </section>

      {/* CTA Footer */}
      <section className="text-center py-20 bg-gradient-to-r from-[#0A0DC4] to-[#8B0782] text-white">
        <h2 className="text-3xl sm:text-4xl font-bold mb-6">
          Ready to level up your meetings?
        </h2>
        <Button className="px-8 py-4 rounded-full text-lg bg-white text-[#0A0DC4] hover:bg-gray-100 shadow-lg">
          Try Now
        </Button>
      </section>
    </div>
  );
}
