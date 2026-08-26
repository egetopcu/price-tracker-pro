import { readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from "playwright";
import * as cheerio from 'cheerio';

async function benchmarkParsers(html: string, iterations = 1000) {
    // --- Cheerio version ---
    const cheerioStart = performance.now();
    for (let i = 0; i < iterations; i++) {
      const $ = cheerio.load(html);
      $('[itemprop="price"]').attr('content');
    }
    const cheerioTime = performance.now() - cheerioStart;
  
    // --- Regex version ---
    const regexStart = performance.now();
    for (let i = 0; i < iterations; i++) {
      html.match(/itemprop="price"\s+content="([^"]+)"/)?.[1];
    }
    const regexTime = performance.now() - regexStart;
  
    console.log(`Cheerio: ${cheerioTime.toFixed(2)}ms total, ${(cheerioTime/iterations).toFixed(4)}ms/iter`);
    console.log(`Regex:   ${regexTime.toFixed(2)}ms total, ${(regexTime/iterations).toFixed(4)}ms/iter`);
    console.log(`Regex is ${(cheerioTime/regexTime).toFixed(1)}x faster`);
  }
  
  // Usage: fetch the HTML once, then benchmark parsing repeatedly
async function main() {
  const res = await fetch("https://tr.calvinklein.com/erkek-90s-straight-comfort-pantolon-p_204407", { headers: { 'User-Agent': '...' } });
  const html = await res.text();
  await benchmarkParsers(html);
}

main();