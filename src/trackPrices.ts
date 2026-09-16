import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import { productsTable } from './db/schema';


const db = drizzle(process.env.DATABASE_URL!);
//MAIN
// orchestrator: calls scraper, then repository
import { scraper, type ScrapedProduct } from './scraper';
import { saveProducts, productExists } from './productRepository';

async function main(){
    try {
      const products = await scraper();
      for(const product of products){
        if (await productExists(product.url)){
          //saveProducts(product);
          console.log(product)
        }else{
          console.log(null)
        }
      }
    } catch (error) {
      console.error("Scraping failed:", error);
    }
  };
  
main();
