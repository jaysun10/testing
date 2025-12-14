import { motion } from "framer-motion";
import { Zap, Github, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-card/50 backdrop-blur-sm">
      <div className="container mx-auto px-6 py-8">
        <motion.div
          className="flex flex-col items-center justify-between gap-4 md:flex-row"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Zap className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold">WebPulse Analytics</span>
          </div>

          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <span>Built with</span>
            <Heart className="h-4 w-4 text-red-500" />
            <span>using React + Node.js</span>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Website Performance Monitoring Tool</span>
          </div>
        </motion.div>

        <motion.div
          className="mt-6 border-t pt-6 text-center text-xs text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <p>Final Year Project - Website Performance Monitoring Dashboard</p>
          <p className="mt-1">Powered by Google Analytics 4 Integration</p>
        </motion.div>
      </div>
    </footer>
  );
}
