import { pgTable, serial, text, integer, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const gradesTable = pgTable("grades", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  semester: text("semester").notNull(),
  subject: text("subject").notNull(),
  rawScore: numeric("raw_score", { precision: 6, scale: 2 }),
  standardDeviation: numeric("standard_deviation", { precision: 6, scale: 2 }),
  average: numeric("average", { precision: 6, scale: 2 }),
  rank: integer("rank"),
  topPercentage: numeric("top_percentage", { precision: 6, scale: 2 }),
  achievementLevel: text("achievement_level"),
  totalStudents: integer("total_students"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertGradeSchema = createInsertSchema(gradesTable).omit({ id: true, createdAt: true });
export type InsertGrade = z.infer<typeof insertGradeSchema>;
export type Grade = typeof gradesTable.$inferSelect;
