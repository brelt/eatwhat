"""
ALDI Network Request Capturer
Uses Playwright to capture actual API calls made by the ALDI website
"""

from playwright.sync_api import sync_playwright
import json
import time


def capture_aldi_api_calls():
    """Capture API calls made by ALDI website"""

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
            # Capture API/XHR requests
            if any(keyword in request.url for keyword in ['api', 'content', 'catalog', 'product', 'special']):
                if 'dynatrace' not in request.url and 'ruxitagent' not in request.url:  # Skip tracking
                    api_calls.append({
                        'url': request.url,
                        'method': request.method,
                        'headers': dict(request.headers),
                        'post_data': request.post_data if request.method == 'POST' else None
                    })
                    print(f"[API Call] {request.method} {request.url[:120]}")

        # Intercept all responses
        def handle_response(response):
            # Capture API/XHR responses
            if any(keyword in response.url for keyword in ['api', 'content', 'catalog', 'product', 'special']):
                if 'dynatrace' not in response.url and 'ruxitagent' not in response.url:  # Skip tracking
                    if response.status == 200:
                        print(f"[API Response] {response.status} {response.url[:120]}")
                        try:
                            # Try to get response body
                            body = response.body()
                            # Try to parse as JSON
                            try:
                                data = json.loads(body)
                                # Save response
                                filename = f"aldi_api_response_{len(api_calls)}.json"
                                with open(filename, 'w', encoding='utf-8') as f:
                                    json.dump(data, f, indent=2, ensure_ascii=False)
                                print(f"  [OK] Saved response to: {filename}")
                            except:
                                # Save as text if not JSON
                                filename = f"aldi_api_response_{len(api_calls)}.html"
                                with open(filename, 'wb') as f:
                                    f.write(body)
                                print(f"  [OK] Saved HTML response to: {filename}")
                        except:
                            pass

        page.on('request', handle_request)
        page.on('response', handle_response)

        print("=" * 70)
        print("ALDI Network Request Capturer")
        print("=" * 70)
        print("\nNavigating to ALDI Special Buys...")

        try:
            # Navigate to Special Buys
            page.goto("https://www.aldi.com.au/en/special-buys/", wait_until="networkidle", timeout=60000)
            print("[OK] Page loaded")

            # Wait for content to load
            print("\nWaiting for products to load...")
            time.sleep(5)

            # Scroll to trigger lazy loading
            print("Scrolling to load more products...")
            for i in range(3):
                page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
                time.sleep(2)

            # Try clicking on categories if available
            print("\nLooking for category links...")
            try:
                # Look for links to specific special buy weeks
                links = page.query_selector_all('a[href*="special-buys"]')
                if links and len(links) > 1:
                    print(f"Found {len(links)} special buy links")
                    # Click on first week's specials
                    links[1].click()
                    print("Clicked on special buy week")
                    time.sleep(5)
            except Exception as e:
                print(f"Could not click category: {e}")

            print("\n[INFO] Browser window open for 10 seconds...")
            time.sleep(10)

        except Exception as e:
            print(f"Error: {e}")
            import traceback
            traceback.print_exc()
        finally:
            browser.close()

    # Save all captured API calls
    if api_calls:
        with open("aldi_api_calls.json", 'w', encoding='utf-8') as f:
            json.dump(api_calls, f, indent=2, ensure_ascii=False)
        print(f"\n[OK] Saved {len(api_calls)} API calls to: aldi_api_calls.json")

    return api_calls


def main():
    api_calls = capture_aldi_api_calls()

    print("\n" + "=" * 70)
    print("Summary")
    print("=" * 70)

    if api_calls:
        print(f"\nCaptured {len(api_calls)} API calls")
        print("\nUnique endpoints:")
        endpoints = set([call['url'].split('?')[0] for call in api_calls])
        for endpoint in sorted(endpoints):
            print(f"  - {endpoint}")

        print("\nNext steps:")
        print("1. Check aldi_api_response_*.json files for product data")
        print("2. Identify the endpoint that returns product information")
        print("3. Update aldi_scraper_poc.py to use that endpoint")
    else:
        print("\nNo API calls captured")
        print("\nALDI might:")
        print("  1. Embed all data in initial HTML (SSR)")
        print("  2. Use obfuscated endpoints")
        print("  3. Have limited online catalog")
        print("\nNote: ALDI Australia focuses on Special Buys (weekly deals)")
        print("      They don't have full online grocery shopping like Woolworths/Coles")


if __name__ == "__main__":
    main()
