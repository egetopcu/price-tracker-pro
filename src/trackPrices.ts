//MAIN
// orchestrator: calls scraper, then repository
import { scraper } from './scraper';
import { productExists, deleteProduct, deleteJsonUrl, saveTrackedProduct} from './productRepository';


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

        saveTrackedProduct(product)

      }
    } catch (error) {
      console.error("Test scraping failed:", error);
    }
  };
  
  
//main();


test();




