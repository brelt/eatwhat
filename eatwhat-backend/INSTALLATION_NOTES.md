# Scraper Installation Notes

## Issue Encountered

When installing Playwright's Chromium browser, you may encounter a permission error:

```
Error: EPERM: operation not permitted, open 'C:\Users\Brad Zhang\AppData\Local\ms-playwright\chromium-1200\chrome-win64\D3DCompiler_47.dll'
```

## Solutions

### Option 1: Run PowerShell as Administrator

1. **Close all terminals**
2. **Right-click PowerShell** → **Run as Administrator**
3. **Navigate to the backend folder:**
   ```powershell
   cd "C:\Users\Brad Zhang\Documents\GitHub\eatwhat\eatwhat-backend"
   ```
4. **Install Chromium:**
   ```powershell
   playwright install chromium
   ```

### Option 2: Disable Antivirus Temporarily

Some antivirus software blocks Playwright installation:
1. Temporarily disable your antivirus
2. Run `playwright install chromium`
3. Re-enable antivirus after installation

### Option 3: Manual Installation Path

If the above don't work, you can:
1. Download Chromium manually from the Playwright CDN
2. Extract to: `C:\Users\Brad Zhang\AppData\Local\ms-playwright\chromium-1200\`

### Option 4: Use Alternative Scraping Method

I've created a simpler test scraper (`woolworths_simple_test.py`) that uses Selenium instead, which might work better on your system.

## Testing Installation

After successful installation, run:

```bash
python woolworths_scraper_poc.py
```

If you see products being scraped, it's working!

## Next Steps

Once Chromium is installed successfully, the scraper should work. If you continue to have issues, we can:
1. Try Selenium WebDriver instead of Playwright
2. Use a cloud scraping service
3. Explore the RapidAPI Woolworths Products API as a paid alternative
