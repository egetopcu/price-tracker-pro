//MAIN
// orchestrator: calls scraper, then repository
import { scraper } from './scraper';
import { saveProducts, productExists, deleteProduct, updateProductPriceIfChanged, updateCampaignIfChanged, deleteJsonUrl} from './productRepository';

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
        console.log(product);
      }
    } catch (error) {
      console.error("Test scraping failed:", error);
    }
  };
  
  
//main();


test();




