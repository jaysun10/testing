import { Activity, Zap } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { motion } from "framer-motion";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-6">
        <motion.div 
          className="flex items-center gap-3"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Zap className="h-5 w-5 text-primary-foreground" />
            </div>
            <motion.div
              className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-emerald-500"
              animate={{ scale: [1, 1.2, 1], opacity: [1, 0.8, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">WebPulse Analytics</h1>
            <p className="text-xs text-muted-foreground">Performance Monitoring Dashboard</p>
          </div>
        </motion.div>

        <div className="flex items-center gap-4">
          <motion.div 
            className="flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1.5"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <motion.div
              className="h-2 w-2 rounded-full bg-emerald-500"
              animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Live</span>
          </motion.div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
