import { type User, type InsertUser, type WebsiteCheckResult, type MonitoredWebsite } from "@shared/schema";
import { randomUUID } from "crypto";
import mongoose, { Schema, Document } from "mongoose";

// Mongoose schemas
interface IUser extends Document {
  id: string;
  username: string;
  password: string;
}

const UserSchema = new Schema<IUser>({
  id: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

interface IWebsiteCheckResult extends Document {
  id: string;
  url: string;
  status: string;
  statusCode?: number;
  loadTime: number;
  contentLength?: number;
  error?: string;
  timestamp: string;
  performanceScore: number;
  ttfb?: number;
  dnsLookup?: number;
}

const WebsiteCheckResultSchema = new Schema<IWebsiteCheckResult>({
  id: { type: String, required: true },
  url: { type: String, required: true },
  status: { type: String, required: true },
  statusCode: Number,
  loadTime: { type: Number, required: true },
  contentLength: Number,
  error: String,
  timestamp: { type: String, required: true },
  performanceScore: { type: Number, required: true },
  ttfb: Number,
  dnsLookup: Number,
});

interface IMonitoredWebsite extends Document {
  id: string;
  url: string;
  name: string;
  status: string;
  lastCheck?: IWebsiteCheckResult;
  checkHistory: IWebsiteCheckResult[];
  addedAt: string;
}

const MonitoredWebsiteSchema = new Schema<IMonitoredWebsite>({
  id: { type: String, required: true, unique: true },
  url: { type: String, required: true },
  name: { type: String, required: true },
  status: { type: String, required: true },
  lastCheck: WebsiteCheckResultSchema,
  checkHistory: [WebsiteCheckResultSchema],
  addedAt: { type: String, required: true },
});

// Models
const UserModel = mongoose.model<IUser>('User', UserSchema);
const WebsiteModel = mongoose.model<IMonitoredWebsite>('Website', MonitoredWebsiteSchema);
const CheckResultModel = mongoose.model<IWebsiteCheckResult>('CheckResult', WebsiteCheckResultSchema);

// Connect to MongoDB
const connectDB = async () => {
  const mongoUrl = process.env.MONGODB_URL || 'mongodb://localhost:27017/webpulse';
  try {
    await mongoose.connect(mongoUrl);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

export class MongoStorage implements IStorage {
  constructor() {
    connectDB();
  }

  async getUser(id: string): Promise<User | undefined> {
    const user = await UserModel.findOne({ id });
    return user ? { id: user.id, username: user.username, password: user.password } : undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const user = await UserModel.findOne({ username });
    return user ? { id: user.id, username: user.username, password: user.password } : undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = randomUUID();
    const newUser = new UserModel({ id, ...user });
    await newUser.save();
    return { id, username: user.username, password: user.password };
  }

  async getWebsites(): Promise<MonitoredWebsite[]> {
    const websites = await WebsiteModel.find();
    return websites.map(w => ({
      id: w.id,
      url: w.url,
      name: w.name,
      status: w.status as "online" | "offline" | "checking",
      lastCheck: w.lastCheck ? {
        id: w.lastCheck.id,
        url: w.lastCheck.url,
        status: w.lastCheck.status as "online" | "offline",
        statusCode: w.lastCheck.statusCode,
        loadTime: w.lastCheck.loadTime,
        contentLength: w.lastCheck.contentLength,
        error: w.lastCheck.error,
        timestamp: w.lastCheck.timestamp,
        performanceScore: w.lastCheck.performanceScore,
        ttfb: w.lastCheck.ttfb,
        dnsLookup: w.lastCheck.dnsLookup,
      } : undefined,
      checkHistory: w.checkHistory.map(c => ({
        id: c.id,
        url: c.url,
        status: c.status as "online" | "offline",
        statusCode: c.statusCode,
        loadTime: c.loadTime,
        contentLength: c.contentLength,
        error: c.error,
        timestamp: c.timestamp,
        performanceScore: c.performanceScore,
        ttfb: c.ttfb,
        dnsLookup: c.dnsLookup,
      })),
      addedAt: w.addedAt,
    }));
  }

  async getWebsite(id: string): Promise<MonitoredWebsite | undefined> {
    const website = await WebsiteModel.findOne({ id });
    if (!website) return undefined;
    return {
      id: website.id,
      url: website.url,
      name: website.name,
      status: website.status as "online" | "offline" | "checking",
      lastCheck: website.lastCheck ? {
        id: website.lastCheck.id,
        url: website.lastCheck.url,
        status: website.lastCheck.status as "online" | "offline",
        statusCode: website.lastCheck.statusCode,
        loadTime: website.lastCheck.loadTime,
        contentLength: website.lastCheck.contentLength,
        error: website.lastCheck.error,
        timestamp: website.lastCheck.timestamp,
        performanceScore: website.lastCheck.performanceScore,
        ttfb: website.lastCheck.ttfb,
        dnsLookup: website.lastCheck.dnsLookup,
      } : undefined,
      checkHistory: website.checkHistory.map(c => ({
        id: c.id,
        url: c.url,
        status: c.status as "online" | "offline",
        statusCode: c.statusCode,
        loadTime: c.loadTime,
        contentLength: c.contentLength,
        error: c.error,
        timestamp: c.timestamp,
        performanceScore: c.performanceScore,
        ttfb: c.ttfb,
        dnsLookup: c.dnsLookup,
      })),
      addedAt: website.addedAt,
    };
  }

  async addWebsite(url: string, name: string): Promise<MonitoredWebsite> {
    const id = randomUUID();
    const addedAt = new Date().toISOString();
    const newWebsite = new WebsiteModel({
      id,
      url,
      name,
      status: 'checking',
      checkHistory: [],
      addedAt,
    });
    await newWebsite.save();
    return {
      id,
      url,
      name,
      status: 'checking',
      checkHistory: [],
      addedAt,
    };
  }

  async removeWebsite(id: string): Promise<boolean> {
    const result = await WebsiteModel.deleteOne({ id });
    return result.deletedCount > 0;
  }

  async updateWebsiteCheck(id: string, result: WebsiteCheckResult): Promise<MonitoredWebsite | undefined> {
    const website = await WebsiteModel.findOne({ id });
    if (!website) return undefined;

    // Add to check history
    website.checkHistory.push(result as any);
    // Keep only last 50
    if (website.checkHistory.length > 50) {
      website.checkHistory = website.checkHistory.slice(-50);
    }
    website.lastCheck = result as any;
    website.status = result.status;
    await website.save();

    return this.getWebsite(id);
  }

  async addCheckResult(result: WebsiteCheckResult): Promise<WebsiteCheckResult> {
    const newResult = new CheckResultModel(result as any);
    await newResult.save();
    return result;
  }

  async getCheckHistory(url?: string): Promise<WebsiteCheckResult[]> {
    let query = {};
    if (url) {
      query = { url };
    }
    const results = await CheckResultModel.find(query).sort({ timestamp: -1 }).limit(100);
    return results.map(r => ({
      id: r.id,
      url: r.url,
      status: r.status as "online" | "offline",
      statusCode: r.statusCode,
      loadTime: r.loadTime,
      contentLength: r.contentLength,
      error: r.error,
      timestamp: r.timestamp,
      performanceScore: r.performanceScore,
      ttfb: r.ttfb,
      dnsLookup: r.dnsLookup,
    }));
  }
}

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

export const storage = process.env.USE_MONGODB === 'true' ? new MongoStorage() : new MemStorage();
