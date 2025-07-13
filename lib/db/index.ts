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
