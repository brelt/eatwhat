"""
ALDI Australia Product Scraper - WORKING VERSION
Extracts products from ALDI category pages
"""

import requests
from bs4 import BeautifulSoup
import json
import re
from typing import List, Dict, Optional


class AldiScraper:
    """Scraper for ALDI Australia products"""

    def __init__(self):
        self.base_url = "https://www.aldi.com.au"
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
        })

    def scrape_category(self, category_url: str) -> List[Dict]:
        """
        Scrape products from an ALDI category page

        Args:
            category_url: Full URL or path to category page
                         e.g., "/products/fruits-vegetables/fresh-fruits/k/1111111152"
                         or "https://www.aldi.com.au/products/fruits-vegetables/fresh-fruits/k/1111111152"

        Returns:
            List of product dictionaries
        """
        # Handle both full URLs and paths
        if not category_url.startswith('http'):
            url = self.base_url + category_url
        else:
            url = category_url

        print(f"\n[INFO] Scraping ALDI category: {url}")

        try:
            response = self.session.get(url, timeout=30)

            if response.status_code != 200:
                print(f"[ERROR] HTTP {response.status_code}")
                return []

            products = self._extract_products_from_html(response.text)
            print(f"[OK] Found {len(products)} products")

            return products

        except Exception as e:
            print(f"[ERROR] {e}")
            import traceback
            traceback.print_exc()
            return []

    def _extract_products_from_html(self, html: str) -> List[Dict]:
        """Extract product data from HTML"""
        soup = BeautifulSoup(html, 'html.parser')
        product_tiles = soup.select('.product-tile')

        products = []

        for tile in product_tiles:
            try:
                product = self._parse_product_tile(tile)
                if product:
                    products.append(product)
            except Exception as e:
                print(f"[WARNING] Failed to parse product: {e}")
                continue

        return products

    def _parse_product_tile(self, tile) -> Optional[Dict]:
        """Parse a single product tile"""
        product = {}

        # Title
        title = tile.get('title', '').strip()
        if not title:
            return None
        product['name'] = title

        # Link and Product ID
        link = tile.find('a', class_='product-tile__link')
        if link:
            href = link.get('href', '')
            product['url'] = self.base_url + href if href.startswith('/') else href

            # Extract product ID from URL
            if '/product/' in href:
                product['product_id'] = href.split('/')[-1]

        # Image
        img = tile.find('img')
        if img:
            product['image_url'] = img.get('src', '')

        # Price - Parse both price value and unit
        price_elem = tile.find(class_=lambda x: x and 'price' in str(x).lower())
        if price_elem:
            price_text = price_elem.get_text(strip=True)
            product['price_text'] = price_text

            # Extract numeric price and unit
            # Format: "($1.49 per 1 each)" or "($5.99 per 1 kg)"
            price_match = re.search(r'\$?([\d.]+)\s*per\s*([\d.]+)?\s*(.+?)\)?$', price_text)
            if price_match:
                product['price'] = float(price_match.group(1))
                product['unit'] = price_match.group(3).strip()

                # Calculate base price if quantity specified
                quantity = price_match.group(2)
                if quantity and float(quantity) != 1:
                    product['base_price'] = product['price'] / float(quantity)

        # Brand (if available)
        brand = tile.find(class_='product-tile__brand')
        if brand:
            product['brand'] = brand.get_text(strip=True)
        else:
            product['brand'] = 'No Brand'  # ALDI house brand

        # Additional metadata
        product['supermarket'] = 'ALDI'
        product['tile_type'] = tile.get('data-tile-type', '')

        return product

    def save_to_json(self, products: List[Dict], filename: str = "aldi_products.json"):
        """Save products to JSON file"""
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(products, f, indent=2, ensure_ascii=False)
        print(f"[OK] Saved {len(products)} products to: {filename}")


def main():
    """Example usage"""
    scraper = AldiScraper()

    # Scrape fresh fruits category
    category_url = "/products/fruits-vegetables/fresh-fruits/k/1111111152"
    products = scraper.scrape_category(category_url)

    if products:
        # Display sample products
        print("\n" + "="*70)
        print("Sample Products:")
        print("="*70)

        for product in products[:5]:
            print(f"\nName: {product['name']}")
            print(f"Price: ${product.get('price', 'N/A')} per {product.get('unit', 'N/A')}")
            print(f"Brand: {product.get('brand', 'N/A')}")
            print(f"Product ID: {product.get('product_id', 'N/A')}")
            print(f"Image: {product.get('image_url', 'N/A')[:80]}...")

        # Save to file
        scraper.save_to_json(products)

        print("\n" + "="*70)
        print("Summary:")
        print("="*70)
        print(f"Total products scraped: {len(products)}")
        print(f"Average price: ${sum(p.get('price', 0) for p in products) / len(products):.2f}")

        # Count by unit type
        units = {}
        for p in products:
            unit = p.get('unit', 'unknown')
            units[unit] = units.get(unit, 0) + 1

        print(f"\nProducts by unit:")
        for unit, count in sorted(units.items()):
            print(f"  {unit}: {count}")

    else:
        print("\n[ERROR] No products found")


if __name__ == "__main__":
    main()
