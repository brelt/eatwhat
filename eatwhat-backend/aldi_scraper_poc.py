"""
ALDI Australia Scraper - Proof of Concept
Scrapes ALDI Special Buys (weekly deals)

Note: ALDI Australia doesn't have full online shopping like Woolworths/Coles
They primarily offer Special Buys (weekly deals)
"""

import requests
import json
import re
from bs4 import BeautifulSoup


class AldiScraperPOC:
    """ALDI scraper focusing on Special Buys"""

    def __init__(self):
        self.base_url = "https://www.aldi.com.au"
        self.session = requests.Session()

        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br'
        })

    def get_special_buys(self, category="food"):
        """
        Get ALDI Special Buys

        Args:
            category: Category to scrape (food, household, etc.)

        Returns:
            list: Product data
        """
        url = f"{self.base_url}/en/special-buys/"

        print(f"Fetching ALDI Special Buys...")
        print(f"URL: {url}")

        try:
            response = self.session.get(url, timeout=30)
            print(f"Status: {response.status_code}")

            if response.status_code == 200:
                # Save HTML for debugging
                with open("aldi_special_buys_page.html", "w", encoding="utf-8") as f:
                    f.write(response.text)
                print("[OK] Page saved to: aldi_special_buys_page.html")

                products = self._extract_products_from_html(response.text)
                return products
            else:
                print(f"Error: Status {response.status_code}")
                return []

        except Exception as e:
            print(f"Exception: {e}")
            import traceback
            traceback.print_exc()
            return []

    def _extract_products_from_html(self, html):
        """
        Extract product data from HTML

        Tries multiple extraction methods:
        1. __NUXT__ JSON (Nuxt.js)
        2. window.INITIAL_STATE
        3. Embedded JSON-LD
        4. Direct HTML parsing
        """
        products = []

        print("\nAttempting data extraction...")

        # Method 1: Check for Nuxt.js data
        print("\nMethod 1: Looking for __NUXT__ data...")
        nuxt_pattern = r'window\.__NUXT__\s*=\s*({.*?});</script>'
        match = re.search(nuxt_pattern, html, re.DOTALL)

        if match:
            try:
                # Nuxt data is often encoded, try to parse it
                nuxt_data = match.group(1)
                with open("aldi_nuxt_data.txt", "w", encoding="utf-8") as f:
                    f.write(nuxt_data)
                print("[OK] __NUXT__ data found (but may be encoded)")
                print("     Saved to: aldi_nuxt_data.txt")
            except Exception as e:
                print(f"[X] Error parsing __NUXT__: {e}")

        # Method 2: Look for JSON in script tags
        print("\nMethod 2: Looking for JSON in script tags...")
        soup = BeautifulSoup(html, 'html.parser')
        scripts = soup.find_all('script', type='application/json')

        for i, script in enumerate(scripts):
            try:
                data = json.loads(script.string)
                filename = f"aldi_json_script_{i}.json"
                with open(filename, "w", encoding="utf-8") as f:
                    json.dump(data, f, indent=2, ensure_ascii=False)
                print(f"[OK] Found JSON script {i}, saved to: {filename}")

                # Try to extract products from this data
                extracted = self._extract_from_json_data(data)
                products.extend(extracted)

            except Exception as e:
                print(f"[X] Error parsing script {i}: {e}")

        # Method 3: Look for JSON-LD structured data
        print("\nMethod 3: Looking for JSON-LD structured data...")
        json_ld_scripts = soup.find_all('script', type='application/ld+json')

        for i, script in enumerate(json_ld_scripts):
            try:
                data = json.loads(script.string)
                filename = f"aldi_jsonld_{i}.json"
                with open(filename, "w", encoding="utf-8") as f:
                    json.dump(data, f, indent=2, ensure_ascii=False)
                print(f"[OK] Found JSON-LD {i}, saved to: {filename}")

                # Try to extract products
                extracted = self._extract_from_jsonld(data)
                products.extend(extracted)

            except Exception as e:
                print(f"[X] Error parsing JSON-LD {i}: {e}")

        # Method 4: Direct HTML parsing
        if not products:
            print("\nMethod 4: Trying direct HTML parsing...")
            products = self._extract_from_html_direct(soup)

        return products

    def _extract_from_json_data(self, data):
        """Extract products from JSON data"""
        products = []

        # Try to find products in the data structure
        # This will vary based on ALDI's actual structure
        def find_products(obj, depth=0):
            if depth > 10:  # Prevent infinite recursion
                return

            if isinstance(obj, dict):
                # Look for product-like objects
                if 'name' in obj and 'price' in obj:
                    product = self._normalize_product(obj)
                    if product:
                        products.append(product)

                # Check for common keys
                for key in ['products', 'items', 'specials', 'offers']:
                    if key in obj and isinstance(obj[key], list):
                        for item in obj[key]:
                            find_products(item, depth + 1)

                # Recurse into all dict values
                for value in obj.values():
                    if isinstance(value, (dict, list)):
                        find_products(value, depth + 1)

            elif isinstance(obj, list):
                for item in obj:
                    find_products(item, depth + 1)

        find_products(data)
        return products

    def _extract_from_jsonld(self, data):
        """Extract products from JSON-LD structured data"""
        products = []

        try:
            # JSON-LD can have different types
            if isinstance(data, list):
                for item in data:
                    if item.get('@type') in ['Product', 'Offer']:
                        product = self._normalize_product(item)
                        if product:
                            products.append(product)

            elif isinstance(data, dict):
                if data.get('@type') in ['Product', 'Offer']:
                    product = self._normalize_product(data)
                    if product:
                        products.append(product)

                # Check for itemListElement (common in product lists)
                if 'itemListElement' in data:
                    for item in data['itemListElement']:
                        product = self._normalize_product(item)
                        if product:
                            products.append(product)

        except Exception as e:
            print(f"Error extracting from JSON-LD: {e}")

        return products

    def _extract_from_html_direct(self, soup):
        """Extract products by parsing HTML directly"""
        products = []

        # Look for common product card selectors for ALDI
        selectors = [
            '[data-testid="product"]',
            '.product',
            '.product-card',
            '.special-buy',
            '[class*="product"]',
            '[class*="special"]',
            '.box--wrapper'  # ALDI sometimes uses this
        ]

        for selector in selectors:
            tiles = soup.select(selector)
            if tiles:
                print(f"[OK] Found {len(tiles)} elements with selector: {selector}")

                for tile in tiles[:20]:  # Limit to avoid too much noise
                    try:
                        product = {
                            'name': None,
                            'price': None,
                            'image_url': None,
                            'supermarket': 'aldi'
                        }

                        # Extract name
                        name_elem = (
                            tile.find(['h1', 'h2', 'h3', 'h4']) or
                            tile.find('a', href=True) or
                            tile.find(class_=lambda x: x and 'title' in x.lower())
                        )
                        if name_elem:
                            product['name'] = name_elem.get_text(strip=True)

                        # Extract price
                        price_elem = tile.find(class_=lambda x: x and 'price' in x.lower())
                        if price_elem:
                            price_text = price_elem.get_text(strip=True)
                            # Extract numeric price
                            price_match = re.search(r'\$?(\d+\.?\d*)', price_text)
                            if price_match:
                                product['price'] = float(price_match.group(1))

                        # Extract image
                        img = tile.find('img')
                        if img:
                            product['image_url'] = img.get('src') or img.get('data-src')

                        # Extract link
                        link = tile.find('a', href=True)
                        if link:
                            href = link['href']
                            if href.startswith('http'):
                                product['url'] = href
                            else:
                                product['url'] = self.base_url + href

                        if product['name']:
                            products.append(product)

                    except Exception as e:
                        print(f"Error extracting product: {e}")
                        continue

                if products:
                    return products

        return products

    def _normalize_product(self, item):
        """Normalize product data from various sources"""
        try:
            # Handle different data structures
            product = {
                'name': None,
                'price': None,
                'description': None,
                'image_url': None,
                'url': None,
                'category': 'Special Buys',
                'supermarket': 'aldi'
            }

            # Extract name
            product['name'] = (
                item.get('name') or
                item.get('title') or
                item.get('Name') or
                item.get('productName')
            )

            # Extract price
            if 'price' in item:
                price = item['price']
                if isinstance(price, (int, float)):
                    product['price'] = price
                elif isinstance(price, str):
                    # Try to extract numeric price
                    price_match = re.search(r'\$?(\d+\.?\d*)', price)
                    if price_match:
                        product['price'] = float(price_match.group(1))
            elif 'offers' in item and isinstance(item['offers'], dict):
                product['price'] = item['offers'].get('price')

            # Extract image
            product['image_url'] = (
                item.get('image') or
                item.get('imageUrl') or
                item.get('Image') or
                item.get('thumbnail')
            )

            # Extract description
            product['description'] = (
                item.get('description') or
                item.get('Description')
            )

            # Only return if we have at least a name
            if product['name']:
                return product

        except Exception as e:
            print(f"Error normalizing product: {e}")

        return None


