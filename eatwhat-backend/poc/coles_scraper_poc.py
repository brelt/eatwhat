"""
Coles Scraper - Proof of Concept
Extracts product data from Coles website HTML (Next.js data)
"""

import requests
import json
import re
from bs4 import BeautifulSoup


class ColesScraperPOC:
    """Coles scraper using HTML parsing"""

    def __init__(self):
        self.base_url = "https://www.coles.com.au"
        self.session = requests.Session()

        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br'
        })

    def search_products(self, search_term):
        """
        Search for products via Coles search page

        Args:
            search_term: What to search for

        Returns:
            list: Product data
        """
        search_url = f"{self.base_url}/search"
        params = {'q': search_term}

        print(f"Searching for: {search_term}")
        print(f"URL: {search_url}?q={search_term}")

        try:
            response = self.session.get(search_url, params=params, timeout=30)
            print(f"Status: {response.status_code}")

            if response.status_code == 200:
                # Save HTML for debugging
                with open("coles_search_page.html", "w", encoding="utf-8") as f:
                    f.write(response.text)
                print("[OK] Page saved to: coles_search_page.html")

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

    def browse_category(self, category_path="browse/fruit-vegetables"):
        """
        Browse a category page

        Args:
            category_path: Category path (e.g., "browse/fruit-vegetables")

        Returns:
            list: Product data
        """
        url = f"{self.base_url}/{category_path}"

        print(f"Browsing category: {category_path}")
        print(f"URL: {url}")

        try:
            response = self.session.get(url, timeout=30)
            print(f"Status: {response.status_code}")

            if response.status_code == 200:
                # Save HTML for debugging
                with open("coles_category_page.html", "w", encoding="utf-8") as f:
                    f.write(response.text)
                print("[OK] Page saved to: coles_category_page.html")

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
        1. __NEXT_DATA__ JSON (Next.js)
        2. window.__INITIAL_STATE__ JSON
        3. JSON-LD structured data
        4. Direct HTML parsing
        """
        products = []

        # Method 1: Extract from __NEXT_DATA__ script tag
        print("\nMethod 1: Looking for __NEXT_DATA__...")
        next_data_pattern = r'<script id="__NEXT_DATA__" type="application/json">(.*?)</script>'
        match = re.search(next_data_pattern, html, re.DOTALL)

        if match:
            try:
                next_data = json.loads(match.group(1))
                with open("coles_next_data.json", "w", encoding="utf-8") as f:
                    json.dump(next_data, f, indent=2, ensure_ascii=False)
                print("[OK] __NEXT_DATA__ found and saved to: coles_next_data.json")

                # Try to extract products from Next.js data
                products = self._extract_from_nextjs_data(next_data)
                if products:
                    return products
            except Exception as e:
                print(f"[X] Error parsing __NEXT_DATA__: {e}")

        # Method 2: Look for window.__INITIAL_STATE__
        print("\nMethod 2: Looking for __INITIAL_STATE__...")
        initial_state_pattern = r'window\.__INITIAL_STATE__\s*=\s*({.*?});'
        match = re.search(initial_state_pattern, html, re.DOTALL)

        if match:
            try:
                initial_state = json.loads(match.group(1))
                with open("coles_initial_state.json", "w", encoding="utf-8") as f:
                    json.dump(initial_state, f, indent=2, ensure_ascii=False)
                print("[OK] __INITIAL_STATE__ found and saved to: coles_initial_state.json")

                products = self._extract_from_initial_state(initial_state)
                if products:
                    return products
            except Exception as e:
                print(f"[X] Error parsing __INITIAL_STATE__: {e}")

        # Method 3: JSON-LD structured data
        print("\nMethod 3: Looking for JSON-LD structured data...")
        soup = BeautifulSoup(html, 'html.parser')
        json_ld_scripts = soup.find_all('script', type='application/ld+json')

        for script in json_ld_scripts:
            try:
                data = json.loads(script.string)
                if isinstance(data, dict) and 'itemListElement' in data:
                    print(f"[OK] Found JSON-LD with {len(data['itemListElement'])} items")
                    products = self._extract_from_jsonld(data)
                    if products:
                        return products
            except:
                continue

        # Method 4: Direct HTML parsing
        print("\nMethod 4: Trying direct HTML parsing...")
        products = self._extract_from_html_direct(soup)

        return products

    def _extract_from_nextjs_data(self, data):
        """Extract products from Next.js data structure"""
        products = []

        # Try to navigate the Next.js data structure
        # This varies by site, common paths:
        try:
            if 'props' in data:
                props = data['props']

                # Check for pageProps
                if 'pageProps' in props:
                    page_props = props['pageProps']

                    # Common keys to check
                    possible_keys = ['products', 'searchResults', 'items', 'productList', 'catalogItems']

                    for key in possible_keys:
                        if key in page_props:
                            items = page_props[key]
                            print(f"[OK] Found products in pageProps.{key}")

                            if isinstance(items, list):
                                for item in items:
                                    product = self._normalize_product(item)
                                    if product:
                                        products.append(product)
                            elif isinstance(items, dict):
                                # Might be nested
                                if 'results' in items:
                                    for item in items['results']:
                                        product = self._normalize_product(item)
                                        if product:
                                            products.append(product)

        except Exception as e:
            print(f"Error extracting from Next.js data: {e}")

        return products

    def _extract_from_initial_state(self, data):
        """Extract products from initial state"""
        products = []
        # Similar logic to Next.js data extraction
        # Implementation depends on actual data structure
        return products

    def _extract_from_jsonld(self, data):
        """Extract products from JSON-LD structured data"""
        products = []

        try:
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

        # Look for common product card selectors
        selectors = [
            '[data-testid="product"]',
            '[data-testid="product-tile"]',
            '.product-tile',
            '.product-card',
            '[class*="ProductTile"]',
            '[class*="product"]'
        ]

        for selector in selectors:
            tiles = soup.select(selector)
            if tiles:
                print(f"[OK] Found {len(tiles)} products with selector: {selector}")

                for tile in tiles:
                    try:
                        product = {
                            'name': None,
                            'price': None,
                            'image_url': None,
                            'supermarket': 'coles'
                        }

                        # Extract name
                        name_elem = tile.find(['h2', 'h3', 'h4']) or tile.find('a')
                        if name_elem:
                            product['name'] = name_elem.get_text(strip=True)

                        # Extract price
                        price_elem = tile.find(class_=lambda x: x and 'price' in x.lower())
                        if price_elem:
                            price_text = price_elem.get_text(strip=True)
                            product['price'] = price_text

                        # Extract image
                        img = tile.find('img')
                        if img:
                            product['image_url'] = img.get('src') or img.get('data-src')

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
            # Extract pricing info
            price = None
            was_price = None
            unit_price = None
            comparable = None

            if 'pricing' in item:
                pricing = item['pricing']
                price = pricing.get('now')
                was_price = pricing.get('was') if pricing.get('was', 0) > 0 else None
                comparable = pricing.get('comparable')

                if 'unit' in pricing:
                    unit_price = pricing['unit'].get('price')

            # Extract image URL
            image_url = None
            if 'imageUris' in item and item['imageUris']:
                first_image = item['imageUris'][0]
                uri = first_image.get('uri')
                if uri:
                    # Construct full image URL
                    image_url = f"https://productimages.coles.com.au/productimages{uri}"

            # Calculate discount
            on_sale = False
            discount_percentage = 0
            savings = 0

            if was_price and price and was_price > price:
                on_sale = True
                savings = was_price - price
                discount_percentage = round((savings / was_price) * 100, 1)

            product = {
                'product_id': item.get('id') or item.get('productId'),
                'name': item.get('name') or item.get('DisplayName') or item.get('title'),
                'brand': item.get('brand') or item.get('Brand'),
                'description': item.get('description'),
                'size': item.get('size'),
                'price': price,
                'was_price': was_price,
                'on_sale': on_sale,
                'savings': savings,
                'discount_percentage': discount_percentage,
                'unit_price': unit_price,
                'comparable': comparable,
                'image_url': image_url,
                'url': f"https://www.coles.com.au/product/{item.get('id')}" if item.get('id') else None,
                'availability': item.get('availability'),
                'category': 'Food',
                'supermarket': 'coles'
            }

            # Only return if we have at least a name and price
            if product['name'] and product['price'] is not None:
                return product

        except Exception as e:
            print(f"Error normalizing product: {e}")
            import traceback
            traceback.print_exc()

        return None


def main():
    """Main function"""
    print("=" * 70)
    print("Coles Product Scraper - Proof of Concept")
    print("=" * 70)
    print()

    scraper = ColesScraperPOC()

    # Try Method 1: Search
    print("Attempting Method 1: Search for 'carrots'...")
    print("-" * 70)
    products = scraper.search_products('carrots')

    if not products:
        # Try Method 2: Browse category
        print("\nAttempting Method 2: Browse fruit-vegetables category...")
        print("-" * 70)
        products = scraper.browse_category("browse/fruit-vegetables")

    print()
    print("=" * 70)
    print(f"Successfully extracted {len(products)} products")
    print("=" * 70)
    print()

    if products:
        # Save to JSON
        with open("coles_products_poc.json", "w", encoding="utf-8") as f:
            json.dump(products, f, indent=2, ensure_ascii=False)
        print("[OK] Saved to: coles_products_poc.json")
        print()

        # Display samples
        print("Sample products:")
        print("-" * 70)
        for product in products[:5]:
            print(f"Name:  {product.get('name', 'N/A')}")
            print(f"Price: {product.get('price', 'N/A')}")
            if product.get('image_url'):
                print(f"Image: {product.get('image_url', 'N/A')[:80]}...")
            print("-" * 70)
    else:
        print("No products found")
        print("\nDEBUG INFO:")
        print("- Check coles_search_page.html or coles_category_page.html")
        print("- Check coles_next_data.json if it exists")
        print("- The site may use server-side rendering or require authentication")
        print("\nNext steps:")
        print("1. Manually inspect saved HTML files to find product data")
        print("2. Check browser Network tab for actual API endpoints")
        print("3. Consider using Playwright for JavaScript-rendered content")


if __name__ == "__main__":
    main()
