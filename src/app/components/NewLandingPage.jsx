"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Twitter, Linkedin, Github, Youtube } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NewLandingPage() {
  const router = useRouter();

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
      <section className="relative h-screen flex flex-col items-center justify-center text-center px-6 sm:px-12 overflow-hidden bg-gradient-to-b from-white to-gray-50">
            {/* Background overlay image */}
            <Image
                src="/home/ab-home-01.png"
                alt="Background Overlay"
                fill
                className="object-cover opacity-10 pointer-events-none"
            />
    
          {/* Animated Blobs */}
          {/* Animated Blobs (big background) */}
            <motion.div
            className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-gradient-to-r from-[#0A0DC4] to-[#8B0782] rounded-full mix-blend-multiply filter blur-3xl opacity-30 z-0"
            animate={{ x: [0, 50, -50, 0], y: [0, -30, 30, 0], rotate: [0, 45, -45, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
            className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-gradient-to-r from-[#8B0782] to-[#0A0DC4] rounded-full mix-blend-multiply filter blur-3xl opacity-30 z-0"
            animate={{ x: [0, -40, 40, 0], y: [0, 40, -40, 0], rotate: [0, -30, 30, 0] }}
            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
            />
    
            {/* Extra floating small blobs */}
            {[...Array(6)].map((_, i) => (
            <motion.div
                key={i}
                className="absolute rounded-full mix-blend-multiply filter blur-lg opacity-40 z-10"
                style={{
                width: `${40 + i * 10}px`,   // different sizes
                height: `${40 + i * 10}px`,
                top: `${10 + i * 12}%`,
                left: `${5 + i * 15}%`,
                background: i % 2 === 0 
                    ? "linear-gradient(to right, #0A0DC4, #8B0782)" 
                    : "linear-gradient(to right, #8B0782, #0A0DC4)",
                }}
                animate={{
                y: [0, -30, 30, 0],
                x: [0, 20, -20, 0],
                scale: [1, 1.3, 0.8, 1],
                opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                duration: 8 + i * 2,
                repeat: Infinity,
                ease: "easeInOut",
                }}
            />
            ))}
    
          {/* Content */}
          <div className="relative z-10 max-w-3xl mx-auto">
            {/* Title */}
            <motion.h1
                custom={1}
                initial="hidden"
                animate="visible"
                variants={heroVariants}
                className="text-4xl sm:text-6xl font-bold mb-6 sm:whitespace-nowrap"
            >
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
                  From Meetings
                </span>
                <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-800 bg-clip-text text-transparent">
                  to Meaning
                </span>
            </motion.h1>
    
            {/* Subtitle */}
            <motion.p
                custom={2}
                initial="hidden"
                animate="visible"
                variants={heroVariants}
                className="text-gray-600 max-w-2xl mx-auto text-lg mb-8"
            >
                Turns your meetings into actionable transcripts, live notes, intelligent summaries and many more
            </motion.p>
    
            {/* Buttons */}
            <motion.div
                custom={3}
                initial="hidden"
                animate="visible"
                variants={heroVariants}
                className="flex flex-wrap justify-center gap-4"
            >
                <Button 
                  className="px-8 py-4 cursor-pointer rounded-full text-lg text-white bg-gradient-to-r from-[#0A0DC4] to-[#8B0782] hover:from-[#080aa8] hover:to-[#6d0668] shadow-lg"
                  onClick={() => router.push("/help#help-content")}
                >
                  Get Started
                </Button>
    
                <Button
                onClick={() => {
                    document
                    .getElementById("features")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className="px-8 py-4 cursor-pointer rounded-full text-lg bg-white text-[#0A0DC4] border border-[#0A0DC4] hover:bg-gray-100 shadow-lg"
                >
                View Features
                </Button>
            </motion.div>
          </div>
    
        </section>

      {/* Features */}
      <section id="features" className="space-y-24 py-16 scroll-mt-20">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-4xl sm:text-5xl font-bold text-center mb-16"
        >
          Nous Meeting Features
        </motion.h2>

        {features.map((f, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, delay: i * 0.2 }}
            className="flex flex-col items-center max-w-4xl mx-auto gap-6 px-6"
          >
            {/* Feature Text FIRST */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: i * 0.2 }}
              className="text-center"
            >
              <h2 className="text-3xl font-bold mb-3">{f.title}</h2>
              <p className="text-gray-600 text-lg">{f.desc}</p>
            </motion.div>

            {/* Feature Image SECOND */}
            <motion.figure
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: i * 0.3 }}
              className="w-full"
            >
              <div className="mx-auto w-full max-w-5xl"> {/* made it wider */}
                {/* Frame with consistent aspect ratio */}
                <div className="relative aspect-[3/2] overflow-hidden rounded-2xl ring-1 ring-gray-200 shadow-xl">
                  <Image
                    src={f.img}
                    alt={f.title}
                    fill
                    className="object-contain object-center p-1" 
                    sizes="(min-width: 1280px) 1000px, (min-width: 1024px) 900px, 100vw"
                    priority={i < 1}
                  />
                </div>
              </div>
            </motion.figure>


          </motion.div>
        ))}
      </section>



      {/* CTA Footer */}
      <section className="text-center py-20 bg-gradient-to-r from-[#0A0DC4] to-[#8B0782] text-white">
        <h2 className="text-3xl sm:text-4xl font-bold mb-6">
          Ready to use Nous Meeting?
        </h2>
        <Button 
          className="px-8 py-4 rounded-full text-lg bg-white text-[#0A0DC4] hover:bg-gray-100 shadow-lg"
          onClick={() => router.push("/help#help-content")}
        >
          Try Now
        </Button>
      </section>

      

    </div>
  );
}
