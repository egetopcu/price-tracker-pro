import { integer, pgTable, varchar } from "drizzle-orm/pg-core";
export const productsTable = pgTable("products", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  url: varchar({ length: 255 }).notNull().unique(),

  price: integer().notNull(),
  price_campaign: integer(),
  campaing_desc: varchar({ length: 255 }),

  price_lowest: integer().notNull(),
  price_highest: integer().notNull(),
  price_campaign_lowest: integer(),
  campaing_desc_lowest: varchar({ length: 255 }),
  price_campaign_highest: integer(),
  campaing_desc_highest: varchar({ length: 255 }),
});
