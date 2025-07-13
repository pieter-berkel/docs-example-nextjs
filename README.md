Create an new page for adding Drizzle ORM (database).
The original documentation is available at: #fetch https://orm.drizzle.team/

In most cases I use MySQL as the database, this is the example I will use.

- Use soft deletes with the `deletedAt` column.

## Installation

```bash
pnpm add nanoid drizzle-orm mysql2
pnpm add -D drizzle-kit dotenv
```

## Setup nanoid for ID generation

Add the following code to `/utils/nanoid.ts`:

```typescript
import { customAlphabet } from "nanoid";

const alpabet = "0123456789abcdefghijklmnopqrstuvwxyz";
export const nanoid = customAlphabet(alpabet, 16);
```

Add a new environment variable in your `.env` file:

```.env
DATABASE_URL=mysql://user:password@localhost:3306/database_name
```

Create a file `drizzle.config.ts` in the root of your project:

```typescript
import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./drizzle",
  schema: "./lib/db/schema",
  dialect: "mysql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

Add 2 new scripts to your `package.json`:

```json
{
  "scripts": {
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio"
  }
}
```

Add the following code to `lib/db/index.ts`:

```typescript
import { drizzle, MySql2Database } from "drizzle-orm/mysql2";
import mysql, { Pool } from "mysql2/promise";
import * as schema from "./schema/index";

let database: MySql2Database<typeof schema>;
let connection: Pool;

if (process.env.NODE_ENV === "production") {
  connection = mysql.createPool(process.env.DATABASE_URL as string);
  database = drizzle(connection, { schema, mode: "default" });
} else {
  if (!(global as any).database) {
    connection = mysql.createPool(process.env.DATABASE_URL as string);
    (global as any).database = drizzle(connection, { schema, mode: "default" });
  }
  database = (global as any).database;
}

export * from "drizzle-orm/sql";
export { database, connection, schema };
```

Add the following code to `lib/db/helpers.ts`:

```typescript title="lib/db/helpers.ts"
import { timestamp, varchar } from "drizzle-orm/mysql-core";

import { nanoid } from "@/utils/nanoid";

export const id = varchar("id", { length: 16 })
  .primaryKey()
  .$defaultFn(() => nanoid());

export const createdAt = timestamp("created_at").notNull().defaultNow();

export const updatedAt = timestamp("updated_at")
  .notNull()
  .defaultNow()
  .onUpdateNow();

export const deletedAt = timestamp("deleted_at");

export const timestamps = {
  createdAt,
  updatedAt,
  deletedAt,
};
```

Tables can be created with the following strucure for example:

```typescript title="lib/db/schema/todo-items.ts"
import { boolean, mysqlTable as table, varchar } from "drizzle-orm/mysql-core";

import { id, timestamps } from "../helpers";

export const todoItems = table("todo_items", {
  id,
  title: varchar("title", { length: 255 }).notNull(),
  isCompleted: boolean("is_completed").notNull().default(false),
  ...timestamps,
});
```

Re-export the schema in `lib/db/schema/index.ts`:

```typescript title="lib/db/schema/index.ts"
export * from "./todo-items";
```

Example when selecting data:

```typescript
import { database, schema, isNull } from "@/lib/db";

// with releations api
const items = await database.query.todoItems.findMany({
  where: (todoItems, { eq }) => eq(todoItems.deletedAt, null),
});

// with select api
const items = await database
  .select()
  .from(schema.todoItems)
  .where(isNull(schema.todoItems.deletedAt));
```

Example when deleting data:

```typescript
import { database, schema } from "@/lib/db";

// soft delete
await database
  .update(schema.todoItems)
  .set({ deletedAt: new Date() })
  .where(eq(schema.todoItems.id, "x"));
```
