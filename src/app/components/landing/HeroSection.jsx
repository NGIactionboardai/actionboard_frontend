"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function HeroSection() {
  const router = useRouter();

  const mockups = [
    "/mockup-img-01.png",
    "/mockup-img-02.png",
  ];

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % mockups.length);
    }, 1800); // slightly slower = smoother UX
    return () => clearInterval(interval);
  }, [mockups.length]);

  return (
    <section className="relative min-h-screen flex items-center px-6 sm:px-8 lg:px-16 overflow-hidden">
      
      <div className="w-full mt-10 mx-auto grid lg:grid-cols-[0.9fr_1.6fr] gap-12 items-center">

        {/* LEFT SIDE */}
        <div className="space-y-6 sm:space-y-8 text-center lg:text-left">

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl sm:text-5xl lg:text-7xl font-bold leading-tight"
          >
            <span className="bg-gradient-to-r from-[#0A0DC4] to-[#8B0782] bg-clip-text text-transparent">
              From Meetings
            </span>{" "}
            to Meaning
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-gray-600 text-base sm:text-lg lg:text-xl max-w-xl mx-auto lg:mx-0"
          >
            Turn every meeting into transcripts, AI summaries,
            insights and actionable knowledge automatically.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 sm:gap-5 pt-4 justify-center lg:justify-start"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Button
              className="px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-base sm:text-lg text-white bg-gradient-to-r from-[#0A0DC4] to-[#8B0782]"
              onClick={() => router.push("/pre-register")}
            >
              Pre-Register
            </Button>

            <Button
              variant="outline"
              className="px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-base sm:text-lg border-[#0A0DC4] text-[#0A0DC4]"
              onClick={() =>
                document
                  .getElementById("features")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              View Features
            </Button>
          </motion.div>
        </div>

        {/* RIGHT SIDE */}
        <div className="relative flex justify-center lg:justify-end">

          {/* ORBS (kept but contained better) */}
          <div className="absolute -top-10 right-10 w-[250px] sm:w-[350px] h-[250px] sm:h-[350px] bg-[#0A0DC4]/20 rounded-full blur-[120px] pointer-events-none" />

          <div className="absolute top-32 -right-10 w-[280px] sm:w-[420px] h-[280px] sm:h-[420px] bg-[#8B0782]/20 rounded-full blur-[140px] pointer-events-none" />

          <div className="absolute bottom-0 right-20 w-[200px] sm:w-[300px] h-[200px] sm:h-[300px] bg-purple-400/20 rounded-full blur-[110px] pointer-events-none" />

          {/* MOCKUP */}
          <div className="relative w-full max-w-[600px] lg:max-w-[1100px] z-10">

            <Image
              src={mockups[index]}
              alt="Product Interface"
              width={1800}
              height={1200}
              priority
              className="w-full h-auto"
            />

          </div>
        </div>
      </div>
    </section>
  );
}