# Australian Supermarket Scrapers - Documentation

This folder contains proof-of-concept scrapers for Australian supermarkets: Woolworths, Coles, and ALDI.

---

## 📊 Supermarket Coverage Summary

| Supermarket | Market Share | Online Catalog | Scraper Status | Recommended |
|-------------|--------------|----------------|----------------|-------------|
| **Woolworths** | ~37% | ✅ Full catalog | ✅ Working (API) | ✅ Yes |
| **Coles** | ~28% | ✅ Full catalog | ✅ Working (HTML) | ✅ Yes |
| **ALDI** | ~10% | ✅ Full catalog | ✅ Working (HTML) | ✅ Yes |
| **IGA** | ~7% | ❌ Varies by store | ❌ Not implemented | ❌ No |

**Recommendation:** Use all three scrapers (Woolworths + Coles + ALDI) for ~75% market coverage with complete pricing data.

---

## ✅ Working Scrapers

### 1. Woolworths Scraper - `woolworths_scraper_final.py`

**Status:** ✅ FULLY WORKING

**Method:** Uses Woolworths public Search API

**API Endpoint:** `https://www.woolworths.com.au/apis/ui/Search/products`

**Usage:**
```bash
python woolworths_scraper_final.py
```

**Output:**
- Saves to: `woolworths_products.json`
- Returns: ~20-36 products per search term
- Data includes: Name, price, unit price, images, sale status, discounts

**Example Product Data:**
```json
{
  "stockcode": 135344,
  "name": "Carrot Fresh each",
  "price": 0.35,
  "cup_string": "$0.35 / 1EA",
  "image_medium": "https://cdn0.woolworths.media/content/wowproductimages/medium/135344.jpg",
  "on_sale": false
}
```

**Advantages:**
- Public API, no authentication needed
- Reliable and consistent
- Returns complete product data
- Fast response times

**Limitations:**
- Max ~36 products per request
- Need multiple searches for comprehensive coverage
- API may rate limit if too many requests

---

### 2. Coles Scraper - `coles_scraper_poc.py`

**Status:** ✅ WORKING (with caveats)

**Method:** Extracts data from Next.js `__NEXT_DATA__` in HTML

**How it works:**
1. Fetches Coles search/browse pages
2. Extracts embedded JSON from `__NEXT_DATA__` script tag
3. Parses product data from Next.js page props

**Usage:**
```bash
python coles_scraper_poc.py
```

**Output:**
- Saves to: `coles_products_poc.json`
- Returns: ~20-30 products per search
- Data includes: Name, price, brand, size, images, sale status, discounts

**Example Product Data:**
```json
{
  "product_id": 9006560,
  "name": "Carrots",
  "brand": "Coles",
  "price": 1.7,
  "size": "1Kg",
  "comparable": "$1.70/ 1kg",
  "image_medium": "https://productimages.coles.com.au/productimages/9/9006560.jpg",
  "on_sale": false
}
```

**Advantages:**
- No API key needed
- Rich product data available
- Works with standard HTTP requests

**Limitations:**
- ⚠️ Bot detection - May get blocked after multiple requests
- May show "Pardon Our Interruption" CAPTCHA page
- Requires parsing HTML (more fragile than API)
- Need delays between requests to avoid blocking

---

### 3. ALDI Scraper - `aldi_scraper_final.py`

**Status:** ✅ FULLY WORKING

**Method:** HTML parsing of category pages (Nuxt.js product tiles)

**Usage:**
```bash
python aldi_scraper_final.py
```

**Output:**
- Saves to: `aldi_products.json`
- Returns: ~30 products per category page
- Data includes: Name, price, unit, images, product ID, brand

**Example Product Data:**
```json
{
  "name": "Lemon Each",
  "price": 1.49,
  "unit": "each",
  "price_text": "($1.49 per 1 each)",
  "brand": "No Brand",
  "product_id": "no-brand-lemon-each-000000000000364043",
  "image_url": "https://dm.apac.cms.aldi.cx/is/image/aldiprodapac/product/jpg/...",
  "supermarket": "ALDI"
}
```

**Advantages:**
- Complete product catalog with regular groceries
- Full pricing data for fruits, vegetables, meat, dairy, etc.
- Works with standard HTTP requests (no browser needed)
- Server-side rendered content (fast scraping)

