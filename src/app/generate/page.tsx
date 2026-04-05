"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCompletion } from "@ai-sdk/react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Copy,
  Check,
  Sparkles,
  Save,
  ArrowLeft,
  RefreshCw,
  BarChart3,
} from "lucide-react";
import ViralScore, { type ViralAnalysis } from "@/components/viral-score";
import StylePicker from "@/components/style-picker";
import { useToast } from "@/components/toast";

/* ─── Types ─── */
interface Tweet {
  position: number;
  content: string;
  type: "hook" | "value" | "cta";
}

type Tone = "professional" | "casual" | "viral" | "educational";
type ThreadLength = 5 | 8 | 10;

/* ─── Character Counter Ring ─── */
function CharRing({ count, max = 280 }: { count: number; max?: number }) {
  const pct = Math.min(count / max, 1);
  const radius = 14;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - pct * circumference;
  const color =
    count > max
      ? "text-red-500"
      : count > 250
      ? "text-yellow-500"
      : "text-indigo-400";

  return (
    <div className="flex items-center gap-2">
      <svg width="36" height="36" className={color}>
        <circle
          cx="18"
          cy="18"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          opacity={0.15}
        />
        <circle
          cx="18"
          cy="18"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 18 18)"
          className="transition-all duration-200"
        />
      </svg>
      <span
        className={`text-sm font-mono ${
          count > max
            ? "text-red-500 font-bold"
            : count > 250
            ? "text-yellow-500"
            : "text-gray-500"
        }`}
      >
        {count}/{max}
      </span>
    </div>
  );
}

/* ─── Animation variants ─── */
const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: i * 0.1,
      duration: 0.4,
      ease: "easeOut" as const,
    },
  }),
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
};

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

