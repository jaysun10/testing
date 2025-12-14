import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { checkWebsiteSchema, addWebsiteSchema, calculatePerformanceScore, type WebsiteCheckResult } from "@shared/schema";
import { randomUUID } from "crypto";

async function checkWebsitePerformance(url: string): Promise<WebsiteCheckResult> {
  const id = randomUUID();
  const timestamp = new Date().toISOString();
  const start = Date.now();

  try {
    // Use dynamic import for node-fetch compatibility
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'User-Agent': 'WebPulse-Analytics/1.0',
      },
    });

    clearTimeout(timeout);
    const loadTime = Date.now() - start;
    
    // Get content length from headers or body
    let contentLength: number | undefined;
    const contentLengthHeader = response.headers.get('content-length');
    if (contentLengthHeader) {
      contentLength = parseInt(contentLengthHeader, 10);
    } else {
      const text = await response.text();
      contentLength = text.length;
    }

    const performanceScore = calculatePerformanceScore(loadTime, response.status);

    return {
      id,
      url,
      status: "online",
      statusCode: response.status,
      loadTime,
      contentLength,
      timestamp,
      performanceScore,
      ttfb: Math.round(loadTime * 0.3), // Approximate TTFB
    };
  } catch (error: any) {
    const loadTime = Date.now() - start;
    
    return {
      id,
      url,
      status: "offline",
      loadTime,
      error: error.message || "Failed to reach website",
      timestamp,
      performanceScore: 0,
    };
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Check website performance
  app.post("/api/check", async (req, res) => {
    try {
      const parsed = checkWebsiteSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors[0].message });
      }

      const result = await checkWebsitePerformance(parsed.data.url);
      await storage.addCheckResult(result);
      
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  });

  // Get all monitored websites
  app.get("/api/websites", async (req, res) => {
    try {
      const websites = await storage.getWebsites();
      res.json(websites);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  });

  // Add website to monitoring
  app.post("/api/websites", async (req, res) => {
    try {
      const parsed = addWebsiteSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors[0].message });
      }

      const website = await storage.addWebsite(parsed.data.url, parsed.data.name);
      
      // Perform initial check
      const result = await checkWebsitePerformance(parsed.data.url);
      const updatedWebsite = await storage.updateWebsiteCheck(website.id, result);
      
      res.json(updatedWebsite);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  });

  // Remove website from monitoring
  app.delete("/api/websites/:id", async (req, res) => {
    try {
      const success = await storage.removeWebsite(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Website not found" });
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  });

  // Refresh website check
  app.post("/api/websites/:id/refresh", async (req, res) => {
    try {
      const website = await storage.getWebsite(req.params.id);
      if (!website) {
        return res.status(404).json({ error: "Website not found" });
      }

      const result = await checkWebsitePerformance(website.url);
      const updatedWebsite = await storage.updateWebsiteCheck(website.id, result);
      
      res.json(updatedWebsite);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  });

  // Get check history
  app.get("/api/history", async (req, res) => {
    try {
      const url = req.query.url as string | undefined;
      const history = await storage.getCheckHistory(url);
      res.json(history);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  });

  return httpServer;
}
