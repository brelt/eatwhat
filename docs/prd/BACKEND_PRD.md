# Backend API PRD - 本周吃什么 (EatWhat AU) - MVP Version

## 文档信息
- **产品名称**：本周吃什么 / What to Eat This Week
- **目标市场**：澳大利亚
- **文档版本**：v2.0 - MVP Lean Version
- **更新日期**：2026-01-29
- **文档类型**：Backend API 产品需求文档 (MVP)
- **文档范围**：Express API服务器 + Supabase后端

---

## 1. 产品概述

### 1.1 产品定位
一句话描述：收集附近各大超市个性化菜品定制规划一周健康伙食食谱

### 1.2 目标市场
**澳大利亚** - 主要面向在澳华人家庭及对中式/亚洲饮食感兴趣的本地用户

### 1.3 MVP核心职责
1. **数据存储**：使用Supabase存储所有数据
2. **用户认证**：Supabase Auth（无需自建）
3. **API服务**：Express.js提供RESTful API
4. **业务逻辑**：食谱推荐、食谱计划生成、价格比较
5. **数据采集**：运行现有Python爬虫，导入数据到Supabase

---

## 2. 系统架构 (MVP Simplified)

### 2.1 技术栈

#### 核心技术
- **编程语言**：Node.js 18+ (TypeScript)
- **Web框架**：Express.js
- **数据库**：Supabase PostgreSQL (托管)
- **认证**：Supabase Auth (内置)
- **Web爬虫**：现有Python爬虫（独立运行）

#### 排除项（MVP阶段不需要）
- ❌ Redis缓存
- ❌ Docker/Docker Compose
- ❌ 负载均衡
- ❌ 任务队列（Celery/Bull）
- ❌ 监控系统（Prometheus/Grafana）
- ❌ 日志系统（ELK Stack）

### 2.2 简化架构图
```
┌─────────────┐
│   Frontend  │
│   (Next.js) │
└──────┬──────┘
       │ HTTPS/REST
       ▼
┌─────────────┐
│ Express API │ (本地运行: http://localhost:3000)
│  (Node.js)  │
└──────┬──────┘
       │
       ▼
┌──────────────────────────────┐
│      Supabase (Cloud)        │
│  - PostgreSQL Database       │
│  - Authentication            │
│  - Storage (for images)      │
└──────────────────────────────┘
       ▲
       │
┌──────┴──────┐
│  Python     │ (手动运行，导入数据)
│  Scrapers   │
└─────────────┘
```

---

## 3. 数据库设计 (Supabase PostgreSQL)

### 3.1 核心数据表

#### 3.1.1 用户相关表

**users (由Supabase Auth自动管理)**
- Supabase自动创建`auth.users`表
- 无需手动创建用户表
- 使用`auth.uid()`获取当前用户ID

**user_preferences (用户偏好表)**
```sql
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

-- Row Level Security
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
```

#### 3.1.2 食谱相关表

**recipes (食谱表)**
```sql
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
```

**recipe_ingredients (食谱食材表)**
```sql
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
```

**recipe_steps (烹饪步骤表)**
```sql
CREATE TABLE recipe_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
    step_number INTEGER NOT NULL,
    instruction TEXT NOT NULL,
    image_url VARCHAR(500),
    duration INTEGER
);

CREATE INDEX idx_recipe_steps_recipe ON recipe_steps(recipe_id);
```

#### 3.1.3 超市相关表

**supermarket_products (超市商品表)**
```sql
CREATE TABLE supermarket_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supermarket_brand VARCHAR(50) NOT NULL,
    product_id VARCHAR(100),
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
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_products_supermarket ON supermarket_products(supermarket_brand);
CREATE INDEX idx_products_on_sale ON supermarket_products(is_on_sale);
CREATE INDEX idx_products_category ON supermarket_products(category);
```

#### 3.1.4 食谱计划相关表

**meal_plans (食谱计划表)**
```sql
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

CREATE INDEX idx_meal_plans_user ON meal_plans(user_id);
CREATE INDEX idx_meal_plans_date ON meal_plans(week_start_date);
```

