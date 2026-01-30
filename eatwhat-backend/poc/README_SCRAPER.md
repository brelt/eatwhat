# Woolworths Scraper - Proof of Concept

This is a proof-of-concept web scraper for extracting vegetable product data from Woolworths Australia's online store.

## Features

- Scrapes vegetable category from Woolworths
- Extracts: product name, price, size, image URL, sale status
- Handles lazy-loaded content with scrolling
- Saves results to JSON file
- Uses Playwright headless browser to bypass bot detection

## Installation

### 1. Install Python Dependencies

```bash
pip install -r requirements.txt
```

### 2. Install Playwright Browser

```bash
playwright install chromium
```

This downloads the Chromium browser needed for scraping (~100MB).

## Usage

### Run the Scraper

```bash
python woolworths_scraper_poc.py
```

### Output

The scraper will:
1. Navigate to Woolworths vegetables category
2. Scrape up to 20 products
3. Save results to `woolworths_vegetables_sample.json`
4. Display sample products in the console

### Sample Output

```json
[
  {
    "name": "Carrots Loose",
    "price": "3.00",
    "size": "per kg",
    "image_url": "https://...",
    "url": "https://www.woolworths.com.au/shop/productdetails/...",
    "category": "vegetables",
    "supermarket": "woolworths",
    "on_sale": false
  }
]
```

## Configuration

You can modify the scraper behavior in `woolworths_scraper_poc.py`:

- `max_products`: Change the number of products to scrape
- `category_url`: Change to scrape different categories
- `headless=True`: Set to `False` to see the browser in action

## Example Categories to Try

```python
# Fruits
category_url = f"{self.base_url}/shop/browse/fruit-veg/fruit"

# Meat
category_url = f"{self.base_url}/shop/browse/meat-seafood-deli/meat"

# Dairy
category_url = f"{self.base_url}/shop/browse/dairy-eggs-fridge/milk"

# Pantry
category_url = f"{self.base_url}/shop/browse/pantry/rice-pasta-grains"
```

## Next Steps

To build a full production scraper:

1. **Add more categories** - Expand to all food categories
2. **Database integration** - Store data in PostgreSQL
3. **Scheduled runs** - Use Celery/Cron for daily updates
4. **Error handling** - Add retry logic, logging, alerting
5. **Proxy rotation** - Use rotating proxies to avoid IP bans
6. **Rate limiting** - Add delays between requests
7. **Data validation** - Clean and standardize scraped data
8. **Historical tracking** - Store price history for trend analysis

## Important Notes

### Legal Considerations

- Web scraping should comply with the website's Terms of Service
- Use reasonable rate limiting to avoid overloading servers
- Consider reaching out to Woolworths for official API access

### Technical Considerations

- Websites can change structure anytime, breaking the scraper
- Implement monitoring to detect scraper failures
- Use CSS selectors/data attributes that are less likely to change
- Handle pagination for large product lists

## Troubleshooting

### Error: "Executable doesn't exist"
Run `playwright install chromium` to download the browser.

### Error: "Timeout waiting for selector"
The website structure may have changed. Inspect the page and update selectors.

### Error: 403 Forbidden
The site may be blocking requests. Try:
- Using different user agents
- Adding delays between requests
- Using residential proxies

### Products not loading
Increase scroll iterations or wait times in the scraper.

## Resources

- [Playwright Documentation](https://playwright.dev/python/)
- [BeautifulSoup Documentation](https://www.crummy.com/software/BeautifulSoup/bs4/doc/)
- [Australian Supermarket APIs (GitHub)](https://github.com/drkno/au-supermarket-apis)
- [Australian Grocery Price Database (GitHub)](https://github.com/tjhowse/aus_grocery_price_database)
