// scrapeOne, scrapeMany — pure, returns ScrapedProduct[]
import { readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from "playwright";
import { string } from 'drizzle-orm/cockroach-core';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export type ScrapedProduct = {
  url: string;
  base_price: number;
  curr_price: number;
  campaign_price: number | null;
  campaign_desc: string | null;
};

function makeProduct(
  url: string,
  base_price: number,
  curr_price: number,
  campaign_price: number | null = null,
  campaign_desc: string | null = null,
): ScrapedProduct {
  return { url, base_price: Number(base_price) , curr_price: Number(curr_price), campaign_price, campaign_desc };
}

async function getWunderPrice(url:string) {
  const res = await fetch(url, {
    headers: {
      'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
    },
  })
  const html = await res.text(); 

  const no_discount = html.match(/<div\b[^>]*class="[^"]*\bsell-price  font-l flex\b[^"]*"[^>]*>\s*₺?\s*([\d.,]+)/i)?.[1]
  
  if (no_discount){
    return makeProduct(url, parseInt(no_discount.replace(",","")), parseInt(no_discount.replace(",","")))
  }

  const discount = html.match(/<div\b[^>]*class="[^"]*\bdiscount-price font-l flex-col\b[^"]*"[^>]*>\s*<span>\s*₺?\s*([\d.,]+)\s*<\/span>\s*<span>\s*₺?\s*([\d.,]+)\s*<\/span>/i)

  if (discount){
    return makeProduct(url, parseInt(discount[1].replace(",","")), parseInt(discount[2].replace(",","")))
  }
  return makeProduct(url, -1, -1)
}

async function getBarcinPrices(url:string) {
  const res = await fetch(url, {
    headers: {
      'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
    },
  })
  const html = await res.text(); 

  const no_discount = html.match(/<span\b[^>]*class="[^"]*\bfont-bold text-black\b[^"]*"[^>]*>\s*₺?\s*([\d.,]+)/i)?.[1]
  
  const discount = html.match(/<span\b[^>]*class="[^"]*\bfont-normal line-through text-gray-550\b[^"]*"[^>]*>\s*₺?\s*([\d.,]+)/i)?.[1]

  if (discount && no_discount){
    return makeProduct(url, parseInt(discount.replace(".","").replace(",",".")), parseInt(no_discount.replace(".","").replace(",",".")))
  }else if (no_discount){
    return makeProduct(url, parseInt(no_discount.replace(".","").replace(",",".")), parseInt(no_discount.replace(".","").replace(",",".")))
  }else{
    return makeProduct(url, -1, -1)
  }
}


async function getCalvinKleinPrice(url:string){
  const res = await fetch(url, {
    headers: {
      'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
    },
  });
  const html = await res.text(); 

  const one_price = html.match(/<span\b[^>]*class="[^"]*\bone-price\b[^"]*"[^>]*>\s*₺?\s*([\d.,]+)/i)?.[1]
  const old_price = html.match(/<span\b[^>]*class="[^"]*\bold-price\b[^"]*"[^>]*>\s*₺?\s*([\d.,]+)/i)?.[1]
  const new_price = html.match(/<span\b[^>]*class="[^"]*\bnew-price\b[^"]*"[^>]*>\s*₺?\s*([\d.,]+)/i)?.[1]
  
  if (one_price){
    return makeProduct(url, parseInt(one_price.replace(".","").replace(",",".")), parseInt(one_price.replace(".","").replace(",",".")));
  }else if(old_price && new_price){
    return makeProduct(url, parseInt(old_price.replace(".","").replace(",",".")), parseInt(new_price.replace(".","").replace(",",".")));
  }else{
    return makeProduct(url, -1, -1)
  }
}


async function getBeymenPrice(url:string) {  // update needed: Clean and rewrite the code
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

/*
async function getBoynerPrice(url:string) { // update needed: Clean and rewrite the code
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    });
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 20000 });
    const html = await page.content();

    let price = -1
    let campaignPrice = null;
    let campaignDesc = null;

    const m1 = html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g);
    for (const match of m1) {
        const data = JSON.parse(match[1]);
        const items = Array.isArray(data['@graph']) ? data['@graph'] : [data];
        const product = items.find((item: any) => item['@type'] === 'Product');
        if (product?.offers?.price) {
          price = parseInt(product.offers.price);
        }
    }


    const m2 = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
    if (!m2) {
      return makeProduct(url, price, campaignPrice, campaignDesc);;
    }else{
      const nextData = JSON.parse(m2[1]);
      const queries =
        nextData?.props?.pageProps?.initialState?.dsListingDetailService?.queries ?? {};
  
      
      const detailKey = Object.keys(queries).find((k) => k.startsWith("getProductDetail"));
      const campaigns: any[] = detailKey ? queries[detailKey]?.data?.Campaigns ?? [] : [];
      const active = campaigns.find((c) => c.IsUsingCampaign) ?? campaigns[0];
      if (active?.Title) {
        campaignDesc = active.Title;
        const match = campaignDesc.match(/%\s*(\d+(?:[.,]\d+)?)|(\d+(?:[.,]\d+)?)\s*%/);
        const value = match?.[1] ?? match?.[2];
        if (value) {
          campaignPrice = Math.round(price*((100-parseInt(value))/100));
          
        }
      }
    }
    return makeProduct(url, price, campaignPrice, campaignDesc);
  } finally {
    await browser.close();
  }
}*/


export async function scraper() {

  const raw = await readFile(path.join(__dirname, 'scraperProducts.json'), 'utf8');
  const urls: string[] = JSON.parse(raw);
  
  const products = []
  for (const url of urls) {
    if (url.includes("beymen.com")){
      continue
      //const price = await getBeymenPrice(url)
      //products.push(price)
    }else if(url.includes("boyner.com")){
      continue
      //const price = await getBoynerPrice(url)
      //products.push(price)
    }else if(url.includes("tr.calvinklein.com")){
      const price = await getCalvinKleinPrice(url)
      products.push(price)
    }else if(url.includes("wunder.com")){
      const price = await getWunderPrice(url);
      products.push(price)
    }else if(url.includes("barcin.com")){
      const price = await getBarcinPrices(url);
      products.push(price)
    }
  }
  
  return products
}

async function getMaviPrice(url:string) {
  
}

async function getHMPrice(url:string) {
  
}

async function getZaraPrice(url:string) {
  
}