//MAIN
// orchestrator: calls scraper, then repository
import { scraper } from './scraper';
import { saveProducts, productExists, deleteProduct, updateProductPriceIfChanged, updateCampaignIfChanged} from './productRepository';

async function main(){
    try {
      const products = await scraper();
      for(const product of products){
        if (await productExists(product.url)){
          if(product.price!=-1){
            updateProductPriceIfChanged(product);
            if (product.url.includes("beymen")){
              updateCampaignIfChanged(product);
            }
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
