import { boolean, mysqlTable as table, varchar } from "drizzle-orm/mysql-core";

import { id, timestamps } from "../helpers";

export const todoItems = table("todo_items", {
  id,
  title: varchar("title", { length: 255 }).notNull(),
  isCompleted: boolean("is_completed").notNull().default(false),
  ...timestamps,
});
