import requests, json
from bs4 import BeautifulSoup

url = "https://www.beymen.com/tr/p_sony-playstation-5-pro-2tb-oyun-konsolu-2-ps5-oyun-kolu-ps5-sarj-istasyonu_1878367"
headers = {"User-Agent": "Mozilla/5.0"}
resp = requests.get(url, headers=headers)
soup = BeautifulSoup(resp.text, "html.parser")

ld_json = soup.find("script", type="application/ld+json")
data = json.loads(ld_json.string, strict=False)

price = data["offers"]["price"]
currency = data["offers"]["priceCurrency"]
print(price, currency)