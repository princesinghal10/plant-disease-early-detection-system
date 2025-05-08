import { users, type User, type InsertUser, analyses, type Analysis, type InsertAnalysis } from "@shared/schema";

// Modify the interface with any CRUD methods
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Analysis methods
  createAnalysis(analysis: InsertAnalysis): Promise<Analysis>;
  getAnalysis(id: number): Promise<Analysis | undefined>;
  getAllAnalyses(): Promise<Analysis[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private analyses: Map<number, Analysis>;
  private userCurrentId: number;
  private analysisCurrentId: number;

  constructor() {
    this.users = new Map();
    this.analyses = new Map();
    this.userCurrentId = 1;
    this.analysisCurrentId = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Analysis methods
  async createAnalysis(insertAnalysis: InsertAnalysis): Promise<Analysis> {
    const id = this.analysisCurrentId++;
    
    // Create properly typed arrays by mapping each item
    const treatmentOptions = (insertAnalysis.treatmentOptions || []).map((item: any) => ({
      title: typeof item.title === 'string' ? item.title : '',
      description: typeof item.description === 'string' ? item.description : '',
      icon: typeof item.icon === 'string' ? item.icon : ''
    }));
      
    const preventionMeasures = (insertAnalysis.preventionMeasures || []).map((item: any) => ({
      title: typeof item.title === 'string' ? item.title : '',
      description: typeof item.description === 'string' ? item.description : '',
      icon: typeof item.icon === 'string' ? item.icon : ''
    }));
    
    // Create the analysis object with explicit typing
    const analysis: Analysis = {
      id,
      imageUrl: insertAnalysis.imageUrl,
      diseaseName: insertAnalysis.diseaseName,
      diseaseDescription: insertAnalysis.diseaseDescription,
      diseaseSeverity: insertAnalysis.diseaseSeverity,
      treatmentOptions,
      preventionMeasures,
      analyzedAt: new Date()
    };
    
    this.analyses.set(id, analysis);
    return analysis;
  }

  async getAnalysis(id: number): Promise<Analysis | undefined> {
    return this.analyses.get(id);
  }

  async getAllAnalyses(): Promise<Analysis[]> {
    return Array.from(this.analyses.values()).sort((a, b) => 
      new Date(b.analyzedAt).getTime() - new Date(a.analyzedAt).getTime()
    );
  }
}

export const storage = new MemStorage();
