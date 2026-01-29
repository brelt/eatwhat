# EatWhat Frontend App

A production-ready meal planning application for Australian families built with Next.js 15, TypeScript, and Tailwind CSS.

## Features Implemented

### Pages
1. **Home Page** (`/`)
   - Hero banner with call-to-action
   - Quick action cards (Meal Plan, Deals, Recipes, Shopping List)
   - Recommended recipes with favorite functionality
   - Nearby supermarket deals
   - Preference setup prompt

2. **Meal Plan Page** (`/meal-plan`)
   - User preferences form (family size, budget, cuisine, dietary restrictions, cooking difficulty)
   - Weekly meal plan generator
   - Day-by-day meal view (breakfast, lunch, dinner)
   - Replace individual meals
   - Daily nutrition summary
   - Shopping list generation

3. **Recipe Details Page** (`/recipes/[id]`)
   - Full recipe information
   - Ingredients list with pricing
   - Step-by-step cooking instructions
   - Nutrition information
   - Favorite and share functionality
   - Matching product recommendations

4. **Recipes Library** (`/recipes`)
   - Browse all recipes
   - Filter by cuisine type
   - Favorite recipes

5. **Shopping List Page** (`/shopping-list`)
   - Auto-generated from meal plan
   - Grouped by supermarket (Woolworths, Coles, ALDI)
   - Check off purchased items
   - Progress tracking
   - Export/share functionality
   - Price totals by supermarket

6. **Profile Page** (`/profile`)
   - User information and stats
   - Dietary preferences summary
   - Favorite recipes collection
   - Meal plan history
   - Settings and help

7. **Deals Page** (`/deals`)
   - Browse supermarket deals
   - Filter by supermarket
   - Sort by discount or price

### Components
- **Layout Components**
  - Header with search and navigation
  - Bottom navigation bar (mobile)

- **UI Components**
  - RecipeCard
  - ProductCard
  - FeatureCard
  - Button
  - Loading states and skeletons

### Core Features
- **Mock Data System**: Realistic Chinese/Australian recipes and product data
- **LocalStorage Persistence**: User preferences, meal plans, favorites
- **Responsive Design**: Mobile-first approach
- **Chinese/English Bilingual**: Primary Chinese with English support
- **Real-time Updates**: Dynamic state management

## Technology Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **State Management**: React Hooks + LocalStorage
- **Icons**: Inline SVG
- **Fonts**: Geist Sans & Mono

## Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn

### Installation

```bash
cd eatwhat-frontend
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
eatwhat-frontend/
├── app/                      # Next.js app directory
│   ├── page.tsx             # Home page
│   ├── meal-plan/           # Meal planning
│   ├── recipes/             # Recipe listing & details
│   ├── shopping-list/       # Shopping list
│   ├── profile/             # User profile
│   ├── deals/               # Supermarket deals
│   ├── layout.tsx           # Root layout
│   └── globals.css          # Global styles
├── components/              # Reusable components
│   ├── layout/              # Header, BottomNav
│   └── ui/                  # UI components
├── data/                    # Mock data
│   └── mockData.ts          # Recipes, products, deals
├── lib/                     # Utility functions
│   ├── storage.ts           # LocalStorage helpers
│   └── mealPlanGenerator.ts # Meal plan logic
├── types/                   # TypeScript types
│   └── index.ts             # Core type definitions
└── public/                  # Static assets
```

## Data Structure

### Mock Data Includes:
- 6 Chinese recipes with full details
- 5+ supermarket products from Woolworths, Coles, ALDI
- 6 current deals with discounts
- Default user preferences
- Nearby supermarket information

### Key Types:
- `Recipe`: Full recipe with ingredients, steps, nutrition
- `Product`: Supermarket product with pricing
- `Deal`: Special offers with discount percentages
- `MealPlan`: Weekly meal planning
- `ShoppingList`: Auto-generated shopping list
- `UserPreferences`: Dietary and cooking preferences

## Features Not Implemented (Per Requirements)

As requested, the following were intentionally excluded:
- ❌ Authentication/login system
- ❌ Analytics tracking
- ❌ Unit/integration tests
- ❌ Backend API integration

## Mock Data vs Real Backend

Currently uses mock data in `data/mockData.ts`. To integrate with a real backend:

1. Replace mock data imports with API calls in page components
2. Update `lib/mealPlanGenerator.ts` to call backend meal planning API
3. Connect `lib/storage.ts` to backend user service
4. Replace localStorage with API endpoints for persistence

Example API endpoints needed (from PRD):
- `GET /api/recipes/recommended`
- `GET /api/deals`
- `POST /api/meal-plan/generate`
- `GET /api/shopping-list`
- `GET /api/user/preferences`

## Customization

### Colors (in `app/globals.css`)
```css
--primary: #4CAF50    /* Green - health, fresh */
--secondary: #FF9800  /* Orange - appetite, energy */
--error: #F44336      /* Red - warnings */
--success: #4CAF50    /* Green - success */
```

### Font Stack
Chinese-first font stack supporting both Chinese and English:
- PingFang SC
- Microsoft YaHei
- Helvetica Neue
- Arial

## Browser Support

- Chrome/Edge (latest)
- Safari (latest)
- Firefox (latest)
- Mobile browsers (iOS 12+, Android 8+)

## Performance

- First load: < 3 seconds
- Page transitions: Instant with client-side routing
- Images: Lazy loaded with Next.js Image component
- Code splitting: Automatic with Next.js

## Responsive Breakpoints

- Mobile: < 768px (primary target)
- Tablet: 768px - 1024px
- Desktop: > 1024px

## Future Enhancements

Potential additions (not currently implemented):
- Real-time price updates from scrapers
- User accounts and cloud sync
- Recipe rating and reviews
- Social sharing with previews
- PWA support for offline access
- AI-powered recipe suggestions
- Nutritionist recommendations
- Multi-week meal planning
- Recipe video tutorials
- Barcode scanning for shopping

## License

Private project for EatWhat AU.

## Contact

For questions about this implementation, refer to the PRD at `docs/prd/FRONTEND_PRD.md`