**Limitations:**
- Must scrape category pages (not searchable by keyword)
- ~30 products per category page
- Need to know category URLs in advance
- May require delays between requests to avoid blocking

**What You Get:**
- ✅ Regular grocery prices (milk, bread, eggs, etc.)
- ✅ Fresh produce pricing
- ✅ Meat & seafood pricing
- ✅ Pantry staples
- ✅ Full product information with images

**Category Examples:**
- Fresh Fruits: `/products/fruits-vegetables/fresh-fruits/k/1111111152`
- Fresh Vegetables: `/products/fruits-vegetables/fresh-vegetables/k/1111111153`
- Beef: `/products/meat-seafood/beef/k/1111111155`
- Milk: `/products/dairy-eggs/milk/k/1111111159`

See `ALDI_README.md` for complete category list and detailed usage.

---

## 🚨 Important Notes

### Rate Limiting & Bot Detection

All three supermarkets may block excessive scraping:

**Best Practices:**
1. **Add delays** between requests (1-2 seconds minimum)
2. **Use realistic headers** (User-Agent, Referer, etc.)
3. **Limit requests** - Don't scrape thousands of products at once
4. **Rotate IPs** if doing large-scale scraping (use proxies)
5. **Cache results** - Don't re-fetch the same data repeatedly
6. **Respect robots.txt**

### Legal Considerations

- ⚠️ Check Terms of Service before scraping
- Consider reaching out for official API access:
  - Woolworths: https://apiportal.woolworths.com.au/
  - Coles: Contact their developer relations
- Use for personal/research purposes
- Don't overload their servers

### When to Use Each Scraper

**Use Woolworths Scraper when:**
- You need reliable, consistent data
- API-based solution is preferred
- You're scraping frequently

**Use Coles Scraper when:**
- You need Coles-specific data
- Doing one-off or infrequent scraping
- You can handle potential blocks/CAPTCHAs

**Use ALDI Scraper when:**
- You want to include ALDI's typically lower prices
- You need category-based product scraping
- You want to provide price comparison across all major supermarkets
- You're targeting the budget-conscious segment

---

## 📊 Sample Usage: Multi-Category Scraping

### Woolworths

```python
from woolworths_scraper_final import WoolworthsScraper
import time

scraper = WoolworthsScraper()

categories = ['vegetables', 'fruits', 'meat', 'dairy', 'bread']
all_products = []

for category in categories:
    print(f"Scraping: {category}")
    products = scraper.search_products(category, page_size=36)
    all_products.extend(products)
    time.sleep(2)  # Be nice to the API!

print(f"Total products scraped: {len(all_products)}")
```

### Coles

```python
from coles_scraper_poc import ColesScraperPOC
import time

scraper = ColesScraperPOC()

categories = ['vegetables', 'fruits', 'meat', 'dairy', 'bread']
all_products = []

for category in categories:
    print(f"Scraping: {category}")
    products = scraper.search_products(category)
    all_products.extend(products)
    time.sleep(3)  # Longer delay to avoid bot detection!

print(f"Total products scraped: {len(all_products)}")
```

---

## 🔄 Next Steps for Production

### 1. Database Integration

Create a database schema to store products:

```sql
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    supermarket VARCHAR(50),
    product_id VARCHAR(100),
    name VARCHAR(255),
    brand VARCHAR(100),
    price DECIMAL(10,2),
    was_price DECIMAL(10,2),
    on_sale BOOLEAN,
    scraped_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE price_history (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id),
    price DECIMAL(10,2),
    recorded_at TIMESTAMP DEFAULT NOW()
);
```

### 2. Scheduled Scraping

Use Celery for daily updates:

```python
from celery import Celery
from celery.schedules import crontab

app = Celery('scrapers')

@app.task
def scrape_woolworths():
    """Scrape Woolworths daily at 2 AM"""
    scraper = WoolworthsScraper()
    # Scrape and save to database
    pass

@app.task
def scrape_coles():
    """Scrape Coles daily at 3 AM"""
    scraper = ColesScraperPOC()
    # Scrape and save to database
    pass

app.conf.beat_schedule = {
    'scrape-woolworths-daily': {
        'task': 'tasks.scrape_woolworths',
        'schedule': crontab(hour=2, minute=0),
    },
    'scrape-coles-daily': {
        'task': 'tasks.scrape_coles',
        'schedule': crontab(hour=3, minute=0),
    },
}
```

