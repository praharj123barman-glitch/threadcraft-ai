"use client";

import React, { useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Globe,
  Sliders,
  Clock,
  Check,
  ArrowRight,
} from "lucide-react";

/* ─── Feature Card ─── */
function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Card className="bg-gray-900 border-gray-800 hover:border-indigo-500/50 transition-all duration-300">
      <CardHeader>
        <div className="w-12 h-12 rounded-lg bg-indigo-500/10 flex items-center justify-center mb-4">
          {icon}
        </div>
        <CardTitle className="text-xl text-white">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-gray-400">
          {description}
        </CardDescription>
      </CardContent>
    </Card>
  );
}

/* ─── Step Card ─── */
function StepCard({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center mb-4">
        <span className="text-2xl font-bold text-white">{number}</span>
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  );
}

/* ─── Pricing Card ─── */
function PricingCard({
  tier,
}: {
  tier: {
    name: string;
    price: string;
    description: string;
    features: string[];
    highlighted?: boolean;
  };
}) {
  return (
    <Card
      className={`relative ${
        tier.highlighted
          ? "bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border-indigo-500"
          : "bg-gray-900 border-gray-800"
      }`}
    >
      {tier.highlighted && (
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-violet-500 border-transparent text-white">
          Most Popular
        </Badge>
      )}
      <CardHeader>
        <CardTitle className="text-2xl text-white">{tier.name}</CardTitle>
        <CardDescription className="text-gray-400">
          {tier.description}
        </CardDescription>
        <div className="mt-4">
          <span className="text-4xl font-bold text-white">{tier.price}</span>
          {tier.price !== "Free" && (
            <span className="text-gray-400">/month</span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {tier.features.map((feature, i) => (
            <li key={i} className="flex items-start gap-2">
              <Check className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
              <span className="text-gray-300">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button
          className={`w-full ${
            tier.highlighted
              ? "bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white"
              : "bg-gray-800 hover:bg-gray-700 text-white"
          }`}
          asChild
        >
          <Link href="/dashboard">Get Started</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

/* ─── Data ─── */
const features = [
  {
    icon: <Sparkles className="w-6 h-6 text-indigo-400" />,
    title: "AI-Powered Generation",
    description:
      "Advanced AI creates engaging, viral-worthy threads from your ideas in seconds.",
  },
  {
    icon: <Globe className="w-6 h-6 text-violet-400" />,
    title: "Multi-Platform Ready",
    description:
      "Optimized for Twitter/X with formatting that works perfectly across all platforms.",
  },
  {
    icon: <Sliders className="w-6 h-6 text-indigo-400" />,
    title: "Tone Control",
    description:
      "Customize the voice and style of your threads to match your brand perfectly.",
  },
  {
    icon: <Clock className="w-6 h-6 text-violet-400" />,
    title: "Thread History",
    description:
      "Access and reuse your previous threads anytime with our smart history system.",
  },
];

const steps = [
  {
    number: "1",
    title: "Enter Your Idea",
    description:
      "Simply type in your topic or idea — it can be as simple as a few words or a detailed concept.",
  },
  {
    number: "2",
    title: "AI Creates Magic",
    description:
      "Our advanced AI analyzes your input and generates an engaging, well-structured thread.",
  },
  {
    number: "3",
    title: "Post & Go Viral",
    description:
      "Copy your thread and post it directly to Twitter/X. Watch the engagement roll in!",
  },
];

const pricingTiers = [
  {
    name: "Free",
    price: "Free",
    description: "Perfect for getting started",
    features: [
      "5 threads per month",
      "Basic AI generation",
      "Standard tone options",
      "Thread history (7 days)",
    ],
  },
  {
    name: "Pro",
    price: "$19",
    description: "For serious content creators",
    features: [
      "Unlimited threads",
      "Advanced AI generation",
      "Custom tone control",
      "Unlimited thread history",
      "Priority support",
      "Analytics dashboard",
    ],
    highlighted: true,
  },
];

/* ─── Landing Page ─── */
export default function LandingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) router.push("/dashboard");
  }, [session, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-gray-500 animate-pulse">Loading...</div>
      </div>
    );
  }

  const handleSignIn = () => signIn("google", { callbackUrl: "/dashboard" });

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* ─── Navbar ─── */}
      <nav className="fixed top-0 w-full z-50 border-b border-gray-800/50 bg-gray-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">ThreadCraft AI</span>
          </div>
          <Button
            onClick={handleSignIn}
            className="bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white"
          >
            Sign in with Google
          </Button>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden pt-16">
        {/* Background gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-violet-500/10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-gray-950 to-gray-950" />
        {/* Dot grid */}
        <div className="absolute inset-0 dot-grid opacity-[0.06] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-32">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-6 bg-indigo-500/10 text-indigo-400 border-indigo-500/20">
              <Sparkles className="w-3 h-3 mr-1" />
              Powered by Advanced AI
            </Badge>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-[1.1] tracking-tight">
              <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-400 bg-clip-text text-transparent">
                Turn any idea into a viral Twitter thread
              </span>{" "}
              <span className="text-white">in seconds</span>
            </h1>

            <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              Stop staring at a blank screen. Let ThreadCraft AI transform your
              thoughts into engaging, viral-worthy Twitter threads that capture
              attention and drive engagement.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white text-lg px-8 h-12"
                asChild
              >
                <Link href="/dashboard">
                  Get Started Free
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-gray-700 hover:bg-gray-900 text-white text-lg px-8 h-12"
              >
                See Examples
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-mono text-indigo-400 tracking-widest uppercase mb-3">
              Features
            </p>
            <h2 className="text-4xl font-bold mb-4">Powerful Features</h2>
            <p className="text-xl text-gray-400">
              Everything you need to create viral content
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <FeatureCard key={i} {...f} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-mono text-indigo-400 tracking-widest uppercase mb-3">
              Process
            </p>
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-gray-400">
              Three simple steps to viral content
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {steps.map((s, i) => (
              <StepCard key={i} {...s} />
            ))}
            {/* Connecting line */}
            <div className="hidden md:block absolute top-8 left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-indigo-500 to-violet-500 opacity-30" />
          </div>
        </div>
      </section>

      {/* ─── Pricing ─── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-mono text-indigo-400 tracking-widest uppercase mb-3">
              Pricing
            </p>
            <h2 className="text-4xl font-bold mb-4">Simple Pricing</h2>
            <p className="text-xl text-gray-400">
              Choose the plan that works for you
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {pricingTiers.map((tier, i) => (
              <PricingCard key={i} tier={tier} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6 tracking-tight">
            Ready to craft your{" "}
            <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
              next viral thread?
            </span>
          </h2>
          <p className="text-gray-400 text-lg mb-10">
            Join thousands of creators who write smarter, not harder.
          </p>
          <Button
            size="lg"
            className="bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white text-lg px-10 h-12"
            asChild
          >
            <Link href="/dashboard">
              Get Started Free
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-gray-800 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">ThreadCraft AI</span>
              </div>
              <p className="text-gray-400 max-w-md">
                Transform your ideas into viral Twitter threads with the power
                of AI. Create engaging content in seconds.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a
                    href="#"
                    className="hover:text-indigo-400 transition-colors"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-indigo-400 transition-colors"
                  >
                    Pricing
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-indigo-400 transition-colors"
                  >
                    Examples
                  </a>
                </li>
                <li>
                  <Link
                    href="/dashboard"
                    className="hover:text-indigo-400 transition-colors"
                  >
                    Dashboard
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a
                    href="#"
                    className="hover:text-indigo-400 transition-colors"
                  >
                    About
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-indigo-400 transition-colors"
                  >
                    Blog
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-indigo-400 transition-colors"
                  >
                    Privacy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-indigo-400 transition-colors"
                  >
                    Terms
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-800 text-center text-gray-500 text-sm font-mono">
            &copy; 2026 ThreadCraft AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
