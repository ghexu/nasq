import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  json,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// جدول المقررات الدراسية
export const courses = mysqlTable("courses", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  courseCode: varchar("courseCode", { length: 50 }),
  level: mysqlEnum("level", ["bachelor", "masters", "diploma", "doctorate"]).default("bachelor").notNull(),
  description: text("description"),
  status: mysqlEnum("status", ["draft", "active", "archived"]).default("draft").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Course = typeof courses.$inferSelect;
export type InsertCourse = typeof courses.$inferInsert;

// جدول نواتج التعلم
export const learningOutcomes = mysqlTable("learning_outcomes", {
  id: int("id").autoincrement().primaryKey(),
  courseId: int("courseId").notNull(),
  text: text("text").notNull(),
  domain: mysqlEnum("domain", ["cognitive", "skill", "value"]).notNull(),
  bloomLevel: varchar("bloomLevel", { length: 100 }),
  actionVerb: varchar("actionVerb", { length: 100 }),
  orderIndex: int("orderIndex").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type LearningOutcome = typeof learningOutcomes.$inferSelect;
export type InsertLearningOutcome = typeof learningOutcomes.$inferInsert;

// جدول الأنشطة التعليمية المقترحة
export const activities = mysqlTable("activities", {
  id: int("id").autoincrement().primaryKey(),
  courseId: int("courseId").notNull(),
  outcomeId: int("outcomeId"),
  title: varchar("title", { length: 255 }).notNull(),
  type: mysqlEnum("type", ["project", "discussion", "quiz", "practical", "presentation", "research"]).notNull(),
  description: text("description"),
  duration: varchar("duration", { length: 100 }),
  instructions: text("instructions"),
  isSelected: int("isSelected").default(0),
  isAiGenerated: int("isAiGenerated").default(1),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = typeof activities.$inferInsert;

// جدول سلالم التقييم (Rubric)
export const rubrics = mysqlTable("rubrics", {
  id: int("id").autoincrement().primaryKey(),
  activityId: int("activityId").notNull(),
  criteria: json("criteria").notNull(), // [{name, excellent, good, needsImprovement, weight}]
  totalPoints: int("totalPoints").default(100),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Rubric = typeof rubrics.$inferSelect;
export type InsertRubric = typeof rubrics.$inferInsert;

// جدول الأهداف الإجرائية المشتقة من نواتج التعلم
export const objectives = mysqlTable("objectives", {
  id: int("id").autoincrement().primaryKey(),
  courseId: int("courseId").notNull(),
  outcomeId: int("outcomeId").notNull(),
  text: text("text").notNull(),
  domain: mysqlEnum("domain", ["cognitive", "skill", "affective"]).notNull(),
  bloomLevel: varchar("bloomLevel", { length: 100 }),
  actionVerb: varchar("actionVerb", { length: 100 }),
  orderIndex: int("orderIndex").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Objective = typeof objectives.$inferSelect;
export type InsertObjective = typeof objectives.$inferInsert;
