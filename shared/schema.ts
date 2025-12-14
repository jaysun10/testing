import { pgTable, text, varchar, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { sql } from "drizzle-orm";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Website Performance Check Result
export interface WebsiteCheckResult {
  id: string;
  url: string;
  status: "online" | "offline";
  statusCode?: number;
  loadTime: number;
  contentLength?: number;
  error?: string;
  timestamp: string;
  performanceScore: number;
  ttfb?: number;
  dnsLookup?: number;
}

// Monitored Website
export interface MonitoredWebsite {
  id: string;
  url: string;
  name: string;
  status: "online" | "offline" | "checking";
  lastCheck?: WebsiteCheckResult;
  checkHistory: WebsiteCheckResult[];
  addedAt: string;
}

// Insert schemas for validation
export const checkWebsiteSchema = z.object({
  url: z.string().url("Please enter a valid URL").min(1, "URL is required"),
});

export const addWebsiteSchema = z.object({
  url: z.string().url("Please enter a valid URL").min(1, "URL is required"),
  name: z.string().min(1, "Name is required").max(50, "Name too long"),
});

export type CheckWebsiteInput = z.infer<typeof checkWebsiteSchema>;
export type AddWebsiteInput = z.infer<typeof addWebsiteSchema>;

// Performance grade calculation
export function getPerformanceGrade(score: number): { grade: string; color: string; label: string } {
  if (score >= 90) return { grade: "A+", color: "text-emerald-500", label: "Excellent" };
  if (score >= 80) return { grade: "A", color: "text-emerald-500", label: "Great" };
  if (score >= 70) return { grade: "B", color: "text-chart-2", label: "Good" };
  if (score >= 60) return { grade: "C", color: "text-yellow-500", label: "Fair" };
  if (score >= 50) return { grade: "D", color: "text-orange-500", label: "Poor" };
  return { grade: "F", color: "text-red-500", label: "Critical" };
}

// Calculate performance score from metrics
export function calculatePerformanceScore(loadTime: number, statusCode?: number): number {
  let score = 100;
  
  // Deduct points based on load time
  if (loadTime > 5000) score -= 50;
  else if (loadTime > 3000) score -= 35;
  else if (loadTime > 2000) score -= 25;
  else if (loadTime > 1000) score -= 15;
  else if (loadTime > 500) score -= 5;
  
  // Deduct for non-200 status codes
  if (statusCode && statusCode !== 200) {
    if (statusCode >= 500) score -= 30;
    else if (statusCode >= 400) score -= 20;
    else if (statusCode >= 300) score -= 10;
  }
  
  return Math.max(0, Math.min(100, score));
}
