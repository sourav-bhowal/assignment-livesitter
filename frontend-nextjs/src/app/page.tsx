"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Play,
  Shield,
  Zap,
  Globe,
  Users,
  Monitor,
  Smartphone,
  Tv,
  CheckCircle,
  ArrowRight,
  Star,
} from "lucide-react";
import Link from "next/link";
import { VideoPlayer } from "@/components/VideoPlayer";

export default function RTSPStreamingLanding() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Ultra-Low Latency",
      description:
        "Experience real-time streaming with latency as low as 100ms for critical applications.",
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Enterprise Security",
      description:
        "Bank-grade encryption and authentication to keep your streams secure and private.",
    },
    {
      icon: <Globe className="h-8 w-8" />,
      title: "Global CDN",
      description:
        "Worldwide content delivery network ensures optimal performance anywhere.",
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Unlimited Viewers",
      description:
        "Scale to millions of concurrent viewers without compromising quality.",
    },
  ];

  const devices = [
    { icon: <Monitor className="h-6 w-6" />, name: "Desktop" },
    { icon: <Smartphone className="h-6 w-6" />, name: "Mobile" },
    { icon: <Tv className="h-6 w-6" />, name: "Smart TV" },
  ];

  const stats = [
    { value: "99.9%", label: "Uptime" },
    { value: "100ms", label: "Latency" },
    { value: "50M+", label: "Streams" },
    { value: "180+", label: "Countries" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="relative z-50 px-4 lg:px-6 h-16 flex items-center backdrop-blur-md bg-black/20 border-b border-white/10">
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <Play className="h-4 w-4 text-white" />
          </div>
          <span className="text-xl font-bold text-white">LiveSitter</span>
        </Link>

        <nav className="ml-auto flex gap-6">
          {["My Stream"].map((item) => (
            <Link
              key={item}
              href={`/my-stream`}
              className="text-sm font-medium text-gray-300 hover:text-white transition-colors duration-200 hover:scale-105 transform"
            >
              {item}
            </Link>
          ))}
        </nav>

        <div className="ml-6 hidden md:flex gap-2">
          <Button variant="ghost" className="text-white hover:bg-white/10">
            Sign In
          </Button>
          <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-200">
            Get Started
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20" />

        <div className="container mx-auto px-4 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div
              className={`space-y-8 transform transition-all duration-1000 ${
                isVisible
                  ? "translate-x-0 opacity-100"
                  : "-translate-x-10 opacity-0"
              }`}
            >
              <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 hover:bg-purple-500/30 transition-colors">
                <Zap className="h-3 w-3 mr-1" />
                Ultra-Low Latency Streaming
              </Badge>

              <h1 className="text-4xl lg:text-6xl font-bold text-white leading-tight">
                Professional
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  {" "}
                  RTSP{" "}
                </span>
                Streaming Platform
              </h1>

              <p className="text-xl text-gray-300 leading-relaxed">
                Deliver real-time video streams with enterprise-grade
                reliability. Perfect for surveillance, live events, and
                mission-critical applications.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-200 group"
                >
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/30 hover:bg-white hover:text-black transform hover:scale-105 transition-all duration-200"
                >
                  Watch Demo
                  <Play className="ml-2 h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center gap-8 pt-4">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl font-bold text-white">
                      {stat.value}
                    </div>
                    <div className="text-sm text-gray-400">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div
              className={`relative transform transition-all duration-1000 delay-300 ${
                isVisible
                  ? "translate-x-0 opacity-100"
                  : "translate-x-10 opacity-0"
              }`}
            >
              <VideoPlayer
                hlsUrl={`${process.env.NEXT_PUBLIC_BACKEND_HLS_URL}/hls/continuous/index.m3u8`}
                autoplay
                muted
                className="w-full h-64 lg:h-96 rounded-2xl shadow-lg border border-white/10 backdrop-blur-sm"
              />

              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium animate-bounce">
                100ms Latency
              </div>
              <div className="absolute -bottom-4 -left-4 bg-purple-500 text-white px-3 py-1 rounded-full text-sm font-medium animate-pulse">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-sm font-medium">LIVE</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-white mb-4">
              Why Choose LiveSitter?
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Built for professionals who demand the highest quality streaming
              experience
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 transform hover:scale-105 hover:-translate-y-2 group"
              >
                <CardContent className="p-6 text-center">
                  <div className="text-purple-400 mb-4 flex justify-center group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-300">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Device Compatibility */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-white mb-4">
              Stream Anywhere
            </h2>
            <p className="text-xl text-gray-300">
              Compatible with all major devices and platforms
            </p>
          </div>

          <div className="flex justify-center items-center gap-12 mb-16">
            {devices.map((device, index) => (
              <div
                key={index}
                className="flex flex-col items-center gap-3 group cursor-pointer"
              >
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-white group-hover:bg-purple-500/20 group-hover:scale-110 transition-all duration-300">
                  {device.icon}
                </div>
                <span className="text-gray-300 group-hover:text-white transition-colors">
                  {device.name}
                </span>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-3xl p-8 border border-white/10">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-bold text-white mb-4">
                  Ready to Get Started?
                </h3>
                <p className="text-gray-300 mb-6">
                  Join thousands of professionals who trust LiveSitter for their
                  critical streaming needs.
                </p>
                <div className="flex items-center gap-4 mb-6">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className="h-5 w-5 text-yellow-400 fill-current"
                    />
                  ))}
                  <span className="text-white font-medium">
                    4.9/5 from 2,000+ reviews
                  </span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter your email"
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-500"
                  />
                  <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-200">
                    Start Free
                  </Button>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  No credit card required • 14-day free trial
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/40 backdrop-blur-sm border-t border-white/10 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Play className="h-4 w-4 text-white" />
                </div>
                <span className="text-xl font-bold text-white">LiveSitter</span>
              </div>
              <p className="text-gray-400">
                Professional RTSP streaming platform for mission-critical
                applications.
              </p>
            </div>

            {[
              {
                title: "Product",
                links: ["Features", "Pricing", "API", "Documentation"],
              },
              {
                title: "Company",
                links: ["About", "Blog", "Careers", "Contact"],
              },
              {
                title: "Support",
                links: ["Help Center", "Status", "Security", "Privacy"],
              },
            ].map((section, index) => (
              <div key={index}>
                <h3 className="text-white font-semibold mb-4">
                  {section.title}
                </h3>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link}>
                      <Link
                        href="#"
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-white/10 mt-12 pt-8 text-center text-gray-400">
            <p>
              &copy; {new Date().getFullYear()} LiveSitter. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
