from hmac import new
import requests, json
from bs4 import BeautifulSoup

def scrape():
    with open('products.json', 'r') as f:
        data = json.load(f)

    results=[]
    headers = {"User-Agent": "Mozilla/5.0"}
    
    for item in data:
        if "beymen.com" in item["url"]:
            results.append(scrape_beymen(item["url"], headers))
        if "wunder.com" in item["url"]:
            results.append(scrape_wunder(item["url"], headers))
        if "boyner.com" in item["url"]:
            continue
    return results

def scrape_beymen(url,headers):
    resp = requests.get(url, headers=headers)
    soup = BeautifulSoup(resp.text, "html.parser")


    campaign_div = soup.find("div", class_="m-price__campaign")
    if campaign_div:
        campaign_price_tag = campaign_div.find("span", class_="m-price__campaignPrice")
        raw_text = campaign_price_tag.text.strip()
    else:
        new_tag = soup.find(id="priceNew")
        raw_text = new_tag.text.strip()

    return(raw_text)

def scrape_wunder(url,headers):
    resp = requests.get(url, headers=headers)
    soup = BeautifulSoup(resp.text, "html.parser")

    for script in soup.find_all("script", type="application/ld+json"):
        try:
            data = json.loads(script.string)
        except (json.JSONDecodeError, TypeError):
            continue
        
        if data.get("@type") == "Product":
            offers = data.get("offers", [])
            if offers:
                first_offer = offers[0] if isinstance(offers, list) else offers
                return float(first_offer.get("price"))


def scrape_boyner(url,headers):
    resp = requests.get(url, headers=headers)
    soup = BeautifulSoup(resp.text, "html.parser")