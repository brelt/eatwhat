"""
Check ALDI Products Page
Analyzes the ALDI category page to see if products are available
"""

import requests
import json
import re
from bs4 import BeautifulSoup


def check_aldi_category_page(url):
    """Check ALDI category page for products"""

    print("=" * 70)
    print("Checking ALDI Products Page")
    print("=" * 70)
    print(f"\nURL: {url}")

    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
    }

    try:
        response = requests.get(url, headers=headers, timeout=30)
        print(f"Status: {response.status_code}")

        if response.status_code != 200:
            print(f"Error: {response.status_code}")
            return

        html = response.text

        # Save HTML for inspection
        with open("aldi_category_page.html", "w", encoding="utf-8") as f:
            f.write(html)
        print("[OK] Saved HTML to: aldi_category_page.html")

        # Parse HTML
        soup = BeautifulSoup(html, 'html.parser')

        print("\n" + "=" * 70)
        print("Analysis:")
        print("=" * 70)

        # Check page title
        title = soup.find('title')
        if title:
            print(f"\nPage Title: {title.get_text(strip=True)}")

        # Look for Nuxt.js data
        print("\n1. Checking for __NUXT__ data...")
        nuxt_match = re.search(r'window\.__NUXT__\s*=', html)
        if nuxt_match:
            print("   [OK] __NUXT__ found")
        else:
            print("   [X] __NUXT__ not found")

        # Look for JSON in script tags
        print("\n2. Checking for JSON script tags...")
        json_scripts = soup.find_all('script', type='application/json')
        print(f"   Found {len(json_scripts)} JSON script tags")

        for i, script in enumerate(json_scripts[:3]):
            try:
                data = json.loads(script.string)
                filename = f"aldi_category_json_{i}.json"
                with open(filename, "w", encoding="utf-8") as f:
                    json.dump(data, f, indent=2, ensure_ascii=False)
                print(f"   [OK] Saved script {i} to: {filename}")
            except:
                pass

        # Look for product-like elements
        print("\n3. Checking for product elements...")

        selectors = [
            '.product',
            '.product-card',
            '.product-tile',
            '[class*="product"]',
            '[data-testid*="product"]',
        ]

        for selector in selectors:
            elements = soup.select(selector)
            if elements:
                print(f"   [OK] Found {len(elements)} elements with selector: {selector}")

                # Try to extract first product
                first = elements[0]
                print(f"\n   First element sample:")
                print(f"   Classes: {first.get('class')}")

                # Look for name
                name = first.find(['h1', 'h2', 'h3', 'h4'])
                if name:
                    print(f"   Name: {name.get_text(strip=True)[:100]}")

                # Look for price
                price = first.find(class_=lambda x: x and 'price' in str(x).lower())
                if price:
                    print(f"   Price: {price.get_text(strip=True)}")

                # Look for image
                img = first.find('img')
                if img:
                    print(f"   Image: {img.get('src', 'N/A')[:80]}...")

                break

        # Count images (products usually have images)
        print("\n4. Checking for product images...")
        images = soup.find_all('img')
        product_images = [img for img in images if 'product' in str(img.get('src', '')).lower() or 'product' in str(img.get('alt', '')).lower()]
        print(f"   Total images: {len(images)}")
        print(f"   Product-related images: {len(product_images)}")

        # Look for price indicators
        print("\n5. Checking for price elements...")
        price_elements = soup.find_all(class_=lambda x: x and 'price' in str(x).lower())
        print(f"   Elements with 'price' in class: {len(price_elements)}")

        if price_elements:
            print(f"\n   Sample price elements:")
            for elem in price_elements[:3]:
                print(f"   - {elem.get('class')}: {elem.get_text(strip=True)[:50]}")

        # Check for "no products" or "coming soon" messages
        print("\n6. Checking for status messages...")
        text = soup.get_text().lower()
        if 'no products' in text:
            print("   [!] 'No products' message found")
        if 'coming soon' in text:
            print("   [!] 'Coming soon' message found")
        if 'not available' in text:
            print("   [!] 'Not available' message found")

        print("\n" + "=" * 70)
        print("Next Steps:")
        print("=" * 70)
        print("\n1. Check aldi_category_page.html to see the actual page")
        print("2. Check aldi_category_json_*.json for structured data")
        print("3. If products found, update scraper to extract them")

    except Exception as e:
        print(f"\nException: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    url = "https://www.aldi.com.au/products/fruits-vegetables/fresh-fruits/k/1111111152"
    check_aldi_category_page(url)
