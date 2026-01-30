"""
Woolworths API Scraper - Uses their internal API instead of scraping HTML
This is more reliable and less likely to be blocked

Based on the reverse-engineered API from:
https://github.com/drkno/au-supermarket-apis
"""

import requests
import json
import time


class WoolworthsAPIClient:
    """Client for Woolworths internal API"""

    def __init__(self):
        self.base_url = "https://www.woolworths.com.au/apis"
        self.session = requests.Session()

        # Headers to mimic the mobile app / website
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json',
            'Accept-Language': 'en-US,en;q=0.9',
            'Referer': 'https://www.woolworths.com.au/',
            'Origin': 'https://www.woolworths.com.au'
        })

    def search_products(self, category="vegetables", page_size=36, page_number=1):
        """
        Search for products using Woolworths API

        Args:
            category: Category to search
            page_size: Number of results per page
            page_number: Page number

        Returns:
            dict: Product data
        """
        # Try the public product search API
        search_url = f"{self.base_url}/ui/products/search"

        params = {
            'searchTerm': category,
            'pageSize': page_size,
            'page': page_number,
            'sortType': 'TraderRelevance'
        }

        try:
            print(f"Searching for '{category}' products...")
            response = self.session.get(search_url, params=params, timeout=30)

            print(f"Response status: {response.status_code}")

            if response.status_code == 200:
                data = response.json()
                return data
            else:
                print(f"Error: Status {response.status_code}")
                print(f"Response: {response.text[:500]}")
                return None

        except Exception as e:
            print(f"Exception: {e}")
            return None

    def get_category_products(self, category_id="1-E5BEE36E", page_size=36):
        """
        Get products by category ID

        Common category IDs:
        - Fruit & Veg: 1-E5BEE36E
        - Meat: 1-6E7D1F58
        - Dairy: 1-1B70CACB

        Args:
            category_id: Category identifier
            page_size: Number of products

        Returns:
            dict: Product data
        """
        # Try browsing by category
        browse_url = f"{self.base_url}/ui/browse/category"

        params = {
            'categoryId': category_id,
            'pageSize': page_size,
            'page': 1
        }

        try:
            print(f"Getting category {category_id}...")
            response = self.session.get(browse_url, params=params, timeout=30)

            print(f"Response status: {response.status_code}")

            if response.status_code == 200:
                return response.json()
            else:
                print(f"Error: {response.status_code}")
                print(f"Response: {response.text[:500]}")
                return None

        except Exception as e:
            print(f"Exception: {e}")
            return None

    def extract_products(self, api_response):
        """
        Extract product information from API response

        Args:
            api_response: Raw API response

        Returns:
            list: List of simplified product dicts
        """
        if not api_response:
            return []

        products = []

        # Try different possible data structures
        product_list = (
            api_response.get('Products') or
            api_response.get('products') or
            api_response.get('Bundles', {}).get('Products') or
            []
        )

        for item in product_list:
            try:
                product = {
                    'name': item.get('Name') or item.get('DisplayName') or item.get('Description'),
                    'price': item.get('Price'),
                    'was_price': item.get('WasPrice'),
                    'on_sale': bool(item.get('WasPrice')) or item.get('IsOnSpecial', False),
                    'size': item.get('PackageSize') or item.get('Size'),
                    'brand': item.get('Brand'),
                    'image_url': None,
                    'product_id': item.get('Stockcode') or item.get('ProductId'),
                    'barcode': item.get('Barcode'),
                    'category': 'vegetables',
                    'supermarket': 'woolworths'
                }

                # Extract image URL
                if item.get('MediumImageFile'):
                    product['image_url'] = f"https://cdn0.woolworths.media/content/wowproductimages/medium/{item['MediumImageFile']}"
                elif item.get('ImageUris'):
                    images = item['ImageUris']
                    if images and len(images) > 0:
                        product['image_url'] = images[0].get('Uri')

                # Calculate discount percentage
                if product['was_price'] and product['price']:
                    try:
                        discount = ((product['was_price'] - product['price']) / product['was_price']) * 100
                        product['discount_percentage'] = round(discount, 1)
                    except:
                        pass

                products.append(product)

            except Exception as e:
                print(f"Error extracting product: {e}")
                continue

        return products


def main():
    """Main function"""
    print("=" * 60)
    print("Woolworths API Scraper - Proof of Concept")
    print("=" * 60)
    print()

    client = WoolworthsAPIClient()

    # Try Method 1: Search API
    print("Method 1: Trying search API...")
    print("-" * 60)
    data = client.search_products(category="vegetables", page_size=20)

    if data:
        print(f"\nRaw API response keys: {list(data.keys())}")
        with open("api_response_search.json", "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        print("[OK] Raw response saved to: api_response_search.json")

        products = client.extract_products(data)
        if products:
            print(f"\n[OK] Successfully extracted {len(products)} products via search")
        else:
            print("\n[X] Could not extract products from search response")
    else:
        print("[X] Search API failed")

    print()

    # Try Method 2: Category Browse API
    print("Method 2: Trying category browse API...")
    print("-" * 60)
    data2 = client.get_category_products(category_id="1-E5BEE36E", page_size=20)

    if data2:
        print(f"\nRaw API response keys: {list(data2.keys())}")
        with open("api_response_category.json", "w", encoding="utf-8") as f:
            json.dump(data2, f, indent=2, ensure_ascii=False)
        print("[OK] Raw response saved to: api_response_category.json")

        products2 = client.extract_products(data2)
        if products2:
            print(f"\n[OK] Successfully extracted {len(products2)} products via category")
            products = products2  # Use category results
        else:
            print("\n[X] Could not extract products from category response")
    else:
        print("[X] Category API failed")

    print()
    print("=" * 60)

    # Save and display results
    if products:
        print(f"Successfully scraped {len(products)} products")
        print("=" * 60)

        # Save to JSON
        with open("woolworths_vegetables_api.json", "w", encoding="utf-8") as f:
            json.dump(products, f, indent=2, ensure_ascii=False)

        print("\n[OK] Results saved to: woolworths_vegetables_api.json")
        print()

        # Display sample
        print("Sample products:")
        print("-" * 60)
        for product in products[:5]:
            print(f"Name:     {product.get('name', 'N/A')}")
            print(f"Price:    ${product.get('price', 'N/A')}")
            print(f"Size:     {product.get('size', 'N/A')}")
            print(f"On Sale:  {'Yes' if product.get('on_sale') else 'No'}")
            if product.get('was_price'):
                print(f"Was:      ${product.get('was_price')}")
                if product.get('discount_percentage'):
                    print(f"Discount: {product.get('discount_percentage')}% off")
            print("-" * 60)
    else:
        print("No products found with either method")
        print("\nTIP: Check the saved JSON files to see the API structure")
        print("You may need to update the extract_products() method")


if __name__ == "__main__":
    main()
