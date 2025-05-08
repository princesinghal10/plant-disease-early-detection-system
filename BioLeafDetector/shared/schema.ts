import { pgTable, text, serial, integer, timestamp, json, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define plant analysis schema
export const analyses = pgTable("analyses", {
  id: serial("id").primaryKey(),
  imageUrl: text("image_url").notNull(),
  diseaseName: text("disease_name").notNull(),
  diseaseDescription: text("disease_description").notNull(),
  diseaseSeverity: text("disease_severity").notNull(),
  treatmentOptions: json("treatment_options").notNull().$type<{
    title: string;
    description: string;
    icon: string;
  }[]>(),
  preventionMeasures: json("prevention_measures").notNull().$type<{
    title: string;
    description: string;
    icon: string;
  }[]>(),
  analyzedAt: timestamp("analyzed_at").defaultNow().notNull(),
});

export const insertAnalysisSchema = createInsertSchema(analyses).omit({
  id: true,
  analyzedAt: true,
});

// Use types from schema
export type Analysis = typeof analyses.$inferSelect;
export type InsertAnalysis = z.infer<typeof insertAnalysisSchema>;

// Keep the users table for compatibility with the existing storage interface
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