/* ─── Page ─── */
export default function GeneratePage() {
  const { status } = useSession();
  const router = useRouter();

  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState<Tone>("professional");
  const [threadLength, setThreadLength] = useState<ThreadLength>(5);
  const [style, setStyle] = useState("storytelling");

  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);

  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState(false);

  // Viral score state
  const [viralScore, setViralScore] = useState<ViralAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Track parsed line count to avoid re-parsing
  const parsedLinesRef = useRef(0);
  const { toast } = useToast();

  /* ─── Streaming with useCompletion ─── */
  const {
    completion,
    complete,
    isLoading,
    error: completionError,
  } = useCompletion({
    api: "/api/generate",
    onFinish: (_prompt, completion) => {
      // Parse final completion before stopping stream
      if (completion) {
        parseFinalTweets(completion);
      }
      setIsStreaming(false);
    },
    onError: () => {
      setIsStreaming(false);
    },
  });

  /* ─── NDJSON parsing helper ─── */
  const parseTweetsFromText = useCallback((text: string): Tweet[] => {
    if (!text) return [];
    const lines = text.split("\n").filter((l) => l.trim());
    const parsed: Tweet[] = [];
    for (const line of lines) {
      try {
        const obj = JSON.parse(line);
        if (obj.position && obj.content && obj.type) {
          parsed.push(obj as Tweet);
        }
      } catch {
        // skip incomplete lines
      }
    }
    return parsed;
  }, []);

  /* ─── Final parse on completion ─── */
  const parseFinalTweets = useCallback((text: string) => {
    const allTweets = parseTweetsFromText(text);
    if (allTweets.length > 0) {
      setTweets(allTweets);
    }
  }, [parseTweetsFromText]);

  /* ─── Progressive NDJSON parsing ─── */
  const parseStreamedTweets = useCallback((text: string) => {
    if (!text) return;
    const lines = text.split("\n").filter((l) => l.trim());
    if (lines.length <= parsedLinesRef.current) return;

    const newTweets: Tweet[] = [];
    for (let i = parsedLinesRef.current; i < lines.length; i++) {
      try {
        const parsed = JSON.parse(lines[i]);
        if (parsed.position && parsed.content && parsed.type) {
          newTweets.push(parsed as Tweet);
        }
      } catch {
        // Incomplete JSON line — skip, will be parsed next tick
      }
    }

    if (newTweets.length > 0) {
      parsedLinesRef.current = lines.length;
      setTweets((prev) => {
        const existing = new Set(prev.map((t) => t.position));
        const unique = newTweets.filter((t) => !existing.has(t.position));
        return [...prev, ...unique];
      });
    }
  }, []);

  // Parse as completion streams in
  useEffect(() => {
    if (completion) {
      parseStreamedTweets(completion);
    }
  }, [completion, parseStreamedTweets]);

  // Auto-trigger viral score when streaming finishes
  useEffect(() => {
    if (!isLoading && !isStreaming && tweets.length > 0 && showResults && !viralScore && !isAnalyzing) {
      analyzeThread(tweets);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, isStreaming, tweets.length, showResults]);

  if (status === "unauthenticated") {
    router.push("/");
    return null;
  }

  /* ─── Generate / Regenerate ─── */
  const handleGenerate = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setTweets([]);
    setSaved(false);
    setViralScore(null);
    setIsStreaming(true);
    setShowResults(true);
    parsedLinesRef.current = 0;

    await complete("", {
      body: { topic, tone, threadLength, style },
    });
  };

  const handleRegenerate = () => handleGenerate();

  /* ─── Analyze viral score ─── */
  const analyzeThread = async (threadTweets: Tweet[]) => {
    setIsAnalyzing(true);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tweets: threadTweets, topic }),
      });
      if (res.ok) {
        const data: ViralAnalysis = await res.json();
        setViralScore(data);
      }
    } catch {
      // Score is optional — fail silently
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleTweetChange = (position: number, content: string) => {
    setTweets((prev) =>
      prev.map((t) => (t.position === position ? { ...t, content } : t))
    );
  };

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedStates((prev) => ({ ...prev, [id]: true }));
    setTimeout(
      () => setCopiedStates((prev) => ({ ...prev, [id]: false })),
      2000
    );
    if (id === "full-thread") toast("Full thread copied to clipboard");
  };

  const copyFullThread = () => {
    const full = tweets
      .map((t) => `${t.position}/${tweets.length}\n${t.content}`)
      .join("\n\n");
    copyToClipboard(full, "full-thread");
  };

  const saveToHistory = async () => {
    try {
      const res = await fetch("/api/threads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: topic,
          content: tweets,
          platform: "twitter",
          tone,
          style,
          viralScore: viralScore?.totalScore ?? undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save");
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      toast("Thread saved to history");
    } catch {
      // Fallback to localStorage if API fails
      if (typeof window !== "undefined") {
        const item = { id: Date.now().toString(), topic, tweets, createdAt: new Date().toISOString() };
        let history: unknown[] = [];
        try { history = JSON.parse(localStorage.getItem("threadHistory") || "[]"); } catch { /* corrupted */ }
        history.unshift(item);
        localStorage.setItem("threadHistory", JSON.stringify(history));
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      toast("Saved locally (offline mode)", "warning");
    }
  };

  const resetForm = () => {
    setShowResults(false);
    setTweets([]);
    setSaved(false);
    setViralScore(null);
    parsedLinesRef.current = 0;
  };

  /* ─── Results view (streaming + complete) ─── */
  if (showResults) {
    return (
      <div>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex justify-between items-start"
        >
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {isStreaming ? "Generating Thread..." : "Generated Thread"}
            </h1>
            <p className="text-gray-400">
              {isStreaming ? (
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                  Tweets appearing as AI writes them...
                </span>
              ) : (
                "Edit your tweets below, then copy or save."
              )}
            </p>
            {isStreaming && (
              <p className="text-xs text-gray-600 mt-1 font-mono">
                {tweets.length}/{threadLength} tweets received
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleRegenerate}
              disabled={isStreaming}
              variant="outline"
              className="border-indigo-500/50 text-indigo-400 hover:bg-indigo-500/10 hover:text-indigo-300 disabled:opacity-40"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isStreaming ? "animate-spin" : ""}`} />
              {isStreaming ? "Streaming..." : "Regenerate"}
            </Button>
            <Button
              onClick={resetForm}
              variant="outline"
              className="border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              New Thread
            </Button>
          </div>
        </motion.div>

        {/* Tweet cards with stagger animation */}
        <AnimatePresence mode="wait">
          <motion.div
            key="tweet-list"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-4 mb-8"
          >
            {tweets.map((tweet, index) => {
              const typeLabel =
                tweet.type === "hook"
                  ? "Hook"
                  : tweet.type === "cta"
                  ? "CTA"
                  : "Value";

              return (
                <motion.div
                  key={tweet.position}
                  custom={index}
                  variants={cardVariants}
                  layout
                >
                  <Card className="bg-gray-900 border-gray-800 p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-400">
                          Tweet {tweet.position}/{tweets.length}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            tweet.type === "hook"
                              ? "bg-amber-500/10 text-amber-400"
                              : tweet.type === "cta"
                              ? "bg-emerald-500/10 text-emerald-400"
                              : "bg-indigo-500/10 text-indigo-400"
                          }`}
                        >
                          {typeLabel}
                        </span>
                      </div>
                    </div>

                    <Textarea
                      value={tweet.content}
                      onChange={(e) =>
                        handleTweetChange(tweet.position, e.target.value)
                      }
                      className="min-h-[100px] bg-gray-950 border-gray-700 text-white resize-none mb-3"
                    />

                    <div className="flex justify-between items-center">
                      <CharRing count={tweet.content.length} />
                      <Button
                        onClick={() =>
                          copyToClipboard(
                            tweet.content,
                            `tweet-${tweet.position}`
                          )
                        }
                        size="sm"
                        className="bg-gray-800 hover:bg-gray-700 text-gray-300"
                      >
                        {copiedStates[`tweet-${tweet.position}`] ? (
                          <>
                            <Check className="w-4 h-4 mr-1" /> Copied
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 mr-1" /> Copy
                          </>
                        )}
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>

        {/* Streaming skeletons for remaining tweets */}
        {isStreaming && tweets.length < threadLength && (
          <div className="space-y-4 mt-4">
            {Array.from({ length: threadLength - tweets.length }).map((_, i) => (
              <motion.div
                key={`skeleton-${i}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="bg-gray-900/50 border-gray-800/50 border-dashed p-6">
                  <Skeleton className="h-4 w-24 mb-4" />
                  <Skeleton className="h-16 w-full mb-3" />
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Viral Score */}
        <div className="mb-8">
          {isAnalyzing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-gray-900 border border-gray-800 rounded-xl p-8"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                <span className="text-gray-400 text-sm">
                  Analyzing viral potential...
                </span>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Skeleton className="h-52 rounded-lg" />
                <div className="space-y-4">
                  <Skeleton className="h-16" />
                  <Skeleton className="h-16" />
                  <Skeleton className="h-16" />
                  <Skeleton className="h-16" />
                </div>
              </div>
            </motion.div>
          )}

          {viralScore && !isAnalyzing && (
            <div className="space-y-3">
              <ViralScore analysis={viralScore} />
              <div className="flex justify-end">
                <Button
                  onClick={() => analyzeThread(tweets)}
                  size="sm"
                  variant="outline"
                  className="border-gray-700 text-gray-400 hover:text-indigo-400 hover:border-indigo-500/50"
                >
                  <BarChart3 className="w-4 h-4 mr-1" />
                  Re-analyze
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: tweets.length * 0.1 + 0.2 }}
          className="flex gap-4"
        >
          <Button
            onClick={copyFullThread}
            className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white"
            size="lg"
          >
            {copiedStates["full-thread"] ? (
              <>
                <Check className="w-5 h-5 mr-2" /> Copied Full Thread
              </>
            ) : (
              <>
                <Copy className="w-5 h-5 mr-2" /> Copy Full Thread
              </>
            )}
          </Button>
          <Button
            onClick={saveToHistory}
            variant="outline"
            className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-800"
            size="lg"
          >
            {saved ? (
              <>
                <Check className="w-5 h-5 mr-2" /> Saved!
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" /> Save to History
              </>
            )}
          </Button>
        </motion.div>
      </div>
    );
  }

  /* ─── Form view ─── */
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-4xl"
    >
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="w-7 h-7 text-indigo-400" />
          <h1 className="text-3xl font-bold text-white">Generate Thread</h1>
        </div>
        <p className="text-gray-400">
          Describe your topic and let AI craft the perfect thread.
        </p>
      </div>

      {completionError && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
        >
          {completionError.message}
        </motion.div>
      )}

      <Card className="bg-gray-900 border-gray-800 p-8">
        <form onSubmit={handleGenerate} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="topic" className="text-white text-base">
              Topic / Prompt
            </Label>
            <Textarea
              id="topic"
              placeholder="e.g. 10 tips for improving developer productivity..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="min-h-[120px] bg-gray-950 border-gray-700 text-white"
              required
              minLength={3}
              maxLength={500}
            />
            <p className="text-xs text-gray-600 text-right">
              {topic.length}/500
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tone" className="text-white text-base">
              Tone
            </Label>
            <Select value={tone} onValueChange={(v) => setTone(v as Tone)}>
              <SelectTrigger className="bg-gray-950 border-gray-700 text-white w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="casual">Casual</SelectItem>
                <SelectItem value="viral">Viral</SelectItem>
                <SelectItem value="educational">Educational</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label className="text-white text-base">Thread Length</Label>
            <div className="flex gap-3">
              {([5, 8, 10] as const).map((len) => (
                <button
                  key={len}
                  type="button"
                  onClick={() => setThreadLength(len)}
                  className={`flex-1 py-3 rounded-lg text-sm font-medium border transition-all ${
                    threadLength === len
                      ? "bg-indigo-600 border-indigo-500 text-white"
                      : "bg-gray-950 border-gray-700 text-gray-400 hover:border-gray-500"
                  }`}
                >
                  {len} tweets
                </button>
              ))}
            </div>
          </div>

          {/* Thread Style */}
          <div className="space-y-3">
            <Label className="text-white text-base">Thread Style</Label>
            <StylePicker value={style} onChange={setStyle} />
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white"
            size="lg"
            disabled={topic.length < 3}
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Generate Thread
          </Button>
        </form>
      </Card>
    </motion.div>
  );
}
