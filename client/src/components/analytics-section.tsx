import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  Users, 
  Eye, 
  MousePointerClick, 
  Clock,
  Globe,
  Smartphone,
  Monitor as MonitorIcon,
  Tablet
} from "lucide-react";

export function AnalyticsSection() {
  const analyticsData = {
    pageViews: "1,234",
    sessions: "892",
    bounceRate: "42%",
    avgSessionDuration: "2m 34s",
  };

  const deviceBreakdown = [
    { device: "Desktop", percentage: 58, icon: MonitorIcon },
    { device: "Mobile", percentage: 35, icon: Smartphone },
    { device: "Tablet", percentage: 7, icon: Tablet },
  ];

  const metrics = [
    {
      label: "Page Views",
      value: analyticsData.pageViews,
      icon: Eye,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      change: "+12%",
      positive: true,
    },
    {
      label: "Sessions",
      value: analyticsData.sessions,
      icon: Users,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
      change: "+8%",
      positive: true,
    },
    {
      label: "Bounce Rate",
      value: analyticsData.bounceRate,
      icon: MousePointerClick,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
      change: "-3%",
      positive: true,
    },
    {
      label: "Avg. Session",
      value: analyticsData.avgSessionDuration,
      icon: Clock,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      change: "+5%",
      positive: true,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.7 }}
    >
      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Google Analytics Integration</CardTitle>
              <p className="text-sm text-muted-foreground">Real-time visitor metrics</p>
            </div>
          </div>
          <Badge variant="secondary" className="gap-1">
            <Globe className="h-3 w-3" />
            GA4 Connected
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {metrics.map((metric, index) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                className="rounded-lg border p-4"
              >
                <div className="flex items-center justify-between">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${metric.bgColor}`}>
                    <metric.icon className={`h-5 w-5 ${metric.color}`} />
                  </div>
                  <Badge 
                    variant="secondary" 
                    className={metric.positive ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600"}
                  >
                    {metric.change}
                  </Badge>
                </div>
                <p className="mt-3 text-2xl font-bold">{metric.value}</p>
                <p className="text-sm text-muted-foreground">{metric.label}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-6">
            <h4 className="mb-4 text-sm font-medium text-muted-foreground">Device Breakdown</h4>
            <div className="space-y-3">
              {deviceBreakdown.map((item, index) => (
                <motion.div
                  key={item.device}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1 + index * 0.1 }}
                  className="flex items-center gap-4"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/50">
                    <item.icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-sm">
                      <span>{item.device}</span>
                      <span className="font-medium">{item.percentage}%</span>
                    </div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
                      <motion.div
                        className="h-full rounded-full bg-primary"
                        initial={{ width: 0 }}
                        animate={{ width: `${item.percentage}%` }}
                        transition={{ duration: 0.8, delay: 1.2 + index * 0.1 }}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Data powered by Google Analytics 4 (GA4) - Tracking ID: G-NYCKHTWJJY
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
