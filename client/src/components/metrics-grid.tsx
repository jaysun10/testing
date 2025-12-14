import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  Activity, 
  FileText, 
  Wifi,
  CheckCircle2,
  XCircle,
  Timer,
  Gauge
} from "lucide-react";
import { type WebsiteCheckResult } from "@shared/schema";

interface MetricsGridProps {
  result: WebsiteCheckResult;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function MetricsGrid({ result }: MetricsGridProps) {
  const formatLoadTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const formatBytes = (bytes?: number) => {
    if (!bytes) return "Unknown";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const getLoadTimeColor = (ms: number) => {
    if (ms < 500) return "text-emerald-500";
    if (ms < 1000) return "text-chart-2";
    if (ms < 2000) return "text-yellow-500";
    if (ms < 3000) return "text-orange-500";
    return "text-red-500";
  };

  const metrics = [
    {
      label: "Status",
      value: result.status === "online" ? "Online" : "Offline",
      icon: result.status === "online" ? CheckCircle2 : XCircle,
      color: result.status === "online" ? "text-emerald-500" : "text-red-500",
      bgColor: result.status === "online" ? "bg-emerald-500/10" : "bg-red-500/10",
      badge: result.statusCode?.toString(),
      badgeVariant: result.statusCode === 200 ? "default" : "destructive",
    },
    {
      label: "Load Time",
      value: formatLoadTime(result.loadTime),
      icon: Clock,
      color: getLoadTimeColor(result.loadTime),
      bgColor: "bg-primary/10",
      subtext: result.loadTime < 1000 ? "Fast" : result.loadTime < 2000 ? "Average" : "Slow",
    },
    {
      label: "Content Size",
      value: formatBytes(result.contentLength),
      icon: FileText,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      subtext: result.contentLength ? "Transferred" : "N/A",
    },
    {
      label: "Response",
      value: result.statusCode?.toString() || "N/A",
      icon: Wifi,
      color: result.statusCode === 200 ? "text-emerald-500" : "text-orange-500",
      bgColor: result.statusCode === 200 ? "bg-emerald-500/10" : "bg-orange-500/10",
      subtext: result.statusCode === 200 ? "OK" : result.statusCode ? "Error" : "Failed",
    },
  ];

  const additionalMetrics = [
    {
      label: "TTFB",
      value: result.ttfb ? formatLoadTime(result.ttfb) : "N/A",
      icon: Timer,
      color: "text-cyan-500",
      bgColor: "bg-cyan-500/10",
      subtext: "Time to First Byte",
    },
    {
      label: "Performance",
      value: `${result.performanceScore}%`,
      icon: Gauge,
      color: result.performanceScore >= 80 ? "text-emerald-500" : result.performanceScore >= 60 ? "text-yellow-500" : "text-red-500",
      bgColor: result.performanceScore >= 80 ? "bg-emerald-500/10" : result.performanceScore >= 60 ? "bg-yellow-500/10" : "bg-red-500/10",
      subtext: "Score",
    },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      {[...metrics, ...additionalMetrics].map((metric, index) => (
        <motion.div key={metric.label} variants={itemVariants}>
          <Card className="hover-elevate transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${metric.bgColor}`}>
                  <metric.icon className={`h-6 w-6 ${metric.color}`} />
                </div>
                {metric.badge && (
                  <Badge variant={metric.badgeVariant as any} className="text-xs">
                    {metric.badge}
                  </Badge>
                )}
              </div>
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">{metric.label}</p>
                <p className={`mt-1 text-2xl font-bold ${metric.color}`}>{metric.value}</p>
                {metric.subtext && (
                  <p className="mt-1 text-xs text-muted-foreground">{metric.subtext}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}
