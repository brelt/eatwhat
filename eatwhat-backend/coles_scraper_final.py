"""
Coles Product Scraper - FINAL WORKING VERSION
Extracts product data from Coles Next.js __NEXT_DATA__
"""

import requests
import json
import re
import time


class ColesScraper:
    """Coles scraper using Next.js data extraction"""

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
        Search for products

        Args:
            search_term: What to search for (e.g., 'carrots', 'vegetables')

        Returns:
            list: Product data
        """
        search_url = f"{self.base_url}/search"
        params = {'q': search_term}

        print(f"Searching for: {search_term}")

        try:
            response = self.session.get(search_url, params=params, timeout=30)

            if response.status_code == 200:
                products = self._extract_products_from_html(response.text)
                return products
            else:
                print(f"Error: Status {response.status_code}")
                return []

        except Exception as e:
            print(f"Exception: {e}")
            return []

    def browse_category(self, category_path):
        """
        Browse a category page

        Args:
            category_path: Category path (e.g., "browse/fruit-vegetables")

        Returns:
            list: Product data
        """
        url = f"{self.base_url}/{category_path}"

        print(f"Browsing category: {category_path}")

        try:
            response = self.session.get(url, timeout=30)

            if response.status_code == 200:
                products = self._extract_products_from_html(response.text)
                return products
            else:
                print(f"Error: Status {response.status_code}")
                return []

        except Exception as e:
            print(f"Exception: {e}")
            return []

    def _extract_products_from_html(self, html):
        """Extract product data from HTML by parsing __NEXT_DATA__"""
        products = []

        # Debug: save HTML for inspection
        with open("coles_debug.html", "w", encoding="utf-8") as f:
            f.write(html)

        # Check if we got blocked
        if 'access denied' in html.lower() or 'blocked' in html.lower():
            print("[X] Access blocked by Coles")
            print("    Try again after a few seconds or use different headers")
            return products

        # Extract __NEXT_DATA__ JSON
        next_data_pattern = r'<script id="__NEXT_DATA__" type="application/json">(.*?)</script>'
        match = re.search(next_data_pattern, html, re.DOTALL)

        if not match:
            print(f"[X] __NEXT_DATA__ not found in HTML (length: {len(html)})")
            print("    HTML saved to: coles_debug.html for inspection")
            return products

        try:
            next_data = json.loads(match.group(1))

            # Navigate to products in Next.js data structure
            if 'props' in next_data and 'pageProps' in next_data['props']:
                page_props = next_data['props']['pageProps']

                # Try different possible locations
                if 'searchResults' in page_props:
                    # Search results page
                    search_results = page_props['searchResults']
                    if 'results' in search_results:
                        for item in search_results['results']:
                            if item.get('_type') == 'PRODUCT':
                                product = self._normalize_product(item)
                                if product:
                                    products.append(product)

                elif 'products' in page_props:
                    # Browse/category page
                    for item in page_props['products']:
                        product = self._normalize_product(item)
                        if product:
                            products.append(product)

        except Exception as e:
            print(f"Error parsing __NEXT_DATA__: {e}")

        return products

    def _normalize_product(self, item):
        """Normalize product data from Coles structure"""
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
            image_small = None
            image_medium = None
            image_large = None

            if 'imageUris' in item and item['imageUris']:
                first_image = item['imageUris'][0]
                uri = first_image.get('uri')
                if uri:
                    base_image = f"https://productimages.coles.com.au/productimages{uri}"
                    image_small = base_image
                    image_medium = base_image
                    image_large = base_image

            # Calculate discount
            on_sale = False
            discount_percentage = 0
            savings = 0

            if was_price and price and was_price > price:
                on_sale = True
                savings = round(was_price - price, 2)
                discount_percentage = round((savings / was_price) * 100, 1)

            # Check for promotion
            promotion_type = None
            if 'pricing' in item and 'promotionType' in item['pricing']:
                promotion_type = item['pricing']['promotionType']
                if promotion_type:
                    on_sale = True

            product = {
                'product_id': item.get('id'),
                'name': item.get('name'),
                'brand': item.get('brand'),
                'description': item.get('description'),
                'size': item.get('size'),
                'price': price,
                'was_price': was_price,
                'on_sale': on_sale,
                'is_special': promotion_type == 'SPECIAL',
                'savings': savings,
                'discount_percentage': discount_percentage,
                'unit_price': unit_price,
                'comparable': comparable,  # e.g., "$1.70/ 1kg"
                'image_small': image_small,
                'image_medium': image_medium,
                'image_large': image_large,
                'url': f"https://www.coles.com.au/product/{item.get('id')}" if item.get('id') else None,
                'availability': item.get('availability'),
                'available_quantity': item.get('availableQuantity'),
                'category': 'Food',
                'supermarket': 'coles'
            }

            # Only return if we have at least a name and price
            if product['name'] and product['price'] is not None:
                return product

        except Exception as e:
            print(f"Error normalizing product: {e}")

        return None

    def search_multiple_categories(self, search_terms):
        """Search multiple food categories"""
        all_products = []

        for i, term in enumerate(search_terms):
            print(f"\n[{i+1}/{len(search_terms)}] Processing: {term}")
            products = self.search_products(term)
            print(f"  Found {len(products)} products")
            all_products.extend(products)

            # Rate limiting - be nice to the server
            if i < len(search_terms) - 1:
                time.sleep(1)

        return all_products


def main():
    """Main function"""
    print("=" * 70)
    print("Coles Product Scraper - WORKING VERSION")
    print("=" * 70)
    print()

    scraper = ColesScraper()

    # Start with a simple test
    print("Testing with 'carrots'...")
    products = scraper.search_products('carrots')

    print()
    print("=" * 70)
    print(f"Successfully scraped {len(products)} products")
    print("=" * 70)
    print()

    if products:
        # Save to JSON
        with open("coles_products.json", "w", encoding="utf-8") as f:
            json.dump(products, f, indent=2, ensure_ascii=False)
        print("[OK] Saved to: coles_products.json")
        print()

        # Display samples
        print("Sample products:")
        print("-" * 70)
        for product in products[:5]:
            print(f"Name:        {product.get('name', 'N/A')}")
            print(f"Brand:       {product.get('brand', 'N/A')}")
            print(f"Price:       ${product.get('price', 'N/A')}")
            if product.get('comparable'):
                print(f"Unit Price:  {product.get('comparable')}")
            if product.get('on_sale'):
                print(f"On Sale:     YES - ${product.get('savings')} off")
                if product.get('was_price'):
                    print(f"Was:         ${product.get('was_price')}")
                if product.get('discount_percentage'):
                    print(f"Discount:    {product.get('discount_percentage')}% off")
            if product.get('size'):
                print(f"Size:        {product.get('size')}")
            print(f"Image:       {product.get('image_medium', 'N/A')[:80]}...")
            print("-" * 70)

        print()
        print("\n" + "=" * 70)
        print("NEXT STEPS:")
        print("=" * 70)
        print()
        print("1. Try searching for more categories:")
        print("   - vegetables, fruits, meat, chicken, beef, pork, seafood")
        print("   - dairy, milk, cheese, eggs")
        print("   - bread, rice, pasta")
        print()
        print("2. Try browsing categories:")
        print("   scraper.browse_category('browse/fruit-vegetables')")
        print("   scraper.browse_category('browse/meat-seafood')")
        print()
        print("3. Combine with Woolworths scraper for price comparison")
        print()
        print("4. Set up database storage (PostgreSQL)")
        print()
        print("5. Create scheduled daily updates (Celery)")
        print()
        print("=" * 70)

    else:
        print("No products found")


if __name__ == "__main__":
    main()
