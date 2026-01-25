# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Project Overview

**EatWhat (本周吃什么)** is a meal planning application for Australian families that:
- Scrapes grocery prices from Woolworths, Coles, and ALDI (covering ~75% of Australian grocery market)
- Compares prices across supermarkets to help users save money
- Generates personalized weekly meal plans
- Targets Australian Chinese families and health-conscious consumers

**Repository Structure:**
```
eatwhat/
├── eatwhat-backend/      # Python scrapers for supermarket data
├── eatwhat-landingpage/  # Next.js marketing landing page
├── eatwhat-frontend/     # Main app frontend (placeholder)
└── docs/prd/            # Product requirement documents
```

---

## Backend (Python Scrapers)

### Working Directory
```bash
cd eatwhat-backend
```

### Setup
```bash
# Install dependencies
pip install -r requirements.txt

# Install Playwright browser (required for some scrapers)
playwright install chromium
```

### Running Scrapers

**Individual scrapers (production-ready):**
```bash
# Woolworths (API-based, most reliable)
python woolworths_scraper_final.py

# Coles (HTML scraping via Next.js data)
python coles_scraper_poc.py

# ALDI (HTML scraping via Nuxt.js product tiles)
python aldi_scraper_final.py

# All three supermarkets at once
python scrape_all_supermarkets.py
```

**Output:** Each scraper saves JSON files with product data (name, price, unit, images, sale status)

### Scraper Architecture

**Three distinct approaches based on supermarket technology:**

1. **Woolworths** (`woolworths_scraper_final.py`):
   - Uses public Search API endpoint
   - Most reliable and fast
   - No browser needed
   - Returns ~20-36 products per search

2. **Coles** (`coles_scraper_poc.py`):
   - Extracts `__NEXT_DATA__` from Next.js pages
   - HTML parsing with BeautifulSoup
   - May encounter bot detection
   - Returns ~48 products per search

3. **ALDI** (`aldi_scraper_final.py`):
   - Parses `.product-tile` elements from Nuxt.js pages
   - Category-based URLs (no keyword search)
   - Returns ~30 products per category
   - Example URL format: `/products/fruits-vegetables/fresh-fruits/k/1111111152`

**Key Classes:**
- `WoolworthsScraper`: API-based scraper with `search_products(term, page_size)` method
- `ColesScraperPOC`: HTML scraper with `search_products(term)` and `_extract_next_data()` methods
- `AldiScraper`: Category scraper with `scrape_category(url)` and `_parse_product_tile()` methods

**Important Files:**
- `SCRAPERS_README.md` - Complete documentation on all scrapers
- `ALDI_README.md` - ALDI-specific documentation with category URLs
- `SCRAPING_COMPLETE.md` - Summary of scraping capabilities

### Testing Individual Components
```bash
# Debug/discovery tools
python check_aldi_products.py          # Analyze ALDI page structure
python woolworths_simple_scraper.py    # Test Woolworths API
python coles_endpoint_tester.py        # Test Coles endpoints
```

