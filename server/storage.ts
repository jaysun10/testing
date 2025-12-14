import { type User, type InsertUser, type WebsiteCheckResult, type MonitoredWebsite } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Website monitoring
  getWebsites(): Promise<MonitoredWebsite[]>;
  getWebsite(id: string): Promise<MonitoredWebsite | undefined>;
  addWebsite(url: string, name: string): Promise<MonitoredWebsite>;
  removeWebsite(id: string): Promise<boolean>;
  updateWebsiteCheck(id: string, result: WebsiteCheckResult): Promise<MonitoredWebsite | undefined>;
  
  // Check history
  addCheckResult(result: WebsiteCheckResult): Promise<WebsiteCheckResult>;
  getCheckHistory(url?: string): Promise<WebsiteCheckResult[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private websites: Map<string, MonitoredWebsite>;
  private checkHistory: WebsiteCheckResult[];

  constructor() {
    this.users = new Map();
    this.websites = new Map();
    this.checkHistory = [];
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getWebsites(): Promise<MonitoredWebsite[]> {
    return Array.from(this.websites.values());
  }

  async getWebsite(id: string): Promise<MonitoredWebsite | undefined> {
    return this.websites.get(id);
  }

  async addWebsite(url: string, name: string): Promise<MonitoredWebsite> {
    const id = randomUUID();
    const website: MonitoredWebsite = {
      id,
      url,
      name,
      status: "checking",
      checkHistory: [],
      addedAt: new Date().toISOString(),
    };
    this.websites.set(id, website);
    return website;
  }

  async removeWebsite(id: string): Promise<boolean> {
    return this.websites.delete(id);
  }

  async updateWebsiteCheck(id: string, result: WebsiteCheckResult): Promise<MonitoredWebsite | undefined> {
    const website = this.websites.get(id);
    if (!website) return undefined;

    website.status = result.status;
    website.lastCheck = result;
    website.checkHistory.push(result);
    
    // Keep only last 50 checks per website
    if (website.checkHistory.length > 50) {
      website.checkHistory = website.checkHistory.slice(-50);
    }

    this.websites.set(id, website);
    return website;
  }

  async addCheckResult(result: WebsiteCheckResult): Promise<WebsiteCheckResult> {
    this.checkHistory.push(result);
    // Keep only last 100 checks
    if (this.checkHistory.length > 100) {
      this.checkHistory = this.checkHistory.slice(-100);
    }
    return result;
  }

  async getCheckHistory(url?: string): Promise<WebsiteCheckResult[]> {
    if (url) {
      return this.checkHistory.filter(c => c.url === url);
    }
    return this.checkHistory;
  }
}

export const storage = new MemStorage();
