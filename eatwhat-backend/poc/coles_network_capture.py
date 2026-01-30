"""
Coles Network Request Capturer
Uses Playwright to capture actual API calls made by the Coles website
"""

from playwright.sync_api import sync_playwright
import json
import time


def capture_coles_api_calls():
    """Capture API calls made by Coles website"""

    api_calls = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        context = browser.new_context(
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            viewport={'width': 1920, 'height': 1080}
        )
        page = context.new_page()

        # Intercept all requests
        def handle_request(request):
            # Only capture API/XHR requests
            if any(keyword in request.url for keyword in ['api', 'graphql', 'search', 'product', 'catalog']):
                api_calls.append({
                    'url': request.url,
                    'method': request.method,
                    'headers': dict(request.headers),
                    'post_data': request.post_data if request.method == 'POST' else None
                })
                print(f"[API Call] {request.method} {request.url[:100]}")

        # Intercept all responses
        def handle_response(response):
            # Only capture API/XHR responses
            if any(keyword in response.url for keyword in ['api', 'graphql', 'search', 'product', 'catalog']):
                if response.status == 200:
                    print(f"[API Response] {response.status} {response.url[:100]}")
                    try:
                        # Try to get response body
                        body = response.body()
                        # Try to parse as JSON
                        try:
                            data = json.loads(body)
                            # Save first successful response
                            filename = f"coles_api_response_{len(api_calls)}.json"
                            with open(filename, 'w', encoding='utf-8') as f:
                                json.dump(data, f, indent=2, ensure_ascii=False)
                            print(f"  [OK] Saved response to: {filename}")
                        except:
                            pass
                    except:
                        pass

        page.on('request', handle_request)
        page.on('response', handle_response)

        print("=" * 70)
        print("Coles Network Request Capturer")
        print("=" * 70)
        print("\nNavigating to Coles website...")

        try:
            # Navigate to fruits & vegetables category
            page.goto("https://www.coles.com.au/browse/fruit-vegetables", wait_until="networkidle", timeout=60000)
            print("[OK] Page loaded")

            # Wait for products to load
            print("\nWaiting for products to load...")
            time.sleep(5)

            # Scroll to trigger lazy loading
            print("Scrolling to load more products...")
            for i in range(3):
                page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
                time.sleep(2)

            # Try searching for a product
            print("\nTrying to search for 'carrots'...")
            try:
                # Look for search input
                search_input = page.query_selector('input[type="search"], input[placeholder*="Search"]')
                if search_input:
                    search_input.fill("carrots")
                    time.sleep(1)
                    search_input.press("Enter")
                    print("[OK] Search submitted")
                    time.sleep(5)
            except:
                print("[X] Could not perform search")

            print("\n[WARNING] Browser window open. Press Enter to close and finish...")
            input()

        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

    # Save all captured API calls
    if api_calls:
        with open("coles_api_calls.json", 'w', encoding='utf-8') as f:
            json.dump(api_calls, f, indent=2, ensure_ascii=False)
        print(f"\n[OK] Saved {len(api_calls)} API calls to: coles_api_calls.json")

    return api_calls


def main():
    api_calls = capture_coles_api_calls()

    print("\n" + "=" * 70)
    print("Summary")
    print("=" * 70)

    if api_calls:
        print(f"\nCaptured {len(api_calls)} API calls")
        print("\nUnique endpoints:")
        endpoints = set([call['url'].split('?')[0] for call in api_calls])
        for endpoint in sorted(endpoints):
            print(f"  - {endpoint}")
    else:
        print("\nNo API calls captured")
        print("This might mean:")
        print("  1. Coles renders products server-side (SSR)")
        print("  2. Products are embedded in the initial HTML")
        print("  3. API calls are obfuscated/hidden")


if __name__ == "__main__":
    main()
