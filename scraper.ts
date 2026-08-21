import { readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));


async function getBeymenPrice(url: string): Promise<number> {
    const res = await fetch(url);
    const html = await res.text();
  
    const campaign = html.match(/"promotedPriceText":"([^"]+)"/);
    const normal = html.match(/"actualPriceText":"([^"]+)"/);

    if (campaign!==null){
      return parseFloat(
        campaign[1].replace(" TL", "").replace(".", "").replace(",", ".")
      );
    } else if (normal !== null) {
      return parseFloat(
        normal[1].replace(" TL", "").replace(".", "").replace(",", ".")    
      );
    } else {
      throw new Error("Beymen price not found");
    }
  }

async function main() {
  const raw = await readFile(path.join(__dirname, 'products.json'), 'utf8');
  const urls: string[] = JSON.parse(raw);

  for (const url of urls) {
    const price = await getBeymenPrice(url);
    console.log(url, price);
  }
}

main();




  






  /*  getBeymenPrice("https://www.beymen.com/tr/p_on-erkek-sneaker_1904609")
    .then(price => console.log(price)) // 14250
    .catch(console.error);
*/