"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { 
  Twitter, 
  Linkedin, 
  Github, 
  Youtube, 
  ArrowRight, 
  Play, 
  CheckCircle, 
  Star,
  Users,
  TrendingUp,
  Zap,
  Shield,
  Menu,
  X,
  Sparkles,
  Clock,
  Award
} from "lucide-react";
import { useState, useRef } from "react";

export default function NewLandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const heroRef = useRef(null);
  
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const features = [
    {
      title: "Live Transcription",
      desc: "Capture every word with precision. Our real-time transcription engine converts spoken conversations into accurate, speaker-labeled text as your meeting unfolds—no lag, no missed moments.",
      img: "/features/feature-01.png",
      icon: <Zap className="w-6 h-6" />,
      color: "from-blue-100 to-cyan-50"
    },
    {
      title: "AI Generated Summaries",
      desc: "Let AI do the heavy lifting. Instantly extract key takeaways, action items, sentiment shifts, and speaker summaries—so you leave every meeting with clarity and direction.",
      img: "/features/feature-02.png",
      icon: <TrendingUp className="w-6 h-6" />,
      color: "from-purple-100 to-pink-50"
    },
    {
      title: "Analyze Speaker Sentiment",
      desc: "Visualize how your meetings feel. Our AI analyzes tone and language to detect sentiment shifts—displayed through intuitive charts and graphs so you can spot engagement and alignment at a glance.",
      img: "/features/feature-03.png",
      icon: <Users className="w-6 h-6" />,
      color: "from-emerald-100 to-teal-50"
    },
    {
      title: "Interactive Dashboard",
      desc: "Stay in control with a real-time dashboard that organizes your meeting transcripts, speaker summaries, action items, and AI insights—all in one place.",
      img: "/features/feature-04.png",
      icon: <Shield className="w-6 h-6" />,
      color: "from-orange-100 to-amber-50"
    },
    {
      title: "Personalized Calendar",
      desc: "Keep track of key action items, follow-ups, and meeting insights—automatically synced to your calendar. ActionBoard AI highlights what matters most and helps you plan smarter, not harder.",
      img: "/features/feature-05.png",
      icon: <CheckCircle className="w-6 h-6" />,
      color: "from-indigo-100 to-violet-50"
    },
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Product Manager at TechCorp",
      content: "Nous Meeting has revolutionized how our team conducts meetings. The AI summaries save us hours every week!",
      avatar: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg",
      rating: 5
    },
    {
      name: "David Rodriguez",
      role: "CEO at StartupXYZ",
      content: "The sentiment analysis feature helps us understand team dynamics like never before. Incredible tool!",
      avatar: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg",
      rating: 5
    },
    {
      name: "Emily Watson",
      role: "Operations Lead",
      content: "Real-time transcription with speaker identification is a game-changer. Highly recommend!",
      avatar: "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg",
      rating: 5
    }
  ];

  const stats = [
    { label: "Hours Saved", value: "10,000+", icon: <Clock className="w-8 h-8" /> },
    { label: "Happy Users", value: "5,000+", icon: <Users className="w-8 h-8" /> },
    { label: "Meetings Analyzed", value: "50,000+", icon: <TrendingUp className="w-8 h-8" /> },
    { label: "Accuracy Rate", value: "99.5%", icon: <Award className="w-8 h-8" /> }
  ];

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">


      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 sm:px-12 overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pt-16">
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
              New: Advanced AI Features Available
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
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
              From Meetings
            </span>
            <br />
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
            className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed"
          >
            Transform your meetings into actionable insights with real-time transcription, 
            AI-powered summaries, and intelligent sentiment analysis
          </motion.p>

          {/* Buttons */}
          <motion.div
            custom={3}
            initial="hidden"
            animate="visible"
            variants={heroVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button className="px-8 py-4 text-lg bg-gradient-to-r from-[#0A0DC4] to-[#8B0782] hover:from-[#0408c5] hover:to-[#800277] text-white shadow-xl shadow-blue-500/25 rounded-full">
                Get Started
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                variant="outline"
                className="px-8 py-4 text-lg bg-white/80 hover:bg-white border-2 border-blue-200 hover:border-blue-300 text-blue-700 rounded-full shadow-lg"
              >
                <Play className="w-5 h-5 mr-2" />
                 View Features
              </Button>
            </motion.div>
          </motion.div>

          {/* Demo Preview */}
          <motion.div
            custom={4}
            initial="hidden"
            animate="visible"
            variants={heroVariants}
            className="relative max-w-4xl mx-auto"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-blue-500/20 border border-white/20 bg-white/10 backdrop-blur-sm">
              <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                <div className="text-center">
                  <Play className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                  <p className="text-blue-700 font-medium">Interactive Demo Preview</p>
                </div>
              </div>
              <motion.div 
                className="absolute inset-0 bg-gradient-to-t from-blue-600/20 to-transparent"
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <motion.div 
                  className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full mb-4"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <div className="text-blue-600">{stat.icon}</div>
                </motion.div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gradient-to-b from-white to-blue-50">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-20"
          >
            <Badge className="mb-4 px-4 py-2 bg-blue-100 text-blue-700">
              Powerful Features
            </Badge>
            <h2 className="text-4xl sm:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Everything you need for
              <br />
              smarter meetings
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover how our AI-powered platform transforms the way you conduct and analyze meetings
            </p>
          </motion.div>

          <div className="space-y-32">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className={`flex flex-col lg:flex-row items-center gap-12 ${
                  index % 2 === 1 ? 'lg:flex-row-reverse' : ''
                }`}
              >
                <div className="flex-1 space-y-6">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.color} shadow-lg`}>
                    <div className="text-blue-600">{feature.icon}</div>
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900">{feature.title}</h3>
                  <p className="text-lg text-gray-600 leading-relaxed">{feature.desc}</p>
                  <motion.div whileHover={{ x: 5 }}>
                    <Link 
                      href="#" 
                      className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Learn more <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </motion.div>
                </div>
                <div className="flex-1">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                    className="relative"
                  >
                    <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border border-gray-200 bg-white">
                      <Image
                        src={feature.img}
                        alt={feature.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl" />
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <Badge className="mb-4 px-4 py-2 bg-white/80 text-blue-700">
              Testimonials
            </Badge>
            <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-gray-900">
              Loved by teams worldwide
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <Card className="h-full bg-white/80 backdrop-blur-sm border-white/50 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <p className="text-gray-700 mb-6 leading-relaxed">"{testimonial.content}"</p>
                    <div className="flex items-center">
                      <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                        <Image
                          src={testimonial.avatar}
                          alt={testimonial.name}
                          width={48}
                          height={48}
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{testimonial.name}</div>
                        <div className="text-gray-600 text-sm">{testimonial.role}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 text-white relative overflow-hidden">
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
              Ready to revolutionize your meetings?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of teams already using Nous Meeting to make their meetings more productive
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button className="px-8 py-4 text-lg bg-white text-blue-700 hover:bg-gray-100 shadow-xl rounded-full">
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  variant="outline"
                  className="px-8 py-4 text-lg bg-transparent border-2 border-white text-white hover:bg-white/10 rounded-full"
                >
                  Schedule Demo
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      
    </div>
  );
}