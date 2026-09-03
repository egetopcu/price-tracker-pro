//MAIN
// orchestrator: calls scraper, then repository
import { scraper } from './scraper';

(async () => {
    try {
      const products = await scraper();
      console.log("Scraped Products:", products);
    } catch (error) {
      console.error("Scraping failed:", error);
    }
  })();