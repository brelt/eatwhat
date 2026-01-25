"""
Woolworths Scraper - Proof of Concept
Scrapes vegetable category from Woolworths Australia website

Requirements:
    pip install playwright beautifulsoup4
    playwright install chromium
"""

import json
import time
from playwright.sync_api import sync_playwright
from bs4 import BeautifulSoup


class WoolworthsScraper:
    """Scraper for Woolworths online grocery store"""

    def __init__(self):
        self.base_url = "https://www.woolworths.com.au"
        self.category_url = f"{self.base_url}/shop/browse/fruit-veg/vegetables"

    def scrape_vegetables(self, max_products=20, debug=False):
        """
        Scrape vegetable products from Woolworths

        Args:
            max_products (int): Maximum number of products to scrape
            debug (bool): Run in debug mode (non-headless, save screenshots)

        Returns:
            list: List of product dictionaries
        """
        products = []

        with sync_playwright() as p:
            # Launch browser (headless=False for debugging)
            browser = p.chromium.launch(headless=not debug)
            context = browser.new_context(
                user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                viewport={'width': 1920, 'height': 1080}
            )
            page = context.new_page()

            try:
                print(f"Navigating to: {self.category_url}")
                # Wait for network to be idle (all AJAX requests finished)
                page.goto(self.category_url, wait_until="networkidle", timeout=60000)

                # Give page extra time for JavaScript to execute
                print("Waiting for JavaScript to load products...")
                time.sleep(8)

                # Scroll to trigger lazy loading
                print("Scrolling to trigger lazy loading...")
                for i in range(5):
                    page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
                    time.sleep(1)

                # Scroll back to top
                page.evaluate("window.scrollTo(0, 0)")
                time.sleep(2)

                # Take screenshot AFTER scrolling
                if debug:
                    page.screenshot(path="debug_screenshot_after_scroll.png")
                    print("[OK] Screenshot saved to: debug_screenshot_after_scroll.png")

                # Get the updated HTML after JavaScript execution
                html = page.content()
                with open("debug_page_final.html", "w", encoding="utf-8") as f:
                    f.write(html)
                print("[OK] Page HTML saved to: debug_page_final.html")

                # Try multiple selector strategies
                selectors_to_try = [
                    '[data-testid="product-tile"]',
                    '.product-tile',
                    '.product-grid',
                    '[class*="productTile"]',
                    '[class*="ProductTile"]',
                    '[class*="product-grid"]',
                    '[class*="ProductGrid"]',
                    'article',
                    '[data-testid*="product"]',
                    'a[href*="/shop/productdetails/"]'  # Product links
                ]

                product_tiles = []
                soup = BeautifulSoup(html, 'html.parser')

                for selector in selectors_to_try:
                    print(f"Trying selector: {selector}")

                    # Special handling for product links
                    if 'href*=' in selector:
                        # Find all links to product details pages
                        all_links = soup.find_all('a', href=True)
                        tiles = [link for link in all_links if '/shop/productdetails/' in link.get('href', '')]
                        # Get parent containers that likely have product info
                        tiles = [link.parent.parent for link in tiles if link.parent and link.parent.parent]
                    elif '[' in selector and '=' in selector:
                        # Handle attribute selectors
                        try:
                            attr_name = selector.split('[')[1].split('=')[0].split('*')[0]
                            attr_value = selector.split('"')[1] if '"' in selector else selector.split("'")[1]
                            if '*' in selector:
                                # Partial match
                                tiles = soup.find_all(attrs={attr_name: lambda x: x and attr_value in str(x)})
                            else:
                                # Exact match
                                tiles = soup.find_all(attrs={attr_name: attr_value})
                        except:
                            tiles = []
                    else:
                        # CSS class selector
                        tiles = soup.select(selector)

                    if tiles:
                        print(f"  [OK] Found {len(tiles)} elements with {selector}")
                        product_tiles = tiles
                        break
                    else:
                        print(f"  [X] No elements found")

                if not product_tiles:
                    print("\n[WARNING] No products found with any selector!")
                    print("Please check debug_page.html to see the actual page structure")
                    return products

                print(f"\nFound {len(product_tiles)} product elements")

                # Extract product information
                for i, tile in enumerate(product_tiles[:max_products]):
                    try:
                        product = self._extract_product_info(tile)
                        if product:
                            products.append(product)
                            print(f"Scraped: {product.get('name', 'Unknown')} - ${product.get('price', 'N/A')}")
                    except Exception as e:
                        print(f"Error extracting product {i}: {e}")
                        if debug:
                            print(f"Tile HTML: {tile.prettify()[:200]}...")
                        continue

            except Exception as e:
                print(f"Error during scraping: {e}")
                import traceback
                traceback.print_exc()
            finally:
                if not debug:
                    browser.close()
                else:
                    print("\n[WARNING] Debug mode: Browser left open. Press Enter to close...")
                    input()
                    browser.close()

        return products

    def _extract_product_info(self, tile):
        """
        Extract product information from a product tile

        Args:
            tile: BeautifulSoup element of product tile

        Returns:
            dict: Product information
        """
        product = {}

        # Product name - try multiple approaches
        name_elem = (
            tile.find(attrs={'data-testid': 'product-title'}) or
            tile.find('h3') or
            tile.find(class_=lambda x: x and 'title' in x.lower()) or
            tile.find('a', href=True)
        )
        if name_elem:
            product['name'] = name_elem.get_text(strip=True)

        # Price - try multiple approaches
        price_elem = tile.find(attrs={'data-testid': 'price-dollars'})
        cents_elem = tile.find(attrs={'data-testid': 'price-cents'})

        if price_elem:
            dollars = price_elem.get_text(strip=True).replace('$', '')
            cents = cents_elem.get_text(strip=True) if cents_elem else '00'
            product['price'] = f"{dollars}.{cents}"
        else:
            # Try to find price in different formats
            price_text = tile.find(class_=lambda x: x and 'price' in x.lower())
            if price_text:
                price_str = price_text.get_text(strip=True).replace('$', '')
                product['price'] = price_str

        # Size/Weight
        size_elem = (
            tile.find(attrs={'data-testid': 'product-package-size'}) or
            tile.find(class_=lambda x: x and 'size' in x.lower())
        )
        if size_elem:
            product['size'] = size_elem.get_text(strip=True)

        # Image URL
        img_elem = tile.find('img')
        if img_elem:
            product['image_url'] = img_elem.get('src') or img_elem.get('data-src')

        # Product URL
        link_elem = tile.find('a', href=True)
        if link_elem:
            href = link_elem['href']
            if href.startswith('http'):
                product['url'] = href
            else:
                product['url'] = self.base_url + href

        # Category
        product['category'] = 'vegetables'
        product['supermarket'] = 'woolworths'

        # On sale indicator
        sale_elem = tile.find(attrs={'data-testid': 'price-was'})
        if sale_elem:
            product['on_sale'] = True
            product['original_price'] = sale_elem.get_text(strip=True).replace('was $', '')
        else:
            product['on_sale'] = False

        return product if product.get('name') else None


