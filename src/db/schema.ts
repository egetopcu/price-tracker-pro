import { pgTable, uuid, serial,  integer, varchar, timestamp, index  } from "drizzle-orm/pg-core";
export const productsTable = pgTable("products", {
  product_id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  url: varchar({ length: 255 }).notNull().unique(),
  base_price: integer().notNull()
});


export const pricesTable = pgTable("prices", {
  product_id: integer().notNull().references(() => productsTable.product_id, { onDelete: "cascade" }),
  price_id: integer().primaryKey().generatedAlwaysAsIdentity(),

  price: integer().notNull(),
  price_campaign: integer(),
  campaing_desc: varchar({ length: 255 }),
  created_at: timestamp({ withTimezone: true }).notNull().defaultNow(),
},
(table) => [index("prices_product_id_idx").on(table.product_id)]
);