**meal_plan_items (食谱计划项表)**
```sql
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
```

#### 3.1.5 用户行为表

**user_favorites (用户收藏表)**
```sql
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
```

---

## 4. API接口设计 (MVP)

### 4.1 认证 (Supabase Auth)

使用Supabase客户端SDK处理认证，无需自建API：

```typescript
// 前端直接调用Supabase Auth
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// 注册
await supabase.auth.signUp({ email, password })

// 登录
await supabase.auth.signInWithPassword({ email, password })

// 获取用户
const { data: { user } } = await supabase.auth.getUser()
```

**后端验证Token：**
```typescript
// Express middleware
const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '')
  const { data, error } = await supabase.auth.getUser(token)
  if (error) return res.status(401).json({ error: 'Unauthorized' })
  req.user = data.user
  next()
}
```

---

### 4.2 用户偏好API

#### GET /api/user/preferences
获取用户偏好设置

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "success": true,
  "data": {
    "household_size": 2,
    "weekly_budget": 100.00,
    "cuisine_preferences": ["Chinese"],
    "dietary_restrictions": [],
    "cooking_skill_level": "medium",
    "max_cooking_time": 60,
    "location_suburb": "Sydney"
  }
}
```

#### PUT /api/user/preferences
更新用户偏好

**Request:**
```json
{
  "household_size": 4,
  "weekly_budget": 200.00,
  "cuisine_preferences": ["Chinese", "Japanese"]
}
```

---

### 4.3 食谱API

#### GET /api/recipes
获取食谱列表

**Query Parameters:**
- `limit`: 返回数量 (默认: 20)
- `offset`: 分页偏移 (默认: 0)
- `cuisine_type`: 菜系筛选
- `difficulty`: 难度筛选
- `max_time`: 最大烹饪时间
- `max_cost`: 最大成本

**Response:**
```json
{
  "success": true,
  "data": {
    "recipes": [
      {
        "id": "uuid",
        "name": "宫保鸡丁",
        "name_en": "Kung Pao Chicken",
        "cuisine_type": "Chinese",
        "difficulty": "medium",
        "cooking_time": 30,
        "servings": 4,
        "image_url": "https://...",
        "estimated_cost": 18.50,
        "nutrition_info": {
          "calories": 385,
          "protein": 32,
          "carbs": 18,
          "fat": 22
        }
      }
    ],
    "total": 100,
    "offset": 0,
    "limit": 20
  }
}
```

#### GET /api/recipes/:id
获取食谱详情

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "宫保鸡丁",
    "description": "经典川菜...",
    "ingredients": [
      {
        "name": "鸡胸肉",
        "quantity": 500,
        "unit": "g",
        "category": "Meat"
      }
    ],
    "steps": [
      {
        "step_number": 1,
        "instruction": "将鸡胸肉切成块...",
        "duration": 15
      }
    ],
    "nutrition_info": {...}
  }
}
```

---

### 4.4 超市优惠API

#### GET /api/deals
获取超市优惠商品

**Query Parameters:**
- `supermarket`: 超市筛选 (woolworths, coles, aldi)
- `category`: 商品分类
- `limit`: 返回数量

**Response:**
```json
{
  "success": true,
  "data": {
    "deals": [
      {
        "id": "uuid",
        "name": "Chicken Breast 1kg",
        "supermarket_brand": "Woolworths",
        "current_price": 12.50,
        "original_price": 15.00,
        "discount_percentage": 17,
        "sale_end_date": "2026-01-31",
        "image_url": "https://..."
      }
    ]
  }
}
```

---

### 4.5 食谱计划API

#### POST /api/meal-plan/generate
生成一周食谱计划

**Request:**
```json
{
  "week_start_date": "2026-01-27",
  "preferences": {
    "household_size": 2,
    "weekly_budget": 100.00,
    "cuisine_preferences": ["Chinese"],
    "dietary_restrictions": [],
    "max_cooking_time": 60
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "meal_plan_id": "uuid",
    "week_start_date": "2026-01-27",
    "total_cost": 95.50,
    "meals": [
      {
        "day_of_week": 0,
        "meal_type": "dinner",
        "recipe": {
          "id": "uuid",
          "name": "宫保鸡丁",
          "estimated_cost": 18.50
        }
      }
    ]
  }
}
```

