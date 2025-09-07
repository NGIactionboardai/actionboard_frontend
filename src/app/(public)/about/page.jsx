"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ArrowDown, 
  Sparkles, 
  Target, 
  Eye, 
  Users, 
  Heart,
  Award,
  Lightbulb,
  ArrowRight
} from "lucide-react";
import { useRef } from "react";

export default function AboutPage() {
  const { scrollYProgress } = useScroll();
  const heroRef = useRef(null);
  
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  const scrollToStory = () => {
    document.getElementById("story-section")?.scrollIntoView({ 
      behavior: "smooth",
      block: "start"
    });
  };

  const heroVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: (i = 1) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.15,
        duration: 0.8,
        ease: "easeOut",
      },
    }),
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  const teamMembers = [
    {
      name: "Sarah Johnson",
      role: "CEO & Co-Founder",
      image: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg",
      description: "Former VP at Microsoft, passionate about AI and productivity"
    },
    {
      name: "David Chen",
      role: "CTO & Co-Founder", 
      image: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg",
      description: "AI researcher with 10+ years in machine learning"
    },
    {
      name: "Emily Rodriguez",
      role: "Head of Product",
      image: "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg",
      description: "UX expert focused on creating intuitive user experiences"
    },
    {
      name: "Michael Thompson",
      role: "Lead Engineer",
      image: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg",
      description: "Full-stack developer specializing in real-time systems"
    },
    {
      name: "Lisa Wang",
      role: "Head of Marketing",
      image: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg",
      description: "Growth strategist with expertise in B2B SaaS"
    },
    {
      name: "James Wilson",
      role: "Customer Success",
      image: "https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg",
      description: "Dedicated to ensuring customer satisfaction and success"
    }
  ];

  const values = [
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Customer First",
      description: "Every decision we make starts with our customers' needs and success in mind.",
      color: "from-pink-100 to-rose-50"
    },
    {
      icon: <Lightbulb className="w-8 h-8" />,
      title: "Innovation",
      description: "We constantly push boundaries to create cutting-edge AI solutions.",
      color: "from-yellow-100 to-amber-50"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Collaboration",
      description: "We believe the best results come from diverse teams working together.",
      color: "from-blue-100 to-cyan-50"
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: "Excellence",
      description: "We strive for excellence in everything we do, from code to customer service.",
      color: "from-purple-100 to-indigo-50"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 sm:px-12 overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pt-20">
        {/* Floating Elements */}
        <motion.div
          className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-r from-blue-200 to-cyan-200 rounded-full mix-blend-multiply filter blur-xl opacity-70"
          animate={{ 
            y: [0, -20, 0], 
            x: [0, 10, 0],
            scale: [1, 1.1, 1] 
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-40 right-20 w-32 h-32 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70"
          animate={{ 
            y: [0, 20, 0], 
            x: [0, -15, 0],
            scale: [1, 0.9, 1] 
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-40 left-1/4 w-24 h-24 bg-gradient-to-r from-emerald-200 to-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-70"
          animate={{ 
            y: [0, -15, 0], 
            x: [0, 20, 0],
            rotate: [0, 180, 360]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Geometric Shapes */}
        <motion.div
          className="absolute top-1/4 right-1/4 w-4 h-4 bg-blue-400 transform rotate-45"
          animate={{ 
            rotate: [45, 225, 45],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/3 right-1/3 w-6 h-6 bg-purple-400 rounded-full"
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Content */}
        <motion.div style={{ y, opacity }} className="relative z-10 max-w-5xl mx-auto">
          {/* Badge */}
          <motion.div
            custom={0}
            initial="hidden"
            animate="visible"
            variants={heroVariants}
            className="mb-8"
          >
            <Badge className="px-4 py-2 bg-white/80 text-blue-700 border-blue-200 hover:bg-white/90 transition-colors">
              <Sparkles className="w-4 h-4 mr-2" />
              Our Story & Mission
            </Badge>
          </motion.div>

          {/* Title */}
          <motion.h1
            custom={1}
            initial="hidden"
            animate="visible"
            variants={heroVariants}
            className="text-5xl sm:text-7xl lg:text-8xl font-bold mb-8 leading-tight"
          >
            <span className="bg-gradient-to-r from-[#0A0DC4] via-[#8B0782] to-blue-800 bg-clip-text text-transparent">
              About
            </span>
            <br />
            <span className="bg-gradient-to-r from-[#8B0782] via-pink-600 to-purple-800 bg-clip-text text-transparent">
              Nous Meeting
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            custom={2}
            initial="hidden"
            animate="visible"
            variants={heroVariants}
            className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed"
          >
            We're on a mission to make meetings more productive by turning
            conversations into actionable insights with AI
          </motion.p>

          {/* Button */}
          <motion.div
            custom={3}
            initial="hidden"
            animate="visible"
            variants={heroVariants}
            className="mb-16"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                onClick={scrollToStory}
                className="px-8 py-4 text-lg bg-gradient-to-r from-[#0A0DC4] to-[#8B0782] hover:from-[#080aa8] hover:to-[#6d0668] text-white shadow-xl shadow-blue-500/25 rounded-full"
              >
                Learn Our Story
                <ArrowDown className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          </motion.div>

          {/* Animated Arrow */}
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="text-blue-600"
          >
            <ArrowDown className="w-8 h-8 mx-auto opacity-60" />
          </motion.div>
        </motion.div>
      </section>

      {/* Our Story */}
      <section id="story-section" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="space-y-6"
            >
              <Badge className="px-4 py-2 bg-blue-100 text-blue-700">
                Our Journey
              </Badge>
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900">
                Our Story
              </h2>
              <div className="space-y-4 text-lg text-gray-600 leading-relaxed">
                <p>
                  Nous Meeting was founded with a simple idea: <strong className="text-gray-900">meetings should empower people</strong>, not drain them.
                </p>
                <p>
                  We saw teams wasting hours searching notes, losing track of action items, and struggling to align. Our founders, having experienced these pain points firsthand in their corporate careers, knew there had to be a better way.
                </p>
                <p>
                  Our AI-powered platform captures, organizes, and transforms conversations into clarity—helping teams focus on what matters most: making progress and achieving results.
                </p>
              </div>
              <motion.div whileHover={{ x: 5 }}>
                <Link 
                  href="#mission" 
                  className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium text-lg"
                >
                  Read our mission <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </motion.div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <motion.div
                whileHover={{ scale: 1.02, y: -5 }}
                transition={{ duration: 0.3 }}
                className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border border-gray-200"
              >
                <Image
                  src="https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg"
                  alt="Team collaboration"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section id="mission" className="py-24 bg-gradient-to-b from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <Badge className="mb-4 px-4 py-2 bg-white/80 text-blue-700">
              Our Purpose
            </Badge>
            <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-gray-900">
              Mission & Vision
            </h2>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <Card className="h-full bg-white/80 backdrop-blur-sm border-white/50 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-8">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-full flex items-center justify-center mr-4">
                      <Target className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">Our Mission</h3>
                  </div>
                  <p className="text-gray-600 leading-relaxed text-lg">
                    To simplify communication and maximize productivity by providing
                    teams with AI-powered meeting intelligence that ensures nothing is
                    lost, forgotten, or overlooked.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <Card className="h-full bg-white/80 backdrop-blur-sm border-white/50 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-8">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center mr-4">
                      <Eye className="w-6 h-6 text-purple-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">Our Vision</h3>
                  </div>
                  <p className="text-gray-600 leading-relaxed text-lg">
                    To become the go-to productivity companion for organizations
                    worldwide—where every meeting ends with clarity, direction, and
                    results.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <Badge className="mb-4 px-4 py-2 bg-blue-100 text-blue-700">
              Our Values
            </Badge>
            <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-gray-900">
              What Drives Us
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our core values guide every decision we make and shape the culture we build
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <Card className="h-full bg-white border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6 text-center">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r ${value.color} mb-4`}>
                      <div className="text-blue-600">{value.icon}</div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{value.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-24 bg-gradient-to-b from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <Badge className="mb-4 px-4 py-2 bg-white/80 text-blue-700">
              Our Team
            </Badge>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              Meet the People Behind Nous Meeting
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              A diverse team of passionate individuals dedicated to revolutionizing how teams communicate
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <Card className="h-full bg-white/80 backdrop-blur-sm border-white/50 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6 text-center">
                    <div className="relative w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden ring-4 ring-white shadow-lg">
                      <Image
                        src={member.image}
                        alt={member.name}
                        fill
                        className="object-cover"
                        sizes="96px"
                      />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
                    <p className="text-blue-600 font-medium mb-3">{member.role}</p>
                    <p className="text-gray-600 text-sm leading-relaxed">{member.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-24 bg-gradient-to-r from-[#0A0DC4] via-[#8B0782] to-blue-800 text-white relative overflow-hidden">
        <motion.div
          className="absolute top-0 left-0 w-full h-full opacity-10"
          animate={{ 
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Cpath d="M30 30c0-16.569 13.431-30 30-30v60c-16.569 0-30-13.431-30-30z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          }}
        />
        
        <div className="max-w-4xl mx-auto text-center px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">
              Ready to Join Our Mission?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Be part of the future of productive meetings. Start your journey with Nous Meeting today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link href="/auth/register">
                  <Button className="px-8 py-4 text-lg bg-white text-blue-700 hover:bg-gray-100 shadow-xl rounded-full">
                    Get Started Free
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link href="/features">
                  <Button 
                    variant="outline"
                    className="px-8 py-4 text-lg bg-transparent border-2 border-white text-white hover:bg-white/10 rounded-full"
                  >
                    Explore Features
                  </Button>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}