# Unsplash Images Used in EatWhat Frontend

This document lists all Unsplash images used in the application for easy reference and license compliance.

## License

All images are from [Unsplash](https://unsplash.com/) and are free to use under the [Unsplash License](https://unsplash.com/license).

## Recipe Images (800x600)

| Recipe | Image URL | Photo ID |
|--------|-----------|----------|
| 宫保鸡丁 (Kung Pao Chicken) | https://images.unsplash.com/photo-1603360946369-dc9bb6258143 | 1603360946369 |
| 西兰花炒牛肉 (Beef and Broccoli) | https://images.unsplash.com/photo-1626804475297-41608ea09aeb | 1626804475297 |
| 番茄炒鸡蛋 (Tomato and Egg) | https://images.unsplash.com/photo-1565557623262-b51c2513a641 | 1565557623262 |
| 红烧排骨 (Braised Pork Ribs) | https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba | 1529692236671 |
| 麻婆豆腐 (Mapo Tofu) | https://images.unsplash.com/photo-1633337606656-2f4b638d2b86 | 1633337606656 |
| 清蒸鲈鱼 (Steamed Sea Bass) | https://images.unsplash.com/photo-1580959375944-c8f8a73e71b0 | 1580959375944 |

## Product Images (400x400)

| Product | Supermarket | Image URL | Photo ID |
|---------|-------------|-----------|----------|
| Chicken Breast Fillets | Woolworths | https://images.unsplash.com/photo-1604503468506-a8da13d82791 | 1604503468506 |
| Fresh Broccoli | Coles | https://images.unsplash.com/photo-1459411552884-841db9b3cc2a | 1459411552884 |
| Jasmine Rice 5kg | ALDI | https://images.unsplash.com/photo-1586201375761-83865001e31c | 1586201375761 |
| Soy Sauce 500ml | Woolworths | https://images.unsplash.com/photo-1562843142-c4e7c6b78fa3 | 1562843142 |
| Beef Mince | Coles | https://images.unsplash.com/photo-1603048588665-791ca8aea617 | 1603048588665 |

## Deal Images (400x400)

| Deal Item | Supermarket | Image URL | Photo ID |
|-----------|-------------|-----------|----------|
| Atlantic Salmon Fillets | Woolworths | https://images.unsplash.com/photo-1485921325833-c519f76c4927 | 1485921325833 |
| Bok Choy | Coles | https://images.unsplash.com/photo-1557844352-761f2565b576 | 1557844352-761 |
| Premium Olive Oil 1L | ALDI | https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5 | 1474979266404 |
| Pork Loin Chops | Woolworths | https://images.unsplash.com/photo-1602470520998-f4a52199a3d6 | 1602470520998 |
| Cherry Tomatoes 250g | Coles | https://images.unsplash.com/photo-1592841200221-a6898f307baa | 1592841200221 |
| Chinese Cabbage | ALDI | https://images.unsplash.com/photo-1604667388922-2b0b77293e76 | 1604667388922 |

## Image Parameters

All images use the following Unsplash URL parameters:
- `w`: Width (800 for recipes, 400 for products/deals)
- `h`: Height (600 for recipes, 400 for products/deals)
- `fit=crop`: Ensures images are cropped to exact dimensions

Example: `https://images.unsplash.com/photo-{id}?w=800&h=600&fit=crop`

## Replacing Images

To replace any image:

1. Find a suitable image on [Unsplash.com](https://unsplash.com/)
2. Copy the photo ID from the URL (e.g., `1603360946369` from `https://unsplash.com/photos/xyz-1603360946369`)
3. Update the image URL in `data/mockData.ts`
4. Add the new image to this documentation

## Attribution

While not required by the Unsplash License, consider giving credit to photographers:
- Recipe photos: Various Unsplash contributors
- Product photos: Various Unsplash contributors
- All images curated for food/ingredient relevance

## Notes

- All images are loaded directly from Unsplash CDN
- No need to download or host images locally
- Images are automatically optimized by Next.js Image component
- Unsplash URLs are permanent and won't expire
- Images load fast due to Unsplash's global CDN

## For Production

When deploying to production, consider:
1. Downloading images and hosting locally for better control
2. Optimizing images further with WebP format
3. Adding proper alt text for accessibility
4. Implementing lazy loading (already done with Next.js Image)

## Search Keywords Used

For finding suitable images on Unsplash:
- Chinese food, Asian cuisine, stir fry
- Chicken, beef, pork, seafood
- Vegetables, broccoli, tomatoes, cabbage
- Rice, soy sauce, olive oil
- Fresh produce, groceries

---

Last updated: 2026-01-29
