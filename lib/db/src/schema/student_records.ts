import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const studentRecordsTable = pgTable("student_records", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  subject: text("subject").notNull(),
  recordText: text("record_text"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertStudentRecordSchema = createInsertSchema(studentRecordsTable).omit({ id: true, createdAt: true });
export type InsertStudentRecord = z.infer<typeof insertStudentRecordSchema>;
export type StudentRecord = typeof studentRecordsTable.$inferSelect;
