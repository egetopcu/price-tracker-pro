import 'dotenv/config';
import { eq ,ne} from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { pricesTable, productsTable } from './db/schema';
import { type ScrapedProduct, scrapeOne , scrapeMany} from './scraper';
const db = drizzle(process.env.DATABASE_URL!);

import { readFile, writeFile } from "node:fs/promises";
import { url } from 'node:inspector/promises';
const path = "./src/scraperProducts.json";



export async function saveProductandPrice(url: string){
  const sProduct = await scrapeOne(url)
  if (!sProduct) {
    console.warn(`Skipping ${url}: nothing scraped`);
    return null;
  }
  const product = await saveProduct(sProduct);
  const p_id=product.product_id
  await savePrice(sProduct, p_id)
}

async function saveProduct(scrapedProduct: ScrapedProduct) {
  const product: typeof productsTable.$inferInsert = {
      name: productName(scrapedProduct.url),
      url: scrapedProduct.url,
      base_price: scrapedProduct.base_price
    };

    const [r_product] = await db.insert(productsTable).values(product).returning({ product_id: productsTable.product_id });
    console.log('New product created!')
    return r_product
}

export function productName(url: string): string {
  const slug = new URL(url).pathname.replace(/\/+$/, "").split("/").pop()!
    .replace(/^p_/, "")                        // beymen prefix
    .replace(/[-_]p[-_]?\d+$/, "")             // boyner, calvin klein
    .replace(/_\d+$/, "")                      // beymen id
    .replace(/-[a-z]{2,3}\d{3,6}(-\d+)?$/, "") // wunder style code
    .replace(/-\d{1,3}$/, "");                 // barcin variant

  return slug.split("-")
    .filter((w, i, all) => w && w !== all[i - 1])
    .map((w) => w.charAt(0).toLocaleUpperCase("tr") + w.slice(1))
    .join(" ");
}

export async function savePrice(scrapedProduct: ScrapedProduct, product_id: number){
  const price: typeof pricesTable.$inferInsert = {
    product_id: product_id,
    price: scrapedProduct.curr_price,
    campaign_price: scrapedProduct.campaign_price,
    campaign_desc: scrapedProduct.campaign_desc
  };

  await db.insert(pricesTable).values(price);
  console.log('New product price created!')
}

export async function savePrices() {
  const rowofurl = await db
  .select({
    url: productsTable.url})
  .from(productsTable)

  const urls = rowofurl.map((r) => r.url);
  const products = await scrapeMany(urls)

  for (const product of products){
    const id =await getProductid(product.url)
    await savePrice(product, id)
    console.log('New product price created!')
  }
}





export async function productExists(url: string): Promise<boolean> {
    const result = await db
      .select({ base_price: productsTable.base_price })
      .from(productsTable)
      .where(eq(productsTable.url, url))
      .limit(1);
  
    return result.length > 0;
}

export async function getProductid(url: string){
  const [id] = await db
    .select({ product_id: productsTable.product_id})
    .from(productsTable)
    .where(eq(productsTable.url, url))

  return id.product_id
}
