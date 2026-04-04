"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  Target,
  MessageSquare,
  Palette,
  Sparkles,
  Trophy,
} from "lucide-react";

/* ─── Types ─── */
interface AnalyticsData {
  totalThreads: number;
  avgViralScore: number;
  mostUsedTone: string;
  mostUsedStyle: string;
  threadsPerDay: { date: string; fullDate: string; threads: number }[];
  topThreads: {
    id: string;
    title: string;
    viralScore: number | null;
    tone: string;
    style: string;
    date: string;
  }[];
}

/* ─── Stat Card ─── */
function StatCard({
  title,
  value,
  icon,
  description,
  index,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
    >
      <Card className="bg-gray-900 border-gray-800 p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-400">{title}</p>
            <h3 className="text-3xl font-bold text-white mt-2">{value}</h3>
            {description && (
              <p className="text-xs text-gray-500 mt-1">{description}</p>
            )}
          </div>
          <div className="bg-indigo-500/10 p-3 rounded-lg">
            <div className="text-indigo-400">{icon}</div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

/* ─── Score color ─── */
function scoreColor(score: number | null) {
  if (!score) return "bg-gray-500/10 text-gray-400 border-gray-500/20";
  if (score >= 80) return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
  if (score >= 60) return "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
  if (score >= 40) return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
  return "bg-red-500/10 text-red-400 border-red-500/20";
}

function capitalizeFirst(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/* ─── Page ─── */
export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
      return;
    }
    if (status === "authenticated") {
      fetch("/api/analytics")
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => d && setAnalytics(d))
        .catch(() => {})
        .finally(() => setIsLoading(false));
    }
  }, [status, router]);

  if (isLoading || status === "loading") {
    return (
      <div>
        <Skeleton className="h-10 w-64 mb-2" />
        <Skeleton className="h-5 w-96 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="bg-gray-900 border-gray-800 p-6">
              <Skeleton className="h-4 w-32 mb-3" />
              <Skeleton className="h-8 w-20 mb-2" />
              <Skeleton className="h-3 w-24" />
            </Card>
          ))}
        </div>
        <Card className="bg-gray-900 border-gray-800 p-6">
          <Skeleton className="h-6 w-48 mb-4" />
          <Skeleton className="h-[300px] w-full" />
        </Card>
      </div>
    );
  }

  const data = analytics;

  /* ─── Empty state ─── */
  if (!data || data.totalThreads === 0) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-gray-400 mb-8">
          Welcome, {session?.user?.name ?? "User"}
        </p>
        <Card className="bg-gray-900 border-gray-800 p-12 text-center">
          <MessageSquare className="w-12 h-12 text-gray-700 mx-auto mb-4" />
          <p className="text-gray-500 text-lg mb-2">No data yet</p>
          <p className="text-gray-600 text-sm mb-6">
            Generate your first thread to see analytics here.
          </p>
          <Button
            asChild
            className="bg-indigo-600 hover:bg-indigo-500 text-white"
          >
            <Link href="/generate">
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Thread
            </Link>
          </Button>
        </Card>
      </div>
    );
  }

  const stats = [
    {
      title: "Total Threads",
      value: data.totalThreads,
      icon: <MessageSquare className="w-6 h-6" />,
    },
    {
      title: "Avg Viral Score",
      value: data.avgViralScore ? `${data.avgViralScore}/100` : "N/A",
      icon: <TrendingUp className="w-6 h-6" />,
    },
    {
      title: "Top Tone",
      value: capitalizeFirst(data.mostUsedTone),
      icon: <Target className="w-6 h-6" />,
    },
    {
      title: "Top Style",
      value: capitalizeFirst(data.mostUsedStyle),
      icon: <Palette className="w-6 h-6" />,
    },
  ];

  return (
    <div>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-gray-400">
          Welcome back, {session?.user?.name ?? "User"} — here&apos;s your
          thread performance.
        </p>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, i) => (
          <StatCard key={stat.title} index={i} {...stat} />
        ))}
      </div>

      {/* Line Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="bg-gray-900 border-gray-800 p-6 mb-8">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-white">Threads Per Day</h2>
            <p className="text-sm text-gray-400 mt-1">Last 7 days activity</p>
          </div>
          <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.threadsPerDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis
                  dataKey="date"
                  stroke="#6b7280"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#6b7280"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#111827",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "13px",
                  }}
                  labelStyle={{ color: "#9ca3af" }}
                />
                <Line
                  type="monotone"
                  dataKey="threads"
                  stroke="#818cf8"
                  strokeWidth={3}
                  dot={{ fill: "#818cf8", r: 4, strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: "#6366f1" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </motion.div>

      {/* Top Threads Leaderboard */}
      {data.topThreads.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              Top Performing Threads
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              Highest viral scores
            </p>
          </div>
          <div className="space-y-3">
            {data.topThreads.map((thread, index) => (
              <motion.div
                key={thread.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className="flex items-center justify-between p-4 bg-gray-900 border border-gray-800 rounded-lg hover:border-gray-700 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                      index === 0
                        ? "bg-amber-500/10 text-amber-400"
                        : index === 1
                        ? "bg-gray-400/10 text-gray-300"
                        : "bg-orange-500/10 text-orange-400"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-medium truncate">
                      {thread.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500">
                        {thread.date}
                      </span>
                      <span className="text-xs text-gray-600">·</span>
                      <span className="text-xs text-gray-500">
                        {capitalizeFirst(thread.style)}
                      </span>
                    </div>
                  </div>
                </div>
                <Badge
                  className={`${scoreColor(thread.viralScore)} border ml-4`}
                >
                  {thread.viralScore ?? "—"}/100
                </Badge>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Quick Action */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-8"
      >
        <Button
          asChild
          className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white"
          size="lg"
        >
          <Link href="/generate">
            <Sparkles className="w-5 h-5 mr-2" />
            Generate New Thread
          </Link>
        </Button>
      </motion.div>
    </div>
  );
}
