import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import { productsTable } from './db/schema';


const db = drizzle(process.env.DATABASE_URL!);
//MAIN
// orchestrator: calls scraper, then repository
import { scraper, type ScrapedProduct } from './scraper';
import { saveProducts, productExists, deleteProduct, updateProductPrice, updateCampaign} from './productRepository';

async function main(){
    try {
      const products = await scraper();
      for(const product of products){
        if (await productExists(product.url)){
          if(product.price!=-1){
            updateProductPrice(product);
            updateCampaign(product);
          }else{
            deleteProduct(product);
          }
          
        }else{
          if(product.price!=-1){
            saveProducts(product);
          }
        }
      }
    } catch (error) {
      console.error("Scraping failed:", error);
    }
  };
  
main();
