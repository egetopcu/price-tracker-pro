import cron from "node-cron";
import { saveNewPrices } from "./productRepository.js";

let running = false;

export async function scrapeAllProducts() {
    if (running) return;
    running = true;
    console.log("Daily scrape started");

    try {
        await saveNewPrices()
        console.log(`Daily scrape finished`);
    } catch (err) {
        console.error("Daily scrape failed:", err);
    } finally {
        running = false;
    }
}

export function startDailyScrape() {
    cron.schedule("58 12 * * *", scrapeAllProducts, { timezone: "Europe/Istanbul" });
    console.log("Daily scrape scheduled");
}