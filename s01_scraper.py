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
    return results

def scrape_beymen(url,headers):
    resp = requests.get(url, headers=headers)
    soup = BeautifulSoup(resp.text, "html.parser")


    new_tag = soup.find(id="priceNew")
    raw_text = new_tag.text.strip()

    old_tag = soup.find(id="priceOld")
    if old_tag:
        raw_text1 = old_tag.text.strip()
    else:
        raw_text1=None

    campaign_div = soup.find("div", class_="m-price__campaign")
    if campaign_div:
        campaign_price_tag = campaign_div.find("span", class_="m-price__campaignPrice")
        raw_text2 = campaign_price_tag.text.strip()
    else:
        raw_text2=None

    return(raw_text,raw_text1,raw_text2)