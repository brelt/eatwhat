-- ============================================================
-- EatWhat Backend — Database Schema
-- Run this in Supabase SQL Editor (Settings → SQL Editor)
-- ============================================================

-- 1. user_preferences
CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    household_size INTEGER DEFAULT 1,
    weekly_budget DECIMAL(10,2),
    cuisine_preferences JSONB DEFAULT '[]'::jsonb,
    dietary_restrictions JSONB DEFAULT '[]'::jsonb,
    cooking_skill_level VARCHAR(20) DEFAULT 'medium',
    max_cooking_time INTEGER DEFAULT 60,
    location_suburb VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id)
);

ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own preferences"
ON user_preferences FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
ON user_preferences FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
ON user_preferences FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 2. recipes
CREATE TABLE recipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    name_en VARCHAR(255),
    description TEXT,
    cuisine_type VARCHAR(50),
    difficulty VARCHAR(20) CHECK (difficulty IN ('easy', 'medium', 'hard')),
    cooking_time INTEGER,
    servings INTEGER DEFAULT 2,
    image_url VARCHAR(500),
    estimated_cost DECIMAL(10,2),
    nutrition_info JSONB,
    tags JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_recipes_cuisine ON recipes(cuisine_type);
CREATE INDEX idx_recipes_difficulty ON recipes(difficulty);
CREATE INDEX idx_recipes_active ON recipes(is_active);

-- 3. recipe_ingredients
CREATE TABLE recipe_ingredients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    name_en VARCHAR(255),
    quantity DECIMAL(10,2),
    unit VARCHAR(50),
    category VARCHAR(100),
    notes TEXT
);

CREATE INDEX idx_recipe_ingredients_recipe ON recipe_ingredients(recipe_id);

-- 4. recipe_steps
CREATE TABLE recipe_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
    step_number INTEGER NOT NULL,
    instruction TEXT NOT NULL,
    image_url VARCHAR(500),
    duration INTEGER
);

CREATE INDEX idx_recipe_steps_recipe ON recipe_steps(recipe_id);

-- 5. supermarket_products
--    UNIQUE(supermarket_brand, product_id) enables upsert from scraper imports
CREATE TABLE supermarket_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supermarket_brand VARCHAR(50) NOT NULL,
    product_id VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    brand VARCHAR(100),
    size VARCHAR(50),
    image_url VARCHAR(500),
    current_price DECIMAL(10,2),
    original_price DECIMAL(10,2),
    is_on_sale BOOLEAN DEFAULT FALSE,
    discount_percentage INTEGER,
    sale_end_date DATE,
    scraped_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(supermarket_brand, product_id)
);

CREATE INDEX idx_products_supermarket ON supermarket_products(supermarket_brand);
CREATE INDEX idx_products_on_sale ON supermarket_products(is_on_sale);
CREATE INDEX idx_products_category ON supermarket_products(category);

-- 6. meal_plans
CREATE TABLE meal_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    week_start_date DATE NOT NULL,
    total_budget DECIMAL(10,2),
    preferences JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own meal plans"
ON meal_plans FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own meal plans"
ON meal_plans FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own meal plans"
ON meal_plans FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own meal plans"
ON meal_plans FOR DELETE
USING (auth.uid() = user_id);

CREATE INDEX idx_meal_plans_user ON meal_plans(user_id);
CREATE INDEX idx_meal_plans_date ON meal_plans(week_start_date);

-- 7. meal_plan_items
CREATE TABLE meal_plan_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meal_plan_id UUID REFERENCES meal_plans(id) ON DELETE CASCADE,
    recipe_id UUID REFERENCES recipes(id),
    day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6),
    meal_type VARCHAR(20) CHECK (meal_type IN ('breakfast', 'lunch', 'dinner')),
    servings INTEGER DEFAULT 2,
    estimated_cost DECIMAL(10,2),
    meal_date DATE
);

CREATE INDEX idx_meal_plan_items_plan ON meal_plan_items(meal_plan_id);

-- 8. user_favorites
CREATE TABLE user_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, recipe_id)
);

ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own favorites"
ON user_favorites FOR ALL
USING (auth.uid() = user_id);

CREATE INDEX idx_user_favorites_user ON user_favorites(user_id);
CREATE INDEX idx_user_favorites_recipe ON user_favorites(recipe_id);
