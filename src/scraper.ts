// scrapeOne, scrapeMany — pure, returns ScrapedProduct[]
import { readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from "playwright";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export type ScrapedProduct = {
  url: string;
  price: number;
  campaignPrice: number | null;
  note: string | null;
};

function makeProduct(
  url: string,
  price: number,
  campaignPrice: number | null = null,
  note: string | null = null,
): ScrapedProduct {
  return { url, price: Number(price), campaignPrice, note };
}

async function getWunderPrice(url:string) {
  const res = await fetch(url, {
    headers: {
      'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
    },
  });
  const html = await res.text(); 

  const price = html.match(/"price"\s*:\s*"([\d.]+)"/)?.[1] ?? null;
  
  if (price){
    return makeProduct(url, parseInt(price));
  }else{
    return makeProduct(url, -1)
  }

}


async function getCalvinKleinPrice(url:string){
  const res = await fetch(url, {
    headers: {
      'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
    },
  });
  const html = await res.text(); 

  const price = html.match(/itemprop="price"\s+content="([^"]+)"/)?.[1] ?? null;

  if (price){
    return makeProduct(url,parseInt(price));
  }else{
    return makeProduct(url, -1)
  }
}
  

async function getBeymenPrice(url:string) {
  const res = await fetch(url, {
    headers: {
      'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
    },
  });
  const html = await res.text();
  
  const newPrice = html.match(/id="priceNew"[^>]*>([^<]+)</)?.[1]?.trim() ?? null;
  const lastPrice = html.match(/class="m-price__lastPrice"[^>]*>([^<]+)</)?.[1]?.trim() ?? null;
  const campaignPrice = html.match(/m-price__campaignPrice">\s*([^<]+?)\s*</)?.[1]?.trim() ?? null;
  const campaignDesc = html.match(/m-price__campaignDesc">\s*([^<]+?)\s*</)?.[1]?.trim() ?? null;

  const newPriceInt = newPrice !== null 
  ? parseInt(newPrice.replace(".","").replace(",",".")) 
  : null;
  const lastPriceInt = lastPrice !== null 
  ? parseInt(lastPrice.replace(".","").replace(",",".")) 
  : null;
  const campaignPriceInt = campaignPrice !== null 
  ? parseInt(campaignPrice.replace(".","").replace(",",".")) 
  : null;

  if(campaignPriceInt&&campaignDesc?.includes("Sepette")||campaignPriceInt&&campaignDesc?.includes("Visa ile")){
    return makeProduct(url, campaignPriceInt);
  }else if(campaignPriceInt){
    const campaignDescU=campaignDesc?.replace("&#220;","U")
    if(lastPriceInt){
      return makeProduct(url,lastPriceInt,campaignPriceInt,campaignDescU);
    }else if(newPriceInt){
      return makeProduct(url,newPriceInt,campaignPriceInt,campaignDescU);
    }
  }else if(lastPriceInt){
    return makeProduct(url,lastPriceInt);
  }else if(newPriceInt){
    return makeProduct(url,newPriceInt);
  }else{
    return makeProduct(url, -1)
  }
  return makeProduct(url, -1)
}


async function getBoynerPrice(url:string) {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    });
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 2000 });

    const html = await page.content();

    const matches = html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g);
    for (const match of matches) {
        const data = JSON.parse(match[1]);
        const items = Array.isArray(data['@graph']) ? data['@graph'] : [data];
        const product = items.find((item: any) => item['@type'] === 'Product');
        if (product?.offers?.price) {
          return makeProduct(url, Number(parseInt(product.offers.price)));
        }
    }
    return makeProduct(url, -1);
  } finally {
    await browser.close();
  }
}


export async function scraper() {

  const raw = await readFile(path.join(__dirname, 'scraperProducts.json'), 'utf8');
  const urls: string[] = JSON.parse(raw);
  
  const products = []
  for (const url of urls) {
    if (url.includes("beymen.com")){
      const price = await getBeymenPrice(url);
      products.push(price)
    }else if(url.includes("boyner.com")){
      const price = await getBoynerPrice(url);
      products.push(price)
    }else if(url.includes("tr.calvinklein.com")){
      const price = await getCalvinKleinPrice(url);
      products.push(price)
    }else if(url.includes("wunder.com")){
      const price = await getWunderPrice(url);
      products.push(price)
    }else if(url.includes("barcin.com")){
      const price = await getWunderPrice(url);
      products.push(price)
    }
  }
  
  return products
}



