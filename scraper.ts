import { readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from "playwright";


const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function getBeymenPrice(url: string) {
  const res = await fetch(url);
  const html = await res.text();
  
  const campaignPrice = html.match(/m-price__campaignPrice">\s*([^<]+?)\s*</)?.[1]?.trim() ?? null;
  const newPrice = html.match(/id="priceNew"[^>]*>([^<]+)</)?.[1]?.trim() ?? null;
  const lastPrice = html.match(/class="m-price__lastPrice"[^>]*>([^<]+)</)?.[1]?.trim() ?? null;
  const campaignDesc = html.match(/m-price__campaignDesc">\s*([^<]+?)\s*</)?.[1]?.trim() ?? null;


  if(campaignPrice&&campaignDesc?.includes("Sepette")||campaignPrice&&campaignDesc?.includes("Visa ile")){
    return campaignPrice
  }else if(campaignPrice){
    if(lastPrice){
      return (lastPrice+","+campaignPrice+campaignDesc)
    }else{
      return (newPrice+","+campaignPrice+campaignDesc)
    }
  }else if(lastPrice){
    return lastPrice
  }else if(newPrice){
    return newPrice
  }else{
    return null
  }
}


async function getBoynerPrice(url: string) {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    });
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 3000 });
    await page.waitForTimeout(500);

    const html = await page.content();

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
  } finally {
    await browser.close();
  }
}


async function main() {
  const raw = await readFile(path.join(__dirname, 'products.json'), 'utf8');
  const urls: string[] = JSON.parse(raw);

  for (const url of urls) {
    if (url.includes("beymen")){
      const price = await getBeymenPrice(url);
      console.log(price);
    }else if(url.includes("boyner")){
      //continue
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