### Best Practices for Scrapers
- Add 2-3 second delays between requests to avoid rate limiting
- Cache results aggressively (prices don't change hourly)
- Handle bot detection gracefully (especially for Coles)
- Never scrape more than needed for testing
- Respect robots.txt

---

## Landing Page (Next.js)

### Working Directory
```bash
cd eatwhat-landingpage
```

### Development
```bash
# Install dependencies
npm install

# Start dev server
npm run dev
# Opens at http://localhost:3000

# Build for production
npm run build

# Start production server
npm start

# Export static site
npm run export
```

### Customization Status

**Already customized for EatWhat:**
- ✅ Hero section with Australian market messaging
- ✅ Features section highlighting price comparison across 3 supermarkets
- ✅ "How It Works" 3-step process (replaces pricing section)
- ✅ SEO metadata for Australian market
- ✅ Navigation updated (About, Feature, How It Works, FAQ)

**Key Files:**
- `components/Hero.js` - Main hero section
- `components/Feature.js` - Feature highlights
- `components/Pricing.js` - "How It Works" section (renamed from Pricing)
- `components/Layout/Header.js` - Navigation
- `components/SeoHead.js` - SEO metadata
- `CUSTOMIZATION_SUMMARY.md` - Complete customization documentation

### Still Needs Work
- Replace placeholder images (Illustration1.png, Illustration2.png)
- Add EatWhat logo (currently uses LaslesVPN logo)
- Update brand colors in `tailwind.config.js`
- Add real testimonials

---

## Product Requirements Documents

Located in `docs/prd/` and component directories:

- `eatwhat-backend/BACKEND_PRD.md` - Backend API specs, database schema
- `eatwhat-landingpage/LANDING_PRD.md` - Landing page requirements
- `eatwhat-frontend/FRONTEND_PRD.md` - Main app frontend specs

**Important:** All PRDs are in Chinese (中文) with some English. The target market is Australian Chinese families, but the app should support both English and Chinese.

---

## Database Schema (Planned)

From `BACKEND_PRD.md`, the system will use PostgreSQL with tables for:
- `users`, `user_preferences` - User accounts and dietary preferences
- `recipes`, `recipe_ingredients`, `recipe_instructions` - Recipe database
- `products`, `price_history` - Supermarket product data
- `meal_plans`, `weekly_meal_plans` - User meal planning
- `shopping_lists` - Auto-generated from recipes
- `ingredient_product_matches` - Links recipe ingredients to grocery products

**Not yet implemented** - Backend API and database are planned but not built.

---

## Recipe-to-Product Matching Strategy

This is the core unsolved challenge: matching recipe ingredients to scraped grocery products.

**Recommended approaches (from conversation):**

1. **Recipe APIs**: Use Spoonacular API ($49/month) or TheMealDB (free) for structured recipe data
2. **Fuzzy Matching**: Use `fuzzywuzzy` library to match ingredient names to product names
3. **AI Generation**: Use OpenAI GPT-4 or Chinese LLMs (文心一言, 通义千问) to generate recipes from weekly sales
4. **Hybrid**: Combine API recipes + AI generation + fuzzy product matching

**Key matching algorithm components:**
- Ingredient parsing (quantity, unit, ingredient name)
- Normalization (handle aliases: "chicken breast" = "chicken breast fillet")
- Fuzzy string matching (similarity threshold >70%)
- Price comparison across supermarkets
- Unit conversion for accurate price-per-recipe-unit calculation

---

## Important Conventions

### Supermarket Data
- Always include `supermarket` field: "Woolworths", "Coles", or "ALDI" (exact casing)
- Price fields should be numeric (not strings)
- Include `on_sale` boolean flag
- Store `scraped_at` timestamp for data freshness

### File Naming
- Production scrapers: `*_scraper_final.py`
- Proof-of-concept: `*_scraper_poc.py`
- Debug tools: `*_tester.py`, `*_network_capture.py`, `check_*.py`
- Output files: `{supermarket}_products.json`

### Chinese/English
- Code and comments: English
- PRD documents: Chinese (中文)
- User-facing content: Bilingual (中文/English)
- Database: Use English field names

---

## Common Issues

### Scrapers

**Chromium Installation Fails:**
```bash
# Run PowerShell as Administrator
playwright install chromium
```

**Coles Bot Detection:**
- Increase delays between requests (3+ seconds)
- May show "Pardon Our Interruption" page
- Wait 30+ minutes if blocked, then retry

**ALDI Products Not Found:**
- ALDI uses category URLs, not keyword search
- Use URLs from `ALDI_README.md` category list
- Format: `/products/{category}/{subcategory}/k/{id}`

**Unicode Errors on Windows:**
- Scripts handle this by avoiding Unicode symbols
- Output uses ASCII-safe characters: [OK], [X], [WARNING]

### Landing Page

**Dev Server Won't Start:**
```bash
# Update browserslist database
npx update-browserslist-db@latest
```

**Missing Components:**
- Components folder should exist (already copied from parent)
- If missing, copy from `../eatwhat/components/`

---

## Deployment (Future)

**Backend:**
- Python scrapers will run as scheduled Celery tasks
- API server: FastAPI or Django REST Framework
- Database: PostgreSQL + Redis cache
- Hosting: AWS/GCP/Azure

**Landing Page:**
- Deploy to Vercel or Netlify
- Custom domain: eatwhat.com.au (planned)
- Static export available via `npm run export`

---

## External Resources

**Australian Supermarket APIs:**
- https://github.com/drkno/au-supermarket-apis - OpenAPI specs
- https://github.com/tjhowse/aus_grocery_price_database - Similar project

**Recipe APIs:**
- Spoonacular: https://spoonacular.com/food-api (paid, recommended)
- Edamam: https://developer.edamam.com/ (freemium)
- TheMealDB: https://www.themealdb.com/api.php (free)

**Chinese AI Tools for Graphics:**
- 文心一格 (Yige): https://yige.baidu.com - Free AI image generation
- 通义万相: https://tongyi.aliyun.com/wanxiang - Alibaba AI art
- iconfont.cn: https://www.iconfont.cn - Free icon library

---

## Development Workflow

When adding new features:

1. **Scrapers**: Create `*_poc.py` for testing, then `*_final.py` for production
2. **Documentation**: Update relevant `*_README.md` file
3. **Output**: Save JSON files for inspection
4. **Testing**: Run against real websites with delays

When modifying landing page:

1. **Components**: Edit individual component files in `components/`
2. **Testing**: Run `npm run dev` and check http://localhost:3000
3. **Documentation**: Update `CUSTOMIZATION_SUMMARY.md` if changing structure

---

## Notes

- This is an early-stage project with working scrapers but no backend API yet
- Focus has been on proving scraping feasibility across all 3 major Australian supermarkets
- Next priority: Backend API development or recipe matching system
- The landing page is customized and ready for deployment with placeholder graphics
