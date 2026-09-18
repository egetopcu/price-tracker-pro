//MAIN
// orchestrator: calls scraper, then repository
import { scraper } from './scraper';
import { saveProducts, productExists, deleteProduct, updateProductPriceIfChanged, updateCampaignIfChanged, deleteJsonUrl} from './productRepository';

async function main(){
    try {

      const products = await scraper();

      for(const product of products){

        if (await productExists(product.url)){
          if(product.price!=-1){
            await updateProductPriceIfChanged(product);
            if (product.url.includes("beymen")){
              await updateCampaignIfChanged(product);
            }
          }else{
            await deleteProduct(product);
          }          
        }else{
          if(product.price!=-1){
            await saveProducts(product);
          }
        }

        if(product.price==-1){
          await deleteJsonUrl(product);
        }

      }

    } catch (error) {
      console.error("Scraping failed:", error);
    }
  };
  
main();
