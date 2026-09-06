//MAIN
// orchestrator: calls scraper, then repository
import { scraper } from './scraper';

(async () => {
    try {
      const products = await scraper();
      for(const product of products){
        if (product){
          console.log(product[1]);
        }else{
          console.log(null)
        }
      }
      //console.log("Scraped Products:", products);
    } catch (error) {
      console.error("Scraping failed:", error);
    }
  })();