# Unsplash Images Used in EatWhat Landing Page

This document lists all Unsplash images integrated into the EatWhat landing page.

---

## Images Used

### 1. Hero Section Image
**Location:** `components/Hero.js`

**Image URL:**
```
https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=1200&h=800&fit=crop
```

**Description:** Family meal planning and cooking together - warm kitchen scene with fresh ingredients

**Photo by:** Unsplash (royalty-free)

**Usage:** Hero section illustration showing meal planning concept

**Alternative search terms if you want to replace:**
- "family cooking together"
- "meal planning kitchen"
- "fresh ingredients table"

---

### 2. Features Section Image
**Location:** `components/Feature.js`

**Image URL:**
```
https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&h=800&fit=crop
```

**Description:** Fresh groceries and vegetables at supermarket - colorful produce display

**Photo by:** Unsplash (royalty-free)

**Usage:** Features section illustration showing grocery shopping and fresh produce

**Alternative search terms if you want to replace:**
- "grocery shopping cart"
- "fresh vegetables supermarket"
- "colorful produce"

---

## Configuration

### Next.js Image Configuration
File: `next.config.js`

```javascript
module.exports = {
  images: {
    domains: ['images.unsplash.com', 'unsplash.com'],
  },
}
```

This configuration allows Next.js to optimize and serve images from Unsplash's CDN.

---

## Unsplash License

All images from Unsplash are provided under the [Unsplash License](https://unsplash.com/license):

✅ **You can:**
- Use for free
- Use for commercial purposes
- No permission needed
- No attribution required (but appreciated)

❌ **You cannot:**
- Sell unmodified images
- Compile into a competing service
- Use for trademark/service mark

---

## Finding More Images

### Direct Unsplash URLs

To find and replace images, visit these Unsplash collections:

1. **Meal Planning:**
   - https://unsplash.com/s/photos/meal-planning
   - https://unsplash.com/s/photos/family-cooking

2. **Grocery Shopping:**
   - https://unsplash.com/s/photos/grocery-shopping
   - https://unsplash.com/s/photos/supermarket

3. **Fresh Food:**
   - https://unsplash.com/s/photos/fresh-vegetables
   - https://unsplash.com/s/photos/groceries

### How to Replace an Image

1. Go to Unsplash and find an image you like
2. Click on the image to open its detail page
3. Right-click the image and select "Copy image address"
4. The URL will be in this format: `https://images.unsplash.com/photo-XXXXXXXXX...`
5. Replace the URL in the component file
6. Restart the dev server for changes to take effect

**Example:**
```javascript
// In Hero.js or Feature.js
<Image
  src="https://images.unsplash.com/photo-YOUR-NEW-IMAGE-ID?w=1200&h=800&fit=crop"
  alt="Your image description"
  // ... other props
/>
```

---

## Image Optimization Tips

### URL Parameters

Unsplash URLs support parameters for optimization:

```
?w=1200          # Width in pixels
&h=800           # Height in pixels
&fit=crop        # Crop to fit dimensions
&q=80            # Quality (1-100)
&auto=format     # Auto-select best format (WebP, etc.)
```

**Example optimized URL:**
```
https://images.unsplash.com/photo-XXXXXX?w=1200&h=800&fit=crop&q=85&auto=format
```

### Recommended Sizes

For EatWhat landing page:
- **Hero section:** 1200x800px (3:2 ratio)
- **Features section:** 1200x800px (3:2 ratio)
- **Step icons:** 400x400px (1:1 ratio)

---

## Additional Image Resources

### For Step Icons (Free.png, Standard.png, Premium.png)

Consider using:
- **Food icons from Unsplash:**
  - https://unsplash.com/s/photos/recipe-book
  - https://unsplash.com/s/photos/shopping-cart
  - https://unsplash.com/s/photos/price-tag

- **Icon libraries (free):**
  - Flaticon: https://www.flaticon.com
  - Icons8: https://icons8.com
  - Heroicons: https://heroicons.com

### For Logo

- **Design tools:**
  - Canva: https://www.canva.com (free templates)
  - Figma: https://www.figma.com (free for individuals)

---

## Attribution (Optional but Appreciated)

While not required, you can add photo credits in your footer:

```html
<footer>
  Photos by <a href="https://unsplash.com">Unsplash</a>
</footer>
```

---

## Sources

- [Meal Planning Pictures on Unsplash](https://unsplash.com/s/photos/meal-planning)
- [Family Cooking Pictures on Unsplash](https://unsplash.com/s/photos/family-cooking)
- [Grocery Shopping Pictures on Unsplash](https://unsplash.com/s/photos/grocery-shopping)
- [Supermarket Pictures on Unsplash](https://unsplash.com/s/photos/supermarket)

---

*Last updated: 2026-01-25*
*All images are royalty-free from Unsplash.com*
