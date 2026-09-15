import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import { productsTable } from './db/schema';
const db = drizzle(process.env.DATABASE_URL!);
//MAIN
// orchestrator: calls scraper, then repository
import { scraper, type ScrapedProduct } from './scraper';

async function main(){
    try {
      const products = await scraper();
      for(const product of products){
        if (product){
          saveProducts(product);
          console.log(product);
        }else{
          console.log(null)
        }
      }
    } catch (error) {
      console.error("Scraping failed:", error);
    }
  };

main();





async function saveProducts(scrapedProduct: ScrapedProduct) {
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
    .filter((w, i, all) => w && w !== all[i - 1])   // drop siyah-siyah-siyah
    .map((w) => w.charAt(0).toLocaleUpperCase("tr") + w.slice(1))
    .join(" ");
}