"""
Woolworths Simple Scraper - POC
Tests multiple endpoints to find working ones
"""

import requests
import json


def test_endpoint(name, url, headers=None, params=None):
    """Test an API endpoint"""
    print(f"\nTesting: {name}")
    print(f"URL: {url}")

    try:
        response = requests.get(url, headers=headers, params=params, timeout=15)
        print(f"Status: {response.status_code}")

        if response.status_code == 200:
            try:
                data = response.json()
                print(f"[OK] Got JSON response!")
                return data
            except:
                print(f"[OK] Got response (not JSON): {response.text[:200]}")
                return response.text
        else:
            print(f"Error: {response.text[:300]}")
            return None

    except Exception as e:
        print(f"Exception: {type(e).__name__}: {str(e)[:200]}")
        return None


def main():
    print("=" * 70)
    print("Woolworths API Endpoint Tester")
    print("=" * 70)

    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://www.woolworths.com.au/shop/browse/fruit-veg',
        'Origin': 'https://www.woolworths.com.au'
    }

    endpoints_to_try = [
        # API v3 endpoints
        ("API v3 - Search", "https://www.woolworths.com.au/api/v3/ui/search", None, {'searchTerm': 'carrots'}),
        ("API v3 - Browse", "https://www.woolworths.com.au/api/v3/ui/browse", None, {'categoryId': '1-E5BEE36E'}),
        ("API v3 - Products", "https://www.woolworths.com.au/api/v3/ui/products", None, {'category': 'vegetables'}),

        # API v2 endpoints
        ("API v2 - Search", "https://www.woolworths.com.au/api/v2/products/search", None, {'searchTerm': 'carrots'}),

        # UI API endpoints
        ("UI API - Search", "https://www.woolworths.com.au/apis/ui/Search/products", None, {'searchTerm': 'carrots', 'pageSize': 24}),
        ("UI API - Browse", "https://www.woolworths.com.au/apis/ui/browse/category", None, {'categoryId': '1-E5BEE36E', 'pageSize': 24}),
        ("UI API - Products", "https://www.woolworths.com.au/apis/ui/products/search", None, {'searchTerm': 'vegetables', 'pageSize': 20}),

        # Catalog endpoints
        ("Catalog - Search", "https://www.woolworths.com.au/Shop/ProductSearch", None, {'searchTerm': 'vegetables'}),
    ]

    results = {}

    for name, url, extra_headers, params in endpoints_to_try:
        request_headers = headers.copy()
        if extra_headers:
            request_headers.update(extra_headers)

        data = test_endpoint(name, url, request_headers, params)

        if data:
            results[name] = data
            # Save successful responses
            filename = f"response_{name.replace(' ', '_').replace('-', '').lower()}.json"
            with open(filename, 'w', encoding='utf-8') as f:
                if isinstance(data, str):
                    f.write(data)
                else:
                    json.dump(data, f, indent=2, ensure_ascii=False)
            print(f"[OK] Saved to: {filename}")

    print("\n" + "=" * 70)
    print(f"Successfully tested {len(results)} endpoints")
    print("=" * 70)

    if results:
        print("\nWorking endpoints:")
        for name in results.keys():
            print(f"  - {name}")
    else:
        print("\nNo working endpoints found.")
        print("\nRECOMMENDATIONS:")
        print("1. Use Woolworths Developer API Portal (https://apiportal.woolworths.com.au/)")
        print("2. Use RapidAPI Woolworths Products API (paid)")
        print("3. Consider using the 'requests-html' library with JavaScript rendering")
        print("4. Or contact auscost.com.au project maintainer for collaboration")


if __name__ == "__main__":
    main()
