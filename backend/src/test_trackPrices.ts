import { getProductid, productExists, savePrice, saveTrackedProduct } from './productRepository';
import { scraper } from './scraper';
  

  async function main() {
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
  
  
main();




