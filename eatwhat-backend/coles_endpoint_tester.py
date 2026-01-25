"""
Coles API Endpoint Tester
Tests multiple endpoints to find working ones
"""

import requests
import json


def test_endpoint(name, url, headers=None, params=None, method='GET', json_data=None):
    """Test an API endpoint"""
    print(f"\nTesting: {name}")
    print(f"URL: {url}")
    if params:
        print(f"Params: {params}")

    try:
        if method == 'GET':
            response = requests.get(url, headers=headers, params=params, timeout=15)
        else:
            response = requests.post(url, headers=headers, json=json_data, timeout=15)

        print(f"Status: {response.status_code}")

        if response.status_code == 200:
            try:
                data = response.json()
                print(f"[OK] Got JSON response!")
                print(f"Response keys: {list(data.keys()) if isinstance(data, dict) else 'List response'}")
                return data
            except:
                print(f"[OK] Got response (not JSON): {response.text[:200]}")
                return response.text
        else:
            print(f"Error: {response.text[:500]}")
            return None

    except Exception as e:
        print(f"Exception: {type(e).__name__}: {str(e)[:200]}")
        return None


def main():
    print("=" * 70)
    print("Coles API Endpoint Tester")
    print("=" * 70)

    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://www.coles.com.au/browse/fruit-vegetables',
        'Origin': 'https://www.coles.com.au'
    }

    endpoints_to_try = [
        # Public API endpoints (similar to Woolworths pattern)
        ("Public API - Search", "https://www.coles.com.au/api/products/search", headers, {'query': 'carrots'}),
        ("Public API - Browse", "https://www.coles.com.au/api/catalog/categories", headers, None),
        ("Public API - Products", "https://www.coles.com.au/api/products", headers, {'category': 'vegetables'}),

        # Alternative API paths
        ("API v1 - Search", "https://www.coles.com.au/api/v1/search", headers, {'q': 'carrots'}),
        ("API v2 - Search", "https://www.coles.com.au/api/v2/search", headers, {'q': 'carrots'}),

        # Internal API endpoints (may work without auth)
        ("Internal - Search", "https://www.coles.com.au/internal/search", headers, {'searchTerm': 'carrots'}),

        # BFF (Backend for Frontend) patterns
        ("BFF - Products", "https://www.coles.com.au/bff/products", headers, {'search': 'carrots'}),

        # Catalog endpoints
        ("Catalog - Search", "https://www.coles.com.au/catalog/search", headers, {'q': 'carrots'}),
        ("Catalog - Products", "https://www.coles.com.au/catalog/products", headers, {'term': 'carrots'}),

        # GraphQL endpoint (Coles might use this)
        ("GraphQL", "https://www.coles.com.au/graphql", headers, None, 'POST', {
            'query': '{ products(search: "carrots") { name price } }'
        }),

        # Next.js API routes
        ("Next API - Products", "https://www.coles.com.au/_next/data/products.json", headers, {'search': 'carrots'}),

        # Store API (similar structure to apigw but public)
        ("Store API - Search", "https://www.coles.com.au/store/api/search", headers, {'q': 'carrots'}),
    ]

    results = {}

    for item in endpoints_to_try:
        if len(item) == 4:
            name, url, request_headers, params = item
            method = 'GET'
            json_data = None
        else:
            name, url, request_headers, params, method, json_data = item

        data = test_endpoint(name, url, request_headers, params, method, json_data)

        if data:
            results[name] = data
            # Save successful responses
            filename = f"coles_response_{name.replace(' ', '_').replace('-', '').lower()}.json"
            with open(filename, 'w', encoding='utf-8') as f:
                if isinstance(data, str):
                    f.write(data)
                else:
                    json.dump(data, f, indent=2, ensure_ascii=False)
            print(f"[OK] Saved to: {filename}")

    print("\n" + "=" * 70)
    print(f"Tested {len(endpoints_to_try)} endpoints")
    print(f"Found {len(results)} working endpoints")
    print("=" * 70)

    if results:
        print("\nWorking endpoints:")
        for name in results.keys():
            print(f"  - {name}")
        print("\nCheck the saved JSON files to see the data structure")
    else:
        print("\nNo working public endpoints found.")
        print("\nTrying alternative approach: Check page source for API calls...")

        # Try to fetch the main page and look for API endpoints in the HTML/JS
        try:
            print("\nFetching Coles homepage to find embedded API endpoints...")
            response = requests.get(
                "https://www.coles.com.au/browse/fruit-vegetables",
                headers=headers,
                timeout=15
            )
            if response.status_code == 200:
                html = response.text

                # Look for common API endpoint patterns
                import re
                api_patterns = [
                    r'api["\']:\s*["\']([^"\']+)["\']',
                    r'endpoint["\']:\s*["\']([^"\']+)["\']',
                    r'https://[^"\']*coles[^"\']*api[^"\']*',
                ]

                found_endpoints = set()
                for pattern in api_patterns:
                    matches = re.findall(pattern, html)
                    found_endpoints.update(matches)

                if found_endpoints:
                    print("\nFound potential API endpoints in page source:")
                    for endpoint in found_endpoints:
                        print(f"  - {endpoint}")

                    # Save HTML for manual inspection
                    with open("coles_page_source.html", "w", encoding="utf-8") as f:
                        f.write(html)
                    print("\n[OK] Page source saved to: coles_page_source.html")
                    print("Manually inspect this file to find API endpoints")

        except Exception as e:
            print(f"Could not fetch page: {e}")

        print("\nRECOMMENDATIONS:")
        print("1. Inspect browser Network tab when visiting coles.com.au")
        print("2. Look for XHR/Fetch requests to find actual API endpoints")
        print("3. Consider using Playwright to capture real API calls")
        print("4. Or use RapidAPI for a paid Coles data solution")


if __name__ == "__main__":
    main()
