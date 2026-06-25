import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const studentProfilesTable = pgTable("student_profiles", {
  userId: text("user_id").primaryKey(),
  regionId: integer("region_id"),
  targetSchoolTypes: text("target_school_types").array().notNull().default([]),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertStudentProfileSchema = createInsertSchema(studentProfilesTable).omit({ updatedAt: true });
export type InsertStudentProfile = z.infer<typeof insertStudentProfileSchema>;
export type StudentProfile = typeof studentProfilesTable.$inferSelect;
