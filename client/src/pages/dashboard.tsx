import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { UrlChecker } from "@/components/url-checker";
import { PerformanceScore } from "@/components/performance-score";
import { MetricsGrid } from "@/components/metrics-grid";
import { PerformanceHistory } from "@/components/performance-history";
import { MonitoredWebsites } from "@/components/monitored-websites";
import { AnalyticsSection } from "@/components/analytics-section";
import { type WebsiteCheckResult, type MonitoredWebsite } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useQuery, useMutation } from "@tanstack/react-query";

export default function Dashboard() {
  const [currentResult, setCurrentResult] = useState<WebsiteCheckResult | null>(null);
  const [previousScore, setPreviousScore] = useState<number | undefined>(undefined);

  const { data: websites = [] } = useQuery<MonitoredWebsite[]>({
    queryKey: ["/api/websites"],
  });

  const { data: checkHistory = [] } = useQuery<WebsiteCheckResult[]>({
    queryKey: ["/api/history"],
  });

  const removeWebsiteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/websites/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/websites"] });
    },
  });

  const refreshWebsiteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest<MonitoredWebsite>("POST", `/api/websites/${id}/refresh`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/websites"] });
    },
  });

  const handleCheckResult = useCallback((result: WebsiteCheckResult) => {
    if (currentResult) {
      setPreviousScore(currentResult.performanceScore);
    }
    setCurrentResult(result);
    // Invalidate history to fetch latest from backend
    queryClient.invalidateQueries({ queryKey: ["/api/history"] });
  }, [currentResult]);

  const handleAddWebsite = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["/api/websites"] });
  }, []);

  const handleRemoveWebsite = useCallback((id: string) => {
    removeWebsiteMutation.mutate(id);
  }, [removeWebsiteMutation]);

  const handleRefreshWebsite = useCallback(async (id: string) => {
    await refreshWebsiteMutation.mutateAsync(id);
  }, [refreshWebsiteMutation]);

  const handleSelectWebsite = useCallback((website: MonitoredWebsite) => {
    if (website.lastCheck) {
      setCurrentResult(website.lastCheck);
    }
  }, []);

  // Combine check history from backend with current website's history
  const displayHistory = currentResult 
    ? checkHistory.filter(h => h.url === currentResult.url)
    : checkHistory;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="flex-1">
        <div className="container mx-auto space-y-8 px-6 py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Website Performance Monitoring
            </h2>
            <p className="mt-2 text-muted-foreground">
              Analyze website speed, track uptime, and monitor performance metrics in real-time
            </p>
          </motion.div>

          <UrlChecker onResult={handleCheckResult} />

          <AnimatePresence mode="wait">
            {currentResult && (
              <motion.div
                key={currentResult.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="grid gap-6 lg:grid-cols-3">
                  <PerformanceScore 
                    result={currentResult} 
                    previousScore={previousScore} 
                  />
                  <div className="lg:col-span-1">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 }}
                      className="rounded-xl border bg-gradient-to-br from-primary/5 to-primary/10 p-6"
                    >
                      <h3 className="text-lg font-semibold">Quick Summary</h3>
                      <div className="mt-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">URL</span>
                          <span className="text-sm font-medium truncate max-w-[180px]">{currentResult.url}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Status</span>
                          <span className={`text-sm font-medium ${currentResult.status === 'online' ? 'text-emerald-500' : 'text-red-500'}`}>
                            {currentResult.status === 'online' ? 'Online' : 'Offline'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Response Time</span>
                          <span className="text-sm font-medium">{currentResult.loadTime}ms</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Checked</span>
                          <span className="text-sm font-medium">
                            {new Date(currentResult.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>

                <MetricsGrid result={currentResult} />
              </motion.div>
            )}
          </AnimatePresence>

          <PerformanceHistory history={displayHistory} />

          <MonitoredWebsites
            websites={websites}
            onAdd={handleAddWebsite}
            onRemove={handleRemoveWebsite}
            onRefresh={handleRefreshWebsite}
            onSelect={handleSelectWebsite}
          />

          <AnalyticsSection />
        </div>
      </main>

      <Footer />
    </div>
  );
}
