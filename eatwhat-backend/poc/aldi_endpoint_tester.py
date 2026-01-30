"""
ALDI Australia API Endpoint Tester
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
    print("ALDI Australia API Endpoint Tester")
    print("=" * 70)

    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://www.aldi.com.au/',
        'Origin': 'https://www.aldi.com.au'
    }

    endpoints_to_try = [
        # Public API endpoints (similar to Woolworths/Coles pattern)
        ("Public API - Search", "https://www.aldi.com.au/api/products/search", headers, {'query': 'carrots'}),
        ("Public API - Products", "https://www.aldi.com.au/api/products", headers, None),
        ("Public API - Specials", "https://www.aldi.com.au/api/specials", headers, None),

        # Alternative API paths
        ("API v1 - Search", "https://www.aldi.com.au/api/v1/search", headers, {'q': 'carrots'}),
        ("API v2 - Search", "https://www.aldi.com.au/api/v2/search", headers, {'q': 'carrots'}),

        # Content/CMS endpoints
        ("Content API - Specials", "https://www.aldi.com.au/en/special-buys", headers, None),

        # Alternative base URLs (ALDI might use different domains)
        ("Alt Domain - API", "https://api.aldi.com.au/products", headers, None),
        ("Alt Domain - Search", "https://api.aldi.com.au/search", headers, {'q': 'carrots'}),

        # GraphQL endpoint
        ("GraphQL", "https://www.aldi.com.au/graphql", headers, None, 'POST', {
            'query': '{ products(search: "carrots") { name price } }'
        }),
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
            filename = f"aldi_response_{name.replace(' ', '_').replace('-', '').lower()}.json"
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
        print("\nNote: ALDI operates differently from Woolworths/Coles:")
        print("- ALDI focuses on Special Buys (weekly deals)")
        print("- May not have full product catalog online")
        print("- Catalog is limited compared to Woolworths/Coles")
        print("\nTrying alternative approach: Fetch ALDI Special Buys page...")

        # Try to fetch the special buys page
        try:
            print("\nFetching ALDI Special Buys page...")
            response = requests.get(
                "https://www.aldi.com.au/en/special-buys/",
                headers=headers,
                timeout=15
            )
            if response.status_code == 200:
                html = response.text

                # Save HTML for inspection
                with open("aldi_special_buys.html", "w", encoding="utf-8") as f:
                    f.write(html)
                print("[OK] Page saved to: aldi_special_buys.html")

                # Look for JSON data in the page
                import re

                # Look for common data patterns
                json_patterns = [
                    r'<script[^>]*type=["\']application/json["\'][^>]*>(.*?)</script>',
                    r'window\.__INITIAL_STATE__\s*=\s*({.*?});',
                    r'window\.__NEXT_DATA__\s*=\s*({.*?})</script>',
                ]

                for pattern in json_patterns:
                    matches = re.findall(pattern, html, re.DOTALL)
                    if matches:
                        print(f"\n[OK] Found JSON data in page! ({len(matches)} matches)")

                        # Save first match
                        try:
                            data = json.loads(matches[0])
                            with open("aldi_page_data.json", "w", encoding="utf-8") as f:
                                json.dump(data, f, indent=2, ensure_ascii=False)
                            print("[OK] Saved to: aldi_page_data.json")
                        except:
                            pass
                        break

        except Exception as e:
            print(f"Could not fetch page: {e}")

        print("\nRECOMMENDATIONS for ALDI:")
        print("1. ALDI has limited online shopping in Australia")
        print("2. Focus on scraping Special Buys (weekly deals)")
        print("3. May need to scrape PDF catalogs")
        print("4. Consider using Playwright to capture dynamic content")


if __name__ == "__main__":
    main()
