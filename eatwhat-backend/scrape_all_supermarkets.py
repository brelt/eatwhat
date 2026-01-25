"""
Comprehensive Scraper for All Australian Supermarkets
Demonstrates scraping from Woolworths, Coles, and ALDI
"""

import json
import time
from woolworths_scraper_final import WoolworthsScraper
from coles_scraper_poc import ColesScraperPOC
from aldi_scraper_final import AldiScraper


def scrape_all_supermarkets(search_term=None, aldi_category=None):
    """
    Scrape a product from all three supermarkets

    Args:
        search_term: Search term for Woolworths and Coles (e.g., "carrots")
        aldi_category: ALDI category URL (e.g., "/products/fruits-vegetables/fresh-vegetables/k/1111111153")
    """

    all_products = {
        'woolworths': [],
        'coles': [],
        'aldi': []
    }

    print("="*70)
    print("Australian Supermarket Scraper - All Three Supermarkets")
    print("="*70)

    # 1. Scrape Woolworths
    print("\n[1/3] Scraping Woolworths...")
    print("-"*70)
    try:
        woolworths = WoolworthsScraper()
        woolworths_products = woolworths.search_products(search_term or "vegetables", page_size=20)
        all_products['woolworths'] = woolworths_products
        print(f"[OK] Found {len(woolworths_products)} Woolworths products")
    except Exception as e:
        print(f"[ERROR] Woolworths scraping failed: {e}")

    # Delay between supermarkets
    time.sleep(2)

    # 2. Scrape Coles
    print("\n[2/3] Scraping Coles...")
    print("-"*70)
    try:
        coles = ColesScraperPOC()
        coles_products = coles.search_products(search_term or "vegetables")
        all_products['coles'] = coles_products
        print(f"[OK] Found {len(coles_products)} Coles products")
    except Exception as e:
        print(f"[ERROR] Coles scraping failed: {e}")

    # Delay between supermarkets
    time.sleep(2)

    # 3. Scrape ALDI
    print("\n[3/3] Scraping ALDI...")
    print("-"*70)
    try:
        aldi = AldiScraper()
        aldi_url = aldi_category or "/products/fruits-vegetables/fresh-vegetables/k/1111111153"
        aldi_products = aldi.scrape_category(aldi_url)
        all_products['aldi'] = aldi_products
        print(f"[OK] Found {len(aldi_products)} ALDI products")
    except Exception as e:
        print(f"[ERROR] ALDI scraping failed: {e}")

    return all_products


def display_price_comparison(all_products):
    """Display price comparison across supermarkets"""

    print("\n" + "="*70)
    print("Price Comparison Summary")
    print("="*70)

    # Count products
    woolworths_count = len(all_products.get('woolworths', []))
    coles_count = len(all_products.get('coles', []))
    aldi_count = len(all_products.get('aldi', []))

    total = woolworths_count + coles_count + aldi_count

    print(f"\nTotal products scraped: {total}")
    print(f"  - Woolworths: {woolworths_count} products")
    print(f"  - Coles: {coles_count} products")
    print(f"  - ALDI: {aldi_count} products")

    # Calculate average prices
    print("\nAverage Prices:")

    if woolworths_count > 0:
        woolworths_prices = [p.get('price', 0) for p in all_products['woolworths'] if p.get('price') is not None]
        if woolworths_prices:
            woolworths_avg = sum(woolworths_prices) / len(woolworths_prices)
            print(f"  - Woolworths: ${woolworths_avg:.2f}")

    if coles_count > 0:
        coles_prices = [p.get('price', 0) for p in all_products['coles'] if p.get('price') is not None]
        if coles_prices:
            coles_avg = sum(coles_prices) / len(coles_prices)
            print(f"  - Coles: ${coles_avg:.2f}")

    if aldi_count > 0:
        aldi_prices = [p.get('price', 0) for p in all_products['aldi'] if p.get('price') is not None]
        if aldi_prices:
            aldi_avg = sum(aldi_prices) / len(aldi_prices)
            print(f"  - ALDI: ${aldi_avg:.2f}")

    # Sample products from each
    print("\n" + "="*70)
    print("Sample Products from Each Supermarket")
    print("="*70)

    for supermarket, products in all_products.items():
        if products:
            print(f"\n{supermarket.upper()} - Sample Products:")
            print("-"*70)
            for product in products[:3]:
                name = product.get('name', 'N/A')
                price = product.get('price', 'N/A')

                # Handle different price formats
                if price != 'N/A':
                    # Check for unit information
                    unit = product.get('unit', product.get('cup_string', ''))
                    if unit:
                        print(f"  {name}: ${price} ({unit})")
                    else:
                        print(f"  {name}: ${price}")
                else:
                    print(f"  {name}: Price not available")


def save_all_products(all_products, filename="all_supermarkets_products.json"):
    """Save all products to a single JSON file"""

    # Add metadata
    output = {
        'scraped_at': time.strftime('%Y-%m-%d %H:%M:%S'),
        'supermarkets': {
            'woolworths': {
                'count': len(all_products.get('woolworths', [])),
                'products': all_products.get('woolworths', [])
            },
            'coles': {
                'count': len(all_products.get('coles', [])),
                'products': all_products.get('coles', [])
            },
            'aldi': {
                'count': len(all_products.get('aldi', [])),
                'products': all_products.get('aldi', [])
            }
        },
        'total_products': sum(len(products) for products in all_products.values())
    }

    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=2, ensure_ascii=False)

    print(f"\n[OK] Saved all products to: {filename}")


def main():
    """Example usage"""

    # Example 1: Scrape vegetables from all supermarkets
    print("EXAMPLE: Scraping vegetables from all supermarkets")
    print()

    all_products = scrape_all_supermarkets(
        search_term="vegetables",
        aldi_category="/products/fruits-vegetables/fresh-vegetables/k/1111111153"
    )

    # Display comparison
    display_price_comparison(all_products)

    # Save to file
    save_all_products(all_products)

    print("\n" + "="*70)
    print("Scraping Complete!")
    print("="*70)
    print("\nNext Steps:")
    print("1. Check all_supermarkets_products.json for complete data")
    print("2. Integrate this data into your meal planning database")
    print("3. Build price comparison features in your app")
    print("4. Schedule daily scraping to keep prices updated")


if __name__ == "__main__":
    main()
