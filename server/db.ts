/**
 * حقوق الملكية الفكرية © 2025 فريق نسق | جامعة الأميرة نورة بنت عبدالرحمن
 * جميع الحقوق محفوظة - يُحظر النسخ أو إعادة التوزيع دون إذن كتابي
 * Copyright © 2025 Nasaq Team | PNU | All Rights Reserved
 */
import { eq, and, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  courses,
  learningOutcomes,
  activities,
  rubrics,
  objectives,
  InsertCourse,
  InsertLearningOutcome,
  InsertActivity,
  InsertRubric,
  InsertObjective,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ---- Users ----
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;
  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  for (const field of textFields) {
    const value = user[field];
    if (value === undefined) continue;
    const normalized = value ?? null;
    values[field] = normalized;
    updateSet[field] = normalized;
  }
  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ---- Courses ----
export async function getCoursesByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(courses).where(eq(courses.userId, userId)).orderBy(desc(courses.updatedAt));
}

export async function getCourseById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(courses).where(eq(courses.id, id)).limit(1);
  return result[0];
}

export async function createCourse(data: InsertCourse) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(courses).values(data);
  return result[0];
}

export async function updateCourse(id: number, data: Partial<InsertCourse>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(courses).set(data).where(eq(courses.id, id));
}

export async function deleteCourse(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(courses).where(eq(courses.id, id));
}

// ---- Learning Outcomes ----
export async function getOutcomesByCourse(courseId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(learningOutcomes).where(eq(learningOutcomes.courseId, courseId)).orderBy(learningOutcomes.orderIndex);
}

export async function createOutcome(data: InsertLearningOutcome) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(learningOutcomes).values(data);
  return result[0];
}

export async function deleteOutcome(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(learningOutcomes).where(eq(learningOutcomes.id, id));
}

export async function deleteOutcomesByCourse(courseId: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(learningOutcomes).where(eq(learningOutcomes.courseId, courseId));
}

// ---- Activities ----
export async function getActivitiesByCourse(courseId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(activities).where(eq(activities.courseId, courseId)).orderBy(activities.id);
}

export async function createActivity(data: InsertActivity) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(activities).values(data);
  return result[0];
}

export async function updateActivitySelection(id: number, isSelected: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(activities).set({ isSelected }).where(eq(activities.id, id));
}

export async function deleteActivitiesByCourse(courseId: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(activities).where(eq(activities.courseId, courseId));
}

export async function deleteAiActivitiesByCourse(courseId: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(activities).where(
    and(eq(activities.courseId, courseId), eq(activities.isAiGenerated, 1))
  );
}

// ---- Rubrics ----
export async function getRubricByActivity(activityId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(rubrics).where(eq(rubrics.activityId, activityId)).limit(1);
  return result[0];
}

export async function createRubric(data: InsertRubric) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.insert(rubrics).values(data);
}

export async function deleteRubricsByActivities(activityIds: number[]) {
  const db = await getDb();
  if (!db) return;
  for (const id of activityIds) {
    await db.delete(rubrics).where(eq(rubrics.activityId, id));
  }
}

// ---- Objectives ----
export async function getObjectivesByCourse(courseId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(objectives).where(eq(objectives.courseId, courseId)).orderBy(objectives.orderIndex);
}

export async function createObjective(data: InsertObjective) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.insert(objectives).values(data);
}

export async function deleteObjectivesByCourse(courseId: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(objectives).where(eq(objectives.courseId, courseId));
}