def main():
    """Main function to run the scraper"""
    import sys

    # Check for debug flag
    debug_mode = '--debug' in sys.argv

    print("=" * 60)
    print("Woolworths Vegetable Scraper - Proof of Concept")
    if debug_mode:
        print("DEBUG MODE: Browser visible, screenshots enabled")
    print("=" * 60)
    print()

    scraper = WoolworthsScraper()
    products = scraper.scrape_vegetables(max_products=20, debug=debug_mode)

    print()
    print("=" * 60)
    print(f"Successfully scraped {len(products)} products")
    print("=" * 60)
    print()

    # Save to JSON file
    output_file = "woolworths_vegetables_sample.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(products, f, indent=2, ensure_ascii=False)

    print(f"[OK] Results saved to: {output_file}")
    print()

    # Display sample products
    if products:
        print("Sample products:")
        print("-" * 60)
        for product in products[:5]:
            print(f"Name:     {product.get('name', 'N/A')}")
            print(f"Price:    ${product.get('price', 'N/A')}")
            print(f"Size:     {product.get('size', 'N/A')}")
            print(f"On Sale:  {'Yes' if product.get('on_sale') else 'No'}")
            if product.get('original_price'):
                print(f"Was:      ${product.get('original_price')}")
            print("-" * 60)


if __name__ == "__main__":
    main()
