import { readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));


async function getBeymenPrice(url: string){
    const res = await fetch(url);
    const html = await res.text();
  
    const matches = html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g);


    for (const match of matches) {
      try {
        const data = JSON.parse(match[1]);
  
        // Beymen's JSON-LD is a flat object, not wrapped in @graph
        if (data['@type'] === 'Product' && data.offers?.price) {
          return parseFloat(data.offers.price); // already "53950.00" — no TL/comma cleanup needed
        }
      } catch {
        continue;
      }
    }
}

async function getBoynerPrice(url: string) {
  const res = await fetch(url);
  const html = await res.text();

  const matches = html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g);

  for (const match of matches) {
      const data = JSON.parse(match[1]);
      const items = Array.isArray(data['@graph']) ? data['@graph'] : [data];
      const product = items.find((item: any) => item['@type'] === 'Product');

      if (product?.offers?.price) {
        return product.offers.price;
      }
  }

  return null;
}


async function main() {
  const raw = await readFile(path.join(__dirname, 'products.json'), 'utf8');
  const urls: string[] = JSON.parse(raw);

  for (const url of urls) {
    if (url.includes("beymen")){
      const price = await getBeymenPrice(url);
      console.log(price);
    }else if(url.includes("boyner")){
      const price = await getBoynerPrice(url);
      console.log(price);
    }
  }
}

main();




  






  /*  getBeymenPrice("https://www.beymen.com/tr/p_on-erkek-sneaker_1904609")
    .then(price => console.log(price)) // 14250
    .catch(console.error);
*/