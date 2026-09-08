import { pgTable, uuid, serial,  integer, varchar } from "drizzle-orm/pg-core";
export const product = pgTable("products", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  url: varchar({ length: 255 }).notNull().unique(),

  price: integer().notNull(),
  price_campaign: integer(),
  campaing_desc: varchar({ length: 255 })
});
