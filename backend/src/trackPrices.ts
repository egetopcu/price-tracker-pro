//MAIN
// orchestrator: calls scraper, then repository
import { scraper } from './scraper';
import { productExists, deleteProduct, deleteJsonUrl, saveTrackedProduct, getProductid, savePrice} from './productRepository';


async function main(){
    try {

      const products = await scraper();

      for(const product of products){
      }

    } catch (error) {
      console.error("Scraping failed:", error);
    }
  };
  

  async function test() {
    try {
      const products = await scraper();
      for(const product of products){
        
        if (await productExists(product.url)){
          const id =await getProductid(product.url)
          await savePrice(product, id)
        }else{
          await saveTrackedProduct(product)
        }

      }
    } catch (error) {
      console.error("Test scraping failed:", error);
    }
  };
  
  
//main();


test();




