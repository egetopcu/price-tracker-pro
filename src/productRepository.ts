// saveProducts(), getPriceHistory(), etc.
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { eq, and, gt, ne} from 'drizzle-orm';
import { productsTable } from './db/schema';
const db = drizzle(process.env.DATABASE_URL!);
import { scraper, type ScrapedProduct } from './scraper';


export async function saveProducts(scrapedProduct: ScrapedProduct) {
    const product: typeof productsTable.$inferInsert = {
        name: productName(scrapedProduct.url),
        url: scrapedProduct.url,
        price: scrapedProduct.price,
        price_campaign: scrapedProduct.campaignPrice,
        campaing_desc: scrapedProduct.note
      };

      await db.insert(productsTable).values(product);
      console.log('New product created!')

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






export async function productExists(url: string): Promise<boolean> {
    const result = await db
      .select({ price: productsTable.price })
      .from(productsTable)
      .where(eq(productsTable.url, url))
      .limit(1);
  
    return result.length > 0;
}

export async function deleteProduct(scrapedProduct:ScrapedProduct) {
    await db.delete(productsTable).where(eq(productsTable.url, scrapedProduct.url));
    console.log('Product deleted!')
}


export async function updateCampaign(scrapedProduct:ScrapedProduct) {
    await db
    .update(productsTable)
    .set({
        price_campaign: scrapedProduct.campaignPrice,
        campaing_desc: scrapedProduct.note
    })
    .where(eq(productsTable.url, scrapedProduct.url));
    console.log('Product campaign info updated!')
}

export async function updateProductPrice(scrapedProduct:ScrapedProduct){
    await db
        .update(productsTable)
        .set({
            price: scrapedProduct.price,
        })
        .where(eq(productsTable.url, scrapedProduct.url));
    console.log('Product price info updated!')
}

export async function updateProductPriceIfChanged(scrapedProduct: ScrapedProduct) {
    const updated = await db
    .update(productsTable)
    .set({ price: scrapedProduct.price })
    .where(
        and(
            eq(productsTable.url, scrapedProduct.url),
            ne(productsTable.price, scrapedProduct.price) // only if the price changed
        )
    )
    .returning({ name: productsTable.name, price: productsTable.price });
    
    if (updated.length > 0) {
        console.log("Price changed, product updated!");
    }
    return updated.length > 0;
}


