#### PUT /api/meal-plan/:id/replace
替换食谱计划中的某餐

**Request:**
```json
{
  "meal_plan_item_id": "uuid"
}
```

**Response:** 返回新的食谱

#### GET /api/meal-plan/:id
获取食谱计划详情

---

### 4.6 购物清单API

#### GET /api/shopping-list/:meal_plan_id
根据食谱计划生成购物清单

**Response:**
```json
{
  "success": true,
  "data": {
    "items_by_supermarket": {
      "Woolworths": [
        {
          "ingredient_name": "鸡胸肉",
          "quantity": 500,
          "unit": "g",
          "product": {
            "name": "Chicken Breast 1kg",
            "price": 12.50
          }
        }
      ]
    },
    "total_cost": 95.50
  }
}
```

---

### 4.7 用户行为API

#### POST /api/recipes/:id/favorite
收藏食谱

#### DELETE /api/recipes/:id/favorite
取消收藏

#### GET /api/recipes/favorites
获取收藏的食谱列表

---

## 5. 数据采集策略 (MVP)

### 5.1 使用现有Python爬虫

**当前爬虫：**
- `woolworths_scraper_final.py` ✅
- `coles_scraper_poc.py` ✅
- `aldi_scraper_final.py` ✅

**数据导入流程：**
1. 手动运行Python爬虫，生成JSON文件
2. 创建Node.js脚本读取JSON，导入到Supabase
3. 定期更新（手动触发，或简单cron）

**示例导入脚本：**
```typescript
// scripts/import-products.ts
import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function importProducts() {
  const woolworthsData = JSON.parse(fs.readFileSync('woolworths_products.json', 'utf-8'))

  for (const product of woolworthsData) {
    await supabase.from('supermarket_products').upsert({
      supermarket_brand: 'Woolworths',
      name: product.name,
      current_price: product.price,
      // ... other fields
    })
  }
}
```

### 5.2 食谱数据

**初期方案：**
- 使用前端已有的mock数据作为种子数据
- 手动添加更多食谱到Supabase
- 后期考虑从食谱网站爬取

---

## 6. 推荐算法 (MVP简化版)

### 6.1 基于规则的简单推荐

```typescript
async function recommendRecipes(preferences: UserPreferences) {
  let query = supabase
    .from('recipes')
    .select('*')
    .eq('is_active', true)

  // 过滤条件
  if (preferences.cuisine_preferences?.length > 0) {
    query = query.in('cuisine_type', preferences.cuisine_preferences)
  }

  if (preferences.max_cooking_time) {
    query = query.lte('cooking_time', preferences.max_cooking_time)
  }

  if (preferences.weekly_budget) {
    const budgetPerMeal = preferences.weekly_budget / 14 // 假设14餐
    query = query.lte('estimated_cost', budgetPerMeal)
  }

  const { data } = await query.limit(20)
  return data
}
```

### 6.2 食谱计划生成算法 (MVP)

```typescript
async function generateMealPlan(preferences: UserPreferences, weekStartDate: string) {
  // 1. 获取候选食谱
  const recipes = await recommendRecipes(preferences)

  // 2. 简单随机选择，确保不重复
  const selectedRecipes = []
  const usedRecipeIds = new Set()

  for (let day = 0; day < 7; day++) {
    for (const mealType of ['lunch', 'dinner']) {
      const availableRecipes = recipes.filter(r => !usedRecipeIds.has(r.id))
      const randomRecipe = availableRecipes[Math.floor(Math.random() * availableRecipes.length)]

      if (randomRecipe) {
        selectedRecipes.push({
          day_of_week: day,
          meal_type: mealType,
          recipe_id: randomRecipe.id,
          estimated_cost: randomRecipe.estimated_cost
        })
        usedRecipeIds.add(randomRecipe.id)
      }
    }
  }

  // 3. 保存到数据库
  const { data: mealPlan } = await supabase
    .from('meal_plans')
    .insert({
      user_id: userId,
      week_start_date: weekStartDate,
      total_budget: preferences.weekly_budget
    })
    .select()
    .single()

  await supabase.from('meal_plan_items').insert(
    selectedRecipes.map(item => ({
      ...item,
      meal_plan_id: mealPlan.id
    }))
  )

  return mealPlan
}
```