### 3. Error Handling & Retry Logic

```python
from tenacity import retry, stop_after_attempt, wait_exponential

@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=4, max=10))
def scrape_with_retry(scraper, search_term):
    """Retry scraping on failure"""
    return scraper.search_products(search_term)
```

### 4. Monitoring & Alerts

- Set up logging to track scraper success/failures
- Alert on consecutive failures
- Monitor price changes for anomalies
- Track scraping performance metrics

---

## 🐛 Troubleshooting

### Woolworths Scraper

**Problem:** "Access Denied" or 401 error
- **Solution:** Woolworths may have changed their API. Check the endpoint URL and headers.

**Problem:** No products returned
- **Solution:** Check if search term is valid. Try different terms.

### Coles Scraper

**Problem:** "Pardon Our Interruption" page
- **Solution:** You've been flagged as a bot. Wait 30+ minutes and try again with longer delays.

**Problem:** `__NEXT_DATA__` not found
- **Solution:** Coles may have changed their page structure. Inspect the HTML to find the new structure.

**Problem:** Prices not extracted
- **Solution:** Check `coles_next_data.json` to see the actual data structure and update `_normalize_product()`.

---

## 📝 Files Overview

| File | Purpose | Status |
|------|---------|--------|
| **Woolworths** |||
| `woolworths_scraper_final.py` | Production Woolworths scraper | ✅ Working |
| `woolworths_simple_scraper.py` | Alternative Woolworths tester | 🔧 Debug tool |
| `woolworths_scraper_poc.py` | Original Playwright scraper | ❌ Blocked by anti-bot |
| **Coles** |||
| `coles_scraper_poc.py` | Working Coles scraper | ✅ Working |
| `coles_scraper_working.py` | Copy of working Coles scraper | ✅ Working |
| `coles_endpoint_tester.py` | Tests Coles API endpoints | 🔧 Debug tool |
| `coles_network_capture.py` | Captures Coles API calls | 🔧 Debug tool |
| **ALDI** |||
| `aldi_scraper_final.py` | Production ALDI scraper | ✅ Working |
| `aldi_scraper_poc.py` | Original Special Buys scraper | ❌ Deprecated |
| `check_aldi_products.py` | Discovery tool for ALDI products | 🔧 Debug tool |
| `aldi_endpoint_tester.py` | Tests ALDI API endpoints | 🔧 Debug tool |
| `aldi_network_capture.py` | Captures ALDI API calls | 🔧 Debug tool |
| `ALDI_README.md` | ALDI scraper documentation | 📖 Read this |
| **General** |||
| `SCRAPERS_README.md` | This documentation | 📖 Read this |
| `requirements.txt` | Python dependencies | 📦 Install first |

---

## 🎯 Recommended Approach for Your Project

For the "本周吃什么" (EatWhat) meal planning app:

1. **Start with these working scrapers** to populate your initial product database
2. **Focus on food categories**: vegetables, fruits, meat, dairy, pantry staples
3. **Run scraping once daily** (off-peak hours like 2-4 AM)
4. **Cache aggressively** - supermarket prices don't change hourly
5. **Monitor price trends** to identify genuine sales vs regular prices
6. **Use all three supermarkets**:
   - Woolworths, Coles, and ALDI for comprehensive coverage (~75% market share)
   - Provide price comparison to help users find best deals
   - Highlight ALDI when it's the cheapest option
   - Future: Apply for official API access from supermarkets

---

## 📚 Additional Resources

- [Australian Supermarket APIs (GitHub)](https://github.com/drkno/au-supermarket-apis) - OpenAPI specs
- [Australian Grocery Price Database (GitHub)](https://github.com/tjhowse/aus_grocery_price_database) - Similar project
- [Woolworths API Portal](https://apiportal.woolworths.com.au/) - Official developer portal
- [RapidAPI Woolworths Products API](https://rapidapi.com/data-holdings-group-data-holdings-group-default/api/woolworths-products-api) - Paid alternative

---

*Last updated: 2026-01-24*