def main():
    """Main function"""
    print("=" * 70)
    print("ALDI Australia Scraper - Proof of Concept")
    print("=" * 70)
    print()
    print("NOTE: ALDI Australia has limited online shopping")
    print("      Focus is on Special Buys (weekly deals)")
    print()

    scraper = AldiScraperPOC()

    # Get special buys
    products = scraper.get_special_buys()

    print()
    print("=" * 70)
    print(f"Successfully extracted {len(products)} products")
    print("=" * 70)
    print()

    if products:
        # Save to JSON
        with open("aldi_products_poc.json", "w", encoding="utf-8") as f:
            json.dump(products, f, indent=2, ensure_ascii=False)
        print("[OK] Saved to: aldi_products_poc.json")
        print()

        # Display samples
        print("Sample products:")
        print("-" * 70)
        for product in products[:10]:
            print(f"Name:  {product.get('name', 'N/A')}")
            if product.get('price'):
                print(f"Price: ${product.get('price', 'N/A')}")
            if product.get('image_url'):
                print(f"Image: {product.get('image_url', 'N/A')[:80]}...")
            print("-" * 70)
    else:
        print("No products found")
        print("\nDEBUG INFO:")
        print("- Check aldi_special_buys_page.html")
        print("- Check any saved JSON files (aldi_json_script_*.json)")
        print("\nALDI operates differently from Woolworths/Coles:")
        print("- Limited product range available online")
        print("- Focuses on Special Buys (weekly deals)")
        print("- May need to scrape PDF catalogs for full range")
        print("- Consider focusing on catalogued items only")


if __name__ == "__main__":
    main()