---

## 7. 环境配置

### 7.1 环境变量 (.env)

```bash
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key

# Server
PORT=3000
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3001
```

### 7.2 Supabase设置

**启用Row Level Security (RLS):**
- 用户只能访问自己的数据
- 食谱和商品数据公开可读

**启用Realtime (可选):**
- 实时更新购物清单勾选状态

---

## 8. 开发流程

### 8.1 本地开发

```bash
# 1. 克隆仓库
cd eatwhat/eatwhat-backend

# 2. 安装依赖
npm install

# 3. 配置环境变量
cp .env.example .env
# 编辑.env，填入Supabase凭据

# 4. 运行开发服务器
npm run dev

# 5. API运行在 http://localhost:3000
```

### 8.2 数据导入

```bash
# 1. 运行Python爬虫
cd eatwhat-backend
python scrape_all_supermarkets.py

# 2. 导入数据到Supabase
npm run import:products

# 3. 导入食谱数据
npm run import:recipes
```

---

## 9. 里程碑规划 (MVP)

### Week 1: 项目搭建
- [x] Express服务器初始化
- [ ] Supabase项目设置
- [ ] 数据库表创建
- [ ] TypeScript类型定义

### Week 2: 核心API
- [ ] 用户偏好API
- [ ] 食谱列表/详情API
- [ ] 超市优惠API
- [ ] 基础推荐算法

### Week 3: 食谱计划
- [ ] 食谱计划生成API
- [ ] 购物清单生成
- [ ] 替换食谱功能

### Week 4: 数据导入与测试
- [ ] 爬虫数据导入脚本
- [ ] 种子数据导入
- [ ] 前后端集成测试
- [ ] 部署到Vercel/Railway

---

## 10. 部署方案 (MVP)

### 10.1 推荐部署方式

**Option 1: Vercel (推荐)**
```bash
# 安装Vercel CLI
npm i -g vercel

# 部署
vercel

# 配置环境变量
vercel env add SUPABASE_URL
vercel env add SUPABASE_ANON_KEY
```

**Option 2: Railway**
- 自动部署Node.js项目
- 内置环境变量管理
- 免费额度足够MVP使用

**Option 3: Render**
- 免费tier支持Express
- 简单配置即可部署

### 10.2 数据库
- Supabase托管（免费tier: 500MB数据库）
- 无需自己管理PostgreSQL

---

## 11. 成本估算 (MVP)

| 服务 | 免费额度 | 成本 |
|------|---------|------|
| Supabase | 500MB数据库 + 1GB存储 + 50,000 MAU | **免费** |
| Vercel | 100GB带宽/月 | **免费** |
| 域名 | - | ~$15/年 |
| **总计** | | **~$15/年** |

---

## 12. MVP排除功能（后期添加）

以下功能在MVP阶段**不实现**：

- ❌ Redis缓存
- ❌ 自动化爬虫定时任务
- ❌ 食谱评分系统
- ❌ 分享功能（社交媒体）
- ❌ 推送通知
- ❌ 高级推荐算法（ML）
- ❌ 价格历史趋势
- ❌ 多用户协作（家庭账户）
- ❌ 监控和日志系统
- ❌ 负载测试

---

## 13. 技术栈总结

**前端:** Next.js 15 + TypeScript + Tailwind CSS ✅

**后端 (MVP):**
- Express.js + TypeScript
- Supabase PostgreSQL
- Supabase Auth
- 现有Python爬虫（手动运行）

**部署:**
- 前端: Vercel
- 后端API: Vercel/Railway
- 数据库: Supabase Cloud

---

*文档结束 - 聚焦MVP，快速上线！*
