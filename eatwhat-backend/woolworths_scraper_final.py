"""
Woolworths Product Scraper - FINAL WORKING VERSION
Uses Woolworths' public Search API
"""

import requests
import json
import time


class WoolworthsScraper:
    """Scraper using Woolworths public API"""

    def __init__(self):
        self.base_url = "https://www.woolworths.com.au/apis/ui/Search/products"
        self.session = requests.Session()

        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'en-US,en;q=0.9',
            'Referer': 'https://www.woolworths.com.au/shop/browse/fruit-veg',
            'Origin': 'https://www.woolworths.com.au'
        })

    def search_products(self, search_term, page_size=36):
        """
        Search for products

        Args:
            search_term: What to search for (e.g., 'vegetables', 'carrots')
            page_size: Number of results (max seems to be 36)

        Returns:
            list: Product data
        """
        params = {
            'searchTerm': search_term,
            'pageSize': page_size
        }

        try:
            print(f"Searching for: {search_term}")
            response = self.session.get(self.base_url, params=params, timeout=30)

            if response.status_code == 200:
                data = response.json()
                return self._extract_products(data)
            else:
                print(f"Error: Status {response.status_code}")
                return []

        except Exception as e:
            print(f"Exception: {e}")
            return []

    def _extract_products(self, api_response):
        """Extract product info from API response"""
        products = []

        # Navigate the nested structure
        if 'Products' not in api_response:
            return products

        for category_group in api_response['Products']:
            if 'Products' not in category_group:
                continue

            for item in category_group['Products']:
                try:
                    product = {
                        'stockcode': item.get('Stockcode'),
                        'barcode': item.get('Barcode'),
                        'name': item.get('DisplayName') or item.get('Name'),
                        'description': item.get('Description', '').strip(),
                        'price': item.get('Price'),
                        'was_price': item.get('WasPrice') if item.get('IsOnSpecial') else None,
                        'on_sale': item.get('IsOnSpecial', False),
                        'is_half_price': item.get('IsHalfPrice', False),
                        'savings': item.get('SavingsAmount', 0.0),
                        'unit': item.get('Unit'),
                        'cup_price': item.get('CupPrice'),  # Unit price
                        'cup_measure': item.get('CupMeasure'),  # e.g., "1EA", "100G"
                        'cup_string': item.get('CupString'),  # e.g., "$0.35 / 1EA"
                        'package_size': item.get('PackageSize'),
                        'image_small': item.get('SmallImageFile'),
                        'image_medium': item.get('MediumImageFile'),
                        'image_large': item.get('LargeImageFile'),
                        'url': f"https://www.woolworths.com.au/shop/productdetails/{item.get('Stockcode')}/{item.get('UrlFriendlyName', '')}",
                        'brand': item.get('Brand'),
                        'is_new': item.get('IsNew', False),
                        'supply_limit': item.get('SupplyLimit'),
                        'category': 'Food',  # Will be enhanced later
                        'supermarket': 'woolworths'
                    }

                    # Calculate discount percentage
                    if product['was_price'] and product['price'] and product['was_price'] > product['price']:
                        discount = ((product['was_price'] - product['price']) / product['was_price']) * 100
                        product['discount_percentage'] = round(discount, 1)
                    else:
                        product['discount_percentage'] = 0

                    products.append(product)

                except Exception as e:
                    print(f"Error extracting product: {e}")
                    continue

        return products

    def search_multiple_categories(self, categories):
        """Search multiple food categories"""
        all_products = []

        for i, category in enumerate(categories):
            print(f"\n[{i+1}/{len(categories)}] Processing category: {category}")
            products = self.search_products(category, page_size=36)
            print(f"  Found {len(products)} products")
            all_products.extend(products)

            # Rate limiting - be nice to the API
            if i < len(categories) - 1:
                time.sleep(1)

        return all_products


def main():
    """Main function"""
    print("=" * 70)
    print("Woolworths Product Scraper - WORKING VERSION")
    print("=" * 70)
    print()

    scraper = WoolworthsScraper()

    # Start with a simple test
    print("Testing with 'carrots'...")
    products = scraper.search_products('carrots', page_size=20)

    print()
    print("=" * 70)
    print(f"Successfully scraped {len(products)} products")
    print("=" * 70)
    print()

    if products:
        # Save to JSON
        with open("woolworths_products.json", "w", encoding="utf-8") as f:
            json.dump(products, f, indent=2, ensure_ascii=False)
        print("[OK] Saved to: woolworths_products.json")
        print()

        # Display samples
        print("Sample products:")
        print("-" * 70)
        for product in products[:5]:
            print(f"Name:        {product.get('name', 'N/A')}")
            print(f"Price:       ${product.get('price', 'N/A')}")
            if product.get('cup_string'):
                print(f"Unit Price:  {product.get('cup_string')}")
            if product.get('on_sale'):
                print(f"On Sale:     YES - ${product.get('savings')} off")
                if product.get('was_price'):
                    print(f"Was:         ${product.get('was_price')}")
                if product.get('discount_percentage'):
                    print(f"Discount:    {product.get('discount_percentage')}% off")
            print(f"Image:       {product.get('image_medium', 'N/A')[:80]}...")
            print("-" * 70)

        print()
        print("\n" + "=" * 70)
        print("NEXT STEPS:")
        print("=" * 70)
        print()
        print("1. Try searching for more categories:")
        print("   - vegetables, fruits, meat, chicken, beef, pork, fish")
        print("   - dairy, milk, cheese, eggs")
        print("   - rice, pasta, bread")
        print()
        print("2. Expand scraper to handle all food categories")
        print()
        print("3. Set up database storage (PostgreSQL)")
        print()
        print("4. Create scheduled daily updates (Celery)")
        print()
        print("=" * 70)

    else:
        print("No products found")


if __name__ == "__main__":
    main()
