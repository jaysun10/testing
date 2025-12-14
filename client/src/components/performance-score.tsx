import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { getPerformanceGrade, type WebsiteCheckResult } from "@shared/schema";
import { Zap, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface PerformanceScoreProps {
  result: WebsiteCheckResult;
  previousScore?: number;
}

export function PerformanceScore({ result, previousScore }: PerformanceScoreProps) {
  const [displayScore, setDisplayScore] = useState(0);
  const { grade, color, label } = getPerformanceGrade(result.performanceScore);

  const scoreDiff = previousScore !== undefined ? result.performanceScore - previousScore : 0;

  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const increment = result.performanceScore / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= result.performanceScore) {
        setDisplayScore(result.performanceScore);
        clearInterval(timer);
      } else {
        setDisplayScore(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [result.performanceScore]);

  const circumference = 2 * Math.PI * 120;
  const strokeDashoffset = circumference - (displayScore / 100) * circumference;

  const getStrokeColor = () => {
    if (displayScore >= 80) return "stroke-emerald-500";
    if (displayScore >= 60) return "stroke-yellow-500";
    if (displayScore >= 40) return "stroke-orange-500";
    return "stroke-red-500";
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="col-span-full lg:col-span-2"
    >
      <Card className="overflow-hidden">
        <CardContent className="p-8">
          <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between">
            <div className="relative">
              <svg className="h-64 w-64 -rotate-90 transform" viewBox="0 0 280 280">
                <circle
                  cx="140"
                  cy="140"
                  r="120"
                  stroke="currentColor"
                  strokeWidth="16"
                  fill="transparent"
                  className="text-muted/30"
                />
                <motion.circle
                  cx="140"
                  cy="140"
                  r="120"
                  strokeWidth="16"
                  fill="transparent"
                  strokeLinecap="round"
                  className={getStrokeColor()}
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  style={{
                    strokeDasharray: circumference,
                  }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span
                  className="text-6xl font-bold"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  {displayScore}
                </motion.span>
                <span className="text-lg text-muted-foreground">out of 100</span>
              </div>
            </div>

            <div className="flex flex-col items-center gap-4 md:items-start">
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                  <Zap className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Performance Grade</p>
                  <p className={`text-4xl font-bold ${color}`}>{grade}</p>
                </div>
              </div>

              <div className="rounded-lg bg-muted/50 px-4 py-2">
                <p className={`text-lg font-semibold ${color}`}>{label}</p>
              </div>

              {scoreDiff !== 0 && (
                <div className="flex items-center gap-2">
                  {scoreDiff > 0 ? (
                    <TrendingUp className="h-5 w-5 text-emerald-500" />
                  ) : scoreDiff < 0 ? (
                    <TrendingDown className="h-5 w-5 text-red-500" />
                  ) : (
                    <Minus className="h-5 w-5 text-muted-foreground" />
                  )}
                  <span className={scoreDiff > 0 ? "text-emerald-500" : scoreDiff < 0 ? "text-red-500" : "text-muted-foreground"}>
                    {scoreDiff > 0 ? "+" : ""}{scoreDiff} from previous
                  </span>
                </div>
              )}

              <div className="mt-2 text-sm text-muted-foreground">
                <p className="truncate max-w-xs">{result.url}</p>
                <p className="text-xs">{new Date(result.timestamp).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
