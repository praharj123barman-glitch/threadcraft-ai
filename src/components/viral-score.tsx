"use client";

import { motion } from "framer-motion";
import {
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";
import { Lightbulb } from "lucide-react";

export interface ScoreBreakdown {
  score: number;
  label: string;
  suggestion: string;
}

export interface ViralAnalysis {
  totalScore: number;
  breakdown: {
    hookStrength: ScoreBreakdown;
    valueDensity: ScoreBreakdown;
    engagementPotential: ScoreBreakdown;
    ctaEffectiveness: ScoreBreakdown;
  };
  overallFeedback: string;
}

function getScoreColor(score: number, max: number) {
  const pct = score / max;
  if (pct >= 0.8) return { text: "text-emerald-400", fill: "#34d399", bg: "bg-emerald-500/10" };
  if (pct >= 0.6) return { text: "text-indigo-400", fill: "#818cf8", bg: "bg-indigo-500/10" };
  if (pct >= 0.4) return { text: "text-yellow-400", fill: "#facc15", bg: "bg-yellow-500/10" };
  return { text: "text-red-400", fill: "#f87171", bg: "bg-red-500/10" };
}

function getGrade(score: number): string {
  if (score >= 90) return "S";
  if (score >= 80) return "A";
  if (score >= 70) return "B";
  if (score >= 60) return "C";
  if (score >= 50) return "D";
  return "F";
}

function CategoryBar({
  item,
  index,
}: {
  item: ScoreBreakdown;
  index: number;
}) {
  const color = getScoreColor(item.score, 25);
  const pct = (item.score / 25) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.8 + index * 0.15, duration: 0.4 }}
      className="space-y-2"
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-300">{item.label}</span>
        <span className={`text-sm font-bold font-mono ${color.text}`}>
          {item.score}/25
        </span>
      </div>
      <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ delay: 1 + index * 0.15, duration: 0.6, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ backgroundColor: color.fill }}
        />
      </div>
      <div className={`flex items-start gap-2 p-3 rounded-lg ${color.bg}`}>
        <Lightbulb className={`w-4 h-4 mt-0.5 flex-shrink-0 ${color.text}`} />
        <p className="text-xs text-gray-300 leading-relaxed">
          {item.suggestion}
        </p>
      </div>
    </motion.div>
  );
}

export default function ViralScore({
  analysis,
}: {
  analysis: ViralAnalysis;
}) {
  const { totalScore, breakdown, overallFeedback } = analysis;
  const scoreColor = getScoreColor(totalScore, 100);
  const grade = getGrade(totalScore);

  const chartData = [
    { name: "score", value: totalScore, fill: scoreColor.fill },
  ];

  const categories = [
    breakdown.hookStrength,
    breakdown.valueDensity,
    breakdown.engagementPotential,
    breakdown.ctaEffectiveness,
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="bg-gray-900 border border-gray-800 rounded-xl p-6"
    >
      <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
        <span className="text-2xl">🔥</span> Viral Score
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Radial chart + grade */}
        <div className="flex flex-col items-center">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5, ease: "easeOut" }}
            className="relative w-52 h-52"
          >
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius="75%"
                outerRadius="100%"
                barSize={12}
                data={chartData}
                startAngle={90}
                endAngle={-270}
              >
                <PolarAngleAxis
                  type="number"
                  domain={[0, 100]}
                  angleAxisId={0}
                  tick={false}
                />
                <RadialBar
                  background={{ fill: "#1f2937" }}
                  dataKey="value"
                  cornerRadius={10}
                  angleAxisId={0}
                />
              </RadialBarChart>
            </ResponsiveContainer>

            {/* Center text overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.span
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8, duration: 0.4 }}
                className={`text-4xl font-bold font-mono ${scoreColor.text}`}
              >
                {totalScore}
              </motion.span>
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="text-xs text-gray-500 uppercase tracking-wider"
              >
                out of 100
              </motion.span>
            </div>
          </motion.div>

          {/* Grade badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            className="mt-4 flex items-center gap-3"
          >
            <span
              className={`text-2xl font-black font-mono px-4 py-1 rounded-lg ${scoreColor.bg} ${scoreColor.text}`}
            >
              {grade}
            </span>
            <span className="text-sm text-gray-400">
              {totalScore >= 80
                ? "Viral potential!"
                : totalScore >= 60
                ? "Good thread"
                : totalScore >= 40
                ? "Needs work"
                : "Major revision needed"}
            </span>
          </motion.div>

          {/* Overall feedback */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3 }}
            className="mt-5 text-sm text-gray-400 text-center leading-relaxed max-w-xs"
          >
            {overallFeedback}
          </motion.p>
        </div>

        {/* Right: Category breakdowns */}
        <div className="space-y-5">
          {categories.map((cat, i) => (
            <CategoryBar key={cat.label} item={cat} index={i} />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
