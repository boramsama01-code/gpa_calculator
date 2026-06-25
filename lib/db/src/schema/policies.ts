import { pgTable, serial, text, integer, numeric, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const regionalPoliciesTable = pgTable("regional_policies", {
  id: serial("id").primaryKey(),
  regionName: text("region_name").notNull(),
  targetYear: integer("target_year").notNull(),
  totalMaxScore: numeric("total_max_score", { precision: 10, scale: 2 }).notNull(),
  academicScore: numeric("academic_score", { precision: 10, scale: 2 }).notNull(),
  attendanceScore: numeric("attendance_score", { precision: 10, scale: 2 }).notNull(),
  volunteerScore: numeric("volunteer_score", { precision: 10, scale: 2 }).notNull(),
  activityScore: numeric("activity_score", { precision: 10, scale: 2 }).notNull(),
  gradingScale: jsonb("grading_scale"),
  semesterWeights: jsonb("semester_weights"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertRegionalPolicySchema = createInsertSchema(regionalPoliciesTable).omit({ id: true, createdAt: true });
export type InsertRegionalPolicy = z.infer<typeof insertRegionalPolicySchema>;
export type RegionalPolicy = typeof regionalPoliciesTable.$inferSelect;
