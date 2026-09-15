import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import { productsTable } from './db/schema';
const db = drizzle(process.env.DATABASE_URL!);


async function main() {
    const product: typeof productsTable.$inferInsert = {
        name: "sneakerRed",
        url: 'sneakershop.com/redsneaker',
        price: 5000
      };



    await db.insert(productsTable).values(product);
    console.log('New product created!')



    const products = await db.select().from(productsTable);
    console.log('Getting all products from the database: ', products)



    await db
    .update(productsTable)
    .set({
      price: 6000,
    })
    .where(eq(productsTable.name, product.name));
  console.log('Product info updated!')



  await db.delete(productsTable).where(eq(productsTable.name, product.name));
  console.log('Product deleted!')

}

main();
