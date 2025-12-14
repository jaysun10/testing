import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { Clock, TrendingUp, Activity } from "lucide-react";
import { type WebsiteCheckResult } from "@shared/schema";

interface PerformanceHistoryProps {
  history: WebsiteCheckResult[];
}

export function PerformanceHistory({ history }: PerformanceHistoryProps) {
  const chartData = history.slice(-20).map((check, index) => ({
    name: new Date(check.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    loadTime: check.loadTime,
    score: check.performanceScore,
    index,
  }));

  const avgLoadTime = history.length > 0 
    ? Math.round(history.reduce((acc, h) => acc + h.loadTime, 0) / history.length) 
    : 0;

  const avgScore = history.length > 0 
    ? Math.round(history.reduce((acc, h) => acc + h.performanceScore, 0) / history.length) 
    : 0;

  const uptime = history.length > 0
    ? Math.round((history.filter(h => h.status === "online").length / history.length) * 100)
    : 0;

  if (history.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
    >
      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4 pb-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Activity className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Performance History</CardTitle>
              <p className="text-sm text-muted-foreground">Last {history.length} checks</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Badge variant="secondary" className="gap-1">
              <Clock className="h-3 w-3" />
              Avg: {avgLoadTime}ms
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <TrendingUp className="h-3 w-3" />
              Score: {avgScore}%
            </Badge>
            <Badge 
              variant="secondary" 
              className={`gap-1 ${uptime >= 99 ? "bg-emerald-500/10 text-emerald-600" : uptime >= 95 ? "bg-yellow-500/10 text-yellow-600" : "bg-red-500/10 text-red-600"}`}
            >
              Uptime: {uptime}%
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="loadTimeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  className="text-muted-foreground"
                />
                <YAxis 
                  yAxisId="left"
                  tick={{ fontSize: 12 }}
                  className="text-muted-foreground"
                  label={{ value: 'Load Time (ms)', angle: -90, position: 'insideLeft', fontSize: 12 }}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  domain={[0, 100]}
                  tick={{ fontSize: 12 }}
                  className="text-muted-foreground"
                  label={{ value: 'Score (%)', angle: 90, position: 'insideRight', fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="loadTime"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fill="url(#loadTimeGradient)"
                  name="Load Time (ms)"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="score"
                  stroke="hsl(var(--chart-2))"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--chart-2))', strokeWidth: 2 }}
                  name="Score (%)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
