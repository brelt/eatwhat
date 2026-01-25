# Backend API PRD - 本周吃什么 (EatWhat AU)

## 文档信息
- **产品名称**：本周吃什么 / What to Eat This Week
- **目标市场**：澳大利亚
- **文档版本**：v1.0
- **创建日期**：2026-01-13
- **文档类型**：Backend API 产品需求文档
- **文档范围**：后端服务、数据库、API接口、数据采集

---

## 1. 产品概述

### 1.1 产品定位
一句话描述：收集附近各大超市个性化菜品定制规划一周健康伙食食谱

### 1.2 目标市场
**澳大利亚** - 主要面向在澳华人家庭及对中式/亚洲饮食感兴趣的本地用户

### 1.3 目标用户
所有需要采购食材做饭的人/家庭，包括：
- 在澳华人家庭：希望用本地食材做出家乡味道
- 上班族：工作繁忙，希望高效规划每周饮食
- 留学生：预算有限，想吃得健康又省钱
- 年轻家庭：有孩子，注重营养均衡
- 健康饮食爱好者：注重营养均衡和饮食健康

### 1.4 后端核心职责
1. **数据采集**：抓取超市价格、优惠信息、食谱数据
2. **数据存储**：用户信息、食谱库、价格数据、食谱计划
3. **业务逻辑**：个性化推荐算法、食谱生成、价格比较
4. **API服务**：为前端提供RESTful API接口
5. **定时任务**：定期更新超市价格、清理过期数据

---

## 2. 系统架构

### 2.1 技术栈建议

#### 核心技术
- **编程语言**：Python 3.10+ / Node.js 18+
- **Web框架**：FastAPI / Django REST Framework / Express.js
- **数据库**：PostgreSQL (主数据库) + Redis (缓存)
- **任务队列**：Celery / Bull (定时任务和异步处理)
- **Web爬虫**：Scrapy / Puppeteer / Playwright
- **AI/ML**：OpenAI API / 本地LLM（食谱生成和推荐）

#### 基础设施
- **容器化**：Docker + Docker Compose
- **API文档**：Swagger / OpenAPI 3.0
- **日志**：ELK Stack / CloudWatch
- **监控**：Prometheus + Grafana
- **部署**：AWS / GCP / Azure

### 2.2 系统架构图
```
┌─────────────┐
│   Frontend  │
│   (Next.js) │
└──────┬──────┘
       │ HTTPS/REST
       ▼
┌─────────────────────────────────────┐
│         API Gateway / Load Balancer │
└──────────────┬──────────────────────┘
               │
       ┌───────┴───────┐
       ▼               ▼
┌─────────────┐ ┌─────────────┐
│  API Server │ │  API Server │  (可水平扩展)
│  (FastAPI)  │ │  (FastAPI)  │
└──────┬──────┘ └──────┬──────┘
       │               │
       └───────┬───────┘
               ▼
┌──────────────────────────────┐
│         Redis Cache          │
└──────────────────────────────┘
               │
               ▼
┌──────────────────────────────┐
│      PostgreSQL Database     │
│  - Users                     │
│  - Recipes                   │
│  - Supermarket Data          │
│  - Meal Plans                │
└──────────────────────────────┘
               ▲
               │
┌──────────────┴───────────────┐
│     Background Workers       │
│  - Scrapers (Celery)        │
│  - Price Updater            │
│  - Recipe Importer          │
└──────────────────────────────┘
```

---

## 3. 数据库设计

### 3.1 核心数据表

#### 3.1.1 用户相关表

**users (用户表)**
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    username VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE
);
```

**user_preferences (用户偏好表)**
```sql
CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    household_size INTEGER DEFAULT 1, -- 家庭人数
    weekly_budget DECIMAL(10,2), -- 每周预算 (AUD)
    cuisine_preferences JSONB, -- ["chinese", "western", "japanese"]
    dietary_restrictions JSONB, -- ["vegetarian", "gluten-free"]
    cooking_skill_level VARCHAR(20), -- "beginner", "intermediate", "advanced"
    max_cooking_time INTEGER, -- 最大烹饪时间（分钟）
    location_lat DECIMAL(10,8), -- 纬度
    location_lng DECIMAL(11,8), -- 经度
    location_suburb VARCHAR(100), -- 郊区名称
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 3.1.2 食谱相关表

**recipes (食谱表)**
```sql
CREATE TABLE recipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    name_en VARCHAR(255), -- 英文名称
    description TEXT,
    cuisine_type VARCHAR(50), -- "chinese", "western", etc.
    difficulty VARCHAR(20), -- "easy", "medium", "hard"
    cooking_time INTEGER, -- 烹饪时间（分钟）
    servings INTEGER DEFAULT 2, -- 份数
    image_url VARCHAR(500),
    video_url VARCHAR(500),
    source_url VARCHAR(500), -- 食谱来源URL
    nutrition_info JSONB, -- {"calories": 500, "protein": 30, ...}
    tags JSONB, -- ["quick", "healthy", "budget-friendly"]
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_recipes_cuisine ON recipes(cuisine_type);
CREATE INDEX idx_recipes_difficulty ON recipes(difficulty);
```

**recipe_ingredients (食谱食材表)**
```sql
CREATE TABLE recipe_ingredients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
    ingredient_id UUID REFERENCES ingredients(id),
    quantity DECIMAL(10,2),
    unit VARCHAR(50), -- "g", "kg", "ml", "l", "piece"
    notes TEXT, -- 备注（如"切丁"）
    is_optional BOOLEAN DEFAULT FALSE
);
```

**recipe_steps (烹饪步骤表)**
```sql
CREATE TABLE recipe_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
    step_number INTEGER NOT NULL,
    instruction TEXT NOT NULL,
    image_url VARCHAR(500),
    duration INTEGER -- 该步骤时长（分钟）
);
```

**ingredients (食材表)**
```sql
CREATE TABLE ingredients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    name_en VARCHAR(255),
    category VARCHAR(100), -- "vegetable", "meat", "seafood", etc.
    nutrition_per_100g JSONB, -- 每100g营养信息
    common_substitutes JSONB, -- 常见替代品
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_ingredients_category ON ingredients(category);
```

#### 3.1.3 超市相关表

**supermarkets (超市表)**
```sql
CREATE TABLE supermarkets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL, -- "Woolworths", "Coles", etc.
    brand VARCHAR(50) NOT NULL,
    address TEXT,
    suburb VARCHAR(100),
    state VARCHAR(50),
    postcode VARCHAR(10),
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    opening_hours JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_supermarkets_location ON supermarkets(latitude, longitude);
CREATE INDEX idx_supermarkets_suburb ON supermarkets(suburb);
```

**supermarket_products (超市商品表)**
```sql
CREATE TABLE supermarket_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supermarket_brand VARCHAR(50) NOT NULL, -- "woolworths", "coles"
    product_id VARCHAR(100), -- 超市内部商品ID
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    brand VARCHAR(100),
    size VARCHAR(50), -- "500g", "1L"
    image_url VARCHAR(500),
    ingredient_id UUID REFERENCES ingredients(id), -- 关联到食材表
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_products_supermarket ON supermarket_products(supermarket_brand);
CREATE INDEX idx_products_ingredient ON supermarket_products(ingredient_id);
```

**product_prices (商品价格历史表)**
```sql
CREATE TABLE product_prices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES supermarket_products(id),
    price DECIMAL(10,2) NOT NULL,
    original_price DECIMAL(10,2), -- 原价（如有折扣）
    is_on_sale BOOLEAN DEFAULT FALSE,
    discount_percentage INTEGER,
    sale_end_date DATE,
    scraped_at TIMESTAMP DEFAULT NOW(),
    source_url VARCHAR(500)
);

CREATE INDEX idx_prices_product ON product_prices(product_id);
CREATE INDEX idx_prices_scraped_at ON product_prices(scraped_at);
```

#### 3.1.4 食谱计划相关表

**meal_plans (食谱计划表)**
```sql
CREATE TABLE meal_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    week_start_date DATE NOT NULL,
    total_budget DECIMAL(10,2),
    status VARCHAR(20) DEFAULT 'active', -- "active", "completed", "archived"
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_meal_plans_user ON meal_plans(user_id);
CREATE INDEX idx_meal_plans_date ON meal_plans(week_start_date);
```

**meal_plan_items (食谱计划项表)**
```sql
CREATE TABLE meal_plan_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meal_plan_id UUID REFERENCES meal_plans(id) ON DELETE CASCADE,
    recipe_id UUID REFERENCES recipes(id),
    day_of_week INTEGER, -- 0=Monday, 6=Sunday
    meal_type VARCHAR(20), -- "breakfast", "lunch", "dinner"
    servings INTEGER DEFAULT 2,
    estimated_cost DECIMAL(10,2),
    notes TEXT
);
```

**shopping_lists (购物清单表)**
```sql
CREATE TABLE shopping_lists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meal_plan_id UUID REFERENCES meal_plans(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    is_completed BOOLEAN DEFAULT FALSE
);
```

**shopping_list_items (购物清单项表)**
```sql
CREATE TABLE shopping_list_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shopping_list_id UUID REFERENCES shopping_lists(id) ON DELETE CASCADE,
    ingredient_id UUID REFERENCES ingredients(id),
    product_id UUID REFERENCES supermarket_products(id), -- 推荐商品
    quantity DECIMAL(10,2),
    unit VARCHAR(50),
    estimated_price DECIMAL(10,2),
    supermarket_brand VARCHAR(50), -- 推荐超市
    is_purchased BOOLEAN DEFAULT FALSE,
    notes TEXT
);
```

#### 3.1.5 用户行为表

**user_favorites (用户收藏表)**
```sql
CREATE TABLE user_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, recipe_id)
);
```

**recipe_ratings (食谱评分表)**
```sql
CREATE TABLE recipe_ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, recipe_id)
);
```

---

## 4. API接口设计

### 4.1 认证相关API

#### POST /api/auth/register
注册新用户

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "username": "张三"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user_id": "uuid",
    "email": "user@example.com",
    "access_token": "jwt_token",
    "refresh_token": "refresh_token"
  }
}
```

#### POST /api/auth/login
用户登录

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "access_token": "jwt_token",
    "refresh_token": "refresh_token",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "username": "张三"
    }
  }
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
    "household_size": 3,
    "weekly_budget": 150.00,
    "cuisine_preferences": ["chinese", "western"],
    "dietary_restrictions": ["no_pork"],
    "cooking_skill_level": "intermediate",
    "max_cooking_time": 60,
    "location": {
      "suburb": "Sydney CBD",
      "lat": -33.8688,
      "lng": 151.2093
    }
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
  "cuisine_preferences": ["chinese", "japanese"],
  "dietary_restrictions": ["vegetarian"],
  "location_suburb": "Melbourne CBD"
}
```

---

### 4.3 食谱API

#### GET /api/recipes/recommended
获取推荐食谱

**Query Parameters:**
- `limit` (optional): 返回数量，默认10
- `offset` (optional): 分页偏移
- `cuisine_type` (optional): 菜系筛选

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
        "cuisine_type": "chinese",
        "difficulty": "medium",
        "cooking_time": 30,
        "servings": 2,
        "image_url": "https://...",
        "estimated_cost": 15.50,
        "nutrition": {
          "calories": 450,
          "protein": 30,
          "carbs": 25,
          "fat": 20
        }
      }
    ],
    "total": 100,
    "offset": 0,
    "limit": 10
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
        "quantity": 300,
        "unit": "g",
        "estimated_price": 8.50,
        "available_products": [
          {
            "supermarket": "woolworths",
            "product_name": "Chicken Breast 500g",
            "price": 12.00,
            "on_sale": true,
            "discount": 20
          }
        ]
      }
    ],
    "steps": [
      {
        "step_number": 1,
        "instruction": "将鸡胸肉切成小块...",
        "image_url": "https://..."
      }
    ],
    "nutrition": {...},
    "rating": 4.5,
    "total_ratings": 120
  }
}
```

#### GET /api/recipes/search
搜索食谱

**Query Parameters:**
- `q`: 搜索关键词
- `cuisine_type`: 菜系
- `difficulty`: 难度
- `max_time`: 最大烹饪时间
- `max_cost`: 最大成本

---

### 4.4 超市优惠API

#### GET /api/deals
获取附近超市优惠

**Query Parameters:**
- `lat`: 纬度
- `lng`: 经度
- `radius`: 半径（km），默认5
- `supermarket`: 超市筛选（woolworths, coles, aldi）
- `category`: 商品分类

**Response:**
```json
{
  "success": true,
  "data": {
    "deals": [
      {
        "product_id": "uuid",
        "name": "Beef Mince 500g",
        "supermarket": "woolworths",
        "original_price": 12.00,
        "sale_price": 9.00,
        "discount_percentage": 25,
        "sale_end_date": "2026-01-30",
        "image_url": "https://...",
        "category": "meat"
      }
    ],
    "total": 50
  }
}
```

#### GET /api/supermarkets/nearby
获取附近超市列表

**Query Parameters:**
- `lat`: 纬度
- `lng`: 经度
- `radius`: 半径（km）

**Response:**
```json
{
  "success": true,
  "data": {
    "supermarkets": [
      {
        "id": "uuid",
        "name": "Woolworths Metro Sydney CBD",
        "brand": "woolworths",
        "address": "123 George St, Sydney",
        "distance_km": 1.2,
        "opening_hours": {...}
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
  "household_size": 3,
  "weekly_budget": 150.00,
  "preferences": {
    "cuisine_types": ["chinese", "western"],
    "dietary_restrictions": ["no_pork"],
    "meal_types": ["lunch", "dinner"]
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
    "total_estimated_cost": 145.50,
    "meals": [
      {
        "day": 0,
        "day_name": "Monday",
        "lunch": {
          "recipe_id": "uuid",
          "name": "番茄炒蛋",
          "estimated_cost": 8.50
        },
        "dinner": {
          "recipe_id": "uuid",
          "name": "宫保鸡丁",
          "estimated_cost": 15.50
        }
      }
    ]
  }
}
```

#### PUT /api/meal-plan/:id/replace
替换食谱计划中的某个菜

**Request:**
```json
{
  "meal_plan_item_id": "uuid",
  "new_recipe_id": "uuid"
}
```

#### GET /api/meal-plan/:id
获取食谱计划详情

---

### 4.6 购物清单API

#### GET /api/shopping-list
获取购物清单

**Query Parameters:**
- `meal_plan_id`: 食谱计划ID

**Response:**
```json
{
  "success": true,
  "data": {
    "shopping_list_id": "uuid",
    "total_estimated_cost": 145.50,
    "items_by_supermarket": {
      "woolworths": [
        {
          "ingredient": "鸡胸肉",
          "quantity": 600,
          "unit": "g",
          "product": {
            "name": "Chicken Breast 1kg",
            "price": 18.00,
            "on_sale": false
          }
        }
      ],
      "coles": [...]
    }
  }
}
```

#### PUT /api/shopping-list/:id/item/:item_id
标记购物清单项为已购买

**Request:**
```json
{
  "is_purchased": true
}
```

---

### 4.7 用户行为API

#### POST /api/recipes/:id/favorite
收藏食谱

#### DELETE /api/recipes/:id/favorite
取消收藏

#### POST /api/recipes/:id/rating
评分食谱

**Request:**
```json
{
  "rating": 5,
  "comment": "非常好吃！"
}
```

#### POST /api/recipes/:id/share
分享食谱

**Request:**
```json
{
  "platform": "wechat" // "wechat", "facebook", "email"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "share_url": "https://eatwhat.au/recipes/share/abc123",
    "qr_code_url": "https://..."
  }
}
```

---

## 5. 数据采集与爬虫

### 5.1 超市数据爬取

#### 5.1.1 目标超市
- **Woolworths**: https://www.woolworths.com.au/
- **Coles**: https://www.coles.com.au/
- **ALDI**: https://www.aldi.com.au/
- **IGA**: https://www.iga.com.au/

#### 5.1.2 爬取内容
- 商品名称、价格、规格
- 促销信息（折扣、优惠期限）
- 商品图片
- 商品分类
- 库存状态（如可获取）

#### 5.1.3 爬取策略
- **频率**: 每天凌晨2点自动更新
- **技术**:
  - Option 1: 使用开源项目 [au-supermarket-apis](https://github.com/drkno/au-supermarket-apis)
  - Option 2: Puppeteer/Playwright 模拟浏览器
  - Option 3: 直接调用超市移动端API（需逆向工程）
- **数据存储**:
  - 当前价格存入 `product_prices` 表
  - 历史价格保留30天用于价格趋势分析
- **防封策略**:
  - 使用代理IP池
  - 随机User-Agent
  - 请求间隔随机化
  - 尊重robots.txt

#### 5.1.4 数据更新流程
```python
# 伪代码
def update_supermarket_prices():
    supermarkets = ["woolworths", "coles", "aldi"]
    for supermarket in supermarkets:
        scraper = get_scraper(supermarket)
        products = scraper.scrape_products()
        for product in products:
            save_or_update_product(product)
            save_price_history(product)
```

### 5.2 食谱数据采集

#### 5.2.1 数据来源
- **中文食谱网站**:
  - 下厨房 (xiachufang.com)
  - 豆果美食 (douguo.com)
  - 美食杰 (meishij.net)
- **英文食谱网站**:
  - Taste.com.au（澳洲本地）
  - AllRecipes
  - BBC Good Food

#### 5.2.2 爬取内容
- 食谱名称（中英文）
- 食材列表及用量
- 烹饪步骤
- 图片/视频
- 烹饪时间、难度
- 营养信息（如有）

#### 5.2.3 数据清洗与标准化
- 食材名称标准化（如"鸡胸肉"、"去骨鸡胸"统一为"鸡胸肉"）
- 单位转换（如"1斤" -> "500g"）
- 食材映射到超市商品
- 菜系分类标准化

---

## 6. 个性化推荐算法

### 6.1 推荐算法设计

#### 6.1.1 用户画像构建
基于以下因素构建用户画像：
- 家庭人数
- 预算偏好
- 菜系偏好
- 饮食限制
- 烹饪技能
- 历史收藏和评分

#### 6.1.2 食谱推荐策略

**阶段1: 基于规则的推荐（MVP）**
```python
def recommend_recipes(user_preferences):
    # 1. 硬性过滤
    recipes = filter_by_dietary_restrictions(user_preferences.restrictions)
    recipes = filter_by_cooking_time(recipes, user_preferences.max_time)

    # 2. 评分排序
    recipes = score_recipes(recipes, user_preferences)

    # 3. 多样性调整（避免重复推荐相同菜系）
    recipes = ensure_diversity(recipes)

    return recipes[:10]

def score_recipes(recipes, preferences):
    for recipe in recipes:
        score = 0
        # 菜系匹配
        if recipe.cuisine in preferences.cuisines:
            score += 10
        # 预算匹配
        if recipe.cost <= preferences.budget_per_meal:
            score += 5
        # 难度匹配
        if recipe.difficulty == preferences.skill_level:
            score += 3
        recipe.score = score
    return sorted(recipes, key=lambda r: r.score, reverse=True)
```

**阶段2: 基于ML的推荐（后期优化）**
- 协同过滤：基于相似用户的喜好
- 内容推荐：基于食谱特征（食材、菜系、营养）
- 混合推荐：结合多种策略

### 6.2 食谱计划生成算法

#### 6.2.1 目标
- 满足预算约束
- 营养均衡
- 食材复用（减少浪费）
- 菜系多样性

#### 6.2.2 算法流程
```python
def generate_meal_plan(user_preferences, week_start_date):
    # 1. 初始化
    meal_plan = []
    budget_per_day = user_preferences.weekly_budget / 7

    # 2. 为每天生成食谱
    for day in range(7):
        day_meals = []
        daily_budget = budget_per_day

        # 3. 为每餐生成食谱
        for meal_type in ["lunch", "dinner"]:
            # 获取候选食谱
            candidates = get_candidate_recipes(
                user_preferences,
                max_cost=daily_budget,
                exclude_recent=meal_plan  # 避免重复
            )

            # 选择最佳食谱
            selected = select_best_recipe(
                candidates,
                remaining_budget=daily_budget,
                nutrition_target=get_nutrition_target(day)
            )

            day_meals.append(selected)
            daily_budget -= selected.cost

        meal_plan.append(day_meals)

    # 4. 优化食材采购（合并相同食材）
    optimize_ingredients(meal_plan)

    return meal_plan
```

---

## 7. 定时任务设计

### 7.1 任务列表

| 任务名称 | 频率 | 执行时间 | 描述 |
|---------|------|---------|------|
| 更新超市价格 | 每日 | 凌晨2:00 | 爬取超市最新价格和优惠 |
| 清理过期价格数据 | 每周 | 周日凌晨3:00 | 删除30天前的价格记录 |
| 导入新食谱 | 每周 | 周一凌晨4:00 | 从食谱网站爬取新食谱 |
| 生成推荐食谱缓存 | 每日 | 凌晨5:00 | 为活跃用户预生成推荐 |
| 发送周计划提醒 | 每周 | 周日早上9:00 | 提醒用户规划下周食谱 |
| 数据库备份 | 每日 | 凌晨6:00 | 备份数据库 |

### 7.2 Celery任务示例

```python
from celery import Celery
from celery.schedules import crontab

app = Celery('eatwhat')

@app.task
def update_supermarket_prices():
    """更新超市价格"""
    scrapers = [WoolworthsScraper(), ColesScraper(), AldiScraper()]
    for scraper in scrapers:
        scraper.update_prices()

@app.task
def generate_user_recommendations():
    """为活跃用户生成推荐"""
    active_users = get_active_users()
    for user in active_users:
        recommendations = recommend_recipes(user.preferences)
        cache.set(f"recommendations:{user.id}", recommendations, timeout=86400)

# 定时任务配置
app.conf.beat_schedule = {
    'update-prices-daily': {
        'task': 'tasks.update_supermarket_prices',
        'schedule': crontab(hour=2, minute=0),
    },
    'generate-recommendations-daily': {
        'task': 'tasks.generate_user_recommendations',
        'schedule': crontab(hour=5, minute=0),
    },
}
```

---

## 8. 缓存策略

### 8.1 Redis缓存设计

| 缓存键 | 数据类型 | TTL | 描述 |
|-------|---------|-----|------|
| `user:{user_id}:preferences` | String (JSON) | 1小时 | 用户偏好 |
| `recipes:recommended:{user_id}` | List | 24小时 | 用户推荐食谱 |
| `deals:{suburb}` | String (JSON) | 6小时 | 附近超市优惠 |
| `recipe:{recipe_id}` | String (JSON) | 12小时 | 食谱详情 |
| `supermarkets:nearby:{lat}:{lng}` | String (JSON) | 24小时 | 附近超市列表 |
| `price:{product_id}` | String | 6小时 | 商品当前价格 |

### 8.2 缓存更新策略
- **被动更新**: 缓存过期后，下次请求时重新加载
- **主动更新**: 数据变更时主动失效缓存
- **预热**: 系统启动时预加载热门数据

---

## 9. 性能要求

### 9.1 响应时间要求
- API响应时间 < 500ms (P95)
- 数据库查询 < 100ms
- 食谱推荐生成 < 2秒
- 食谱计划生成 < 5秒

### 9.2 并发要求
- 支持1000+ 并发用户
- 峰值QPS: 500+

### 9.3 数据量预估
- 用户数: 10,000 (第一年)
- 食谱数: 10,000+
- 商品数: 50,000+
- 价格记录: 1,500,000+ (30天历史)

---

## 10. 安全与合规

### 10.1 数据安全
- 用户密码使用bcrypt加密
- 敏感数据加密存储
- HTTPS传输
- SQL注入防护
- XSS防护
- CSRF防护

### 10.2 API安全
- JWT Token认证
- Rate Limiting (每用户100请求/分钟)
- API Key管理（第三方集成）

### 10.3 隐私合规
- 遵守澳大利亚隐私法（Privacy Act 1988）
- GDPR合规（如有欧洲用户）
- 用户数据可导出/删除
- Cookie政策透明

---

## 11. 监控与日志

### 11.1 监控指标
- **系统指标**: CPU、内存、磁盘、网络
- **应用指标**: API响应时间、错误率、QPS
- **业务指标**: 注册用户数、活跃用户数、食谱生成次数

### 11.2 日志管理
- **访问日志**: API调用记录
- **错误日志**: 异常堆栈、错误信息
- **业务日志**: 关键业务操作（注册、生成食谱计划）
- **爬虫日志**: 爬取成功/失败记录

### 11.3 告警机制
- API错误率 > 5% 告警
- 数据库连接池耗尽告警
- 爬虫任务失败告警
- 磁盘使用率 > 80% 告警

---

## 12. 部署架构

### 12.1 开发环境
- Docker Compose本地开发
- PostgreSQL + Redis容器
- 热重载支持

### 12.2 生产环境（AWS示例）
```
┌─────────────────────────────────────┐
│         CloudFront (CDN)            │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   Application Load Balancer (ALB)  │
└──────────────┬──────────────────────┘
               │
       ┌───────┴────────┐
       ▼                ▼
┌─────────────┐  ┌─────────────┐
│  ECS/Fargate│  │  ECS/Fargate│  (Auto Scaling)
│  API Server │  │  API Server │
└──────┬──────┘  └──────┬──────┘
       │                │
       └────────┬───────┘
                ▼
┌───────────────────────────────┐
│  ElastiCache (Redis Cluster) │
└───────────────────────────────┘
                │
                ▼
┌───────────────────────────────┐
│   RDS PostgreSQL (Multi-AZ)  │
└───────────────────────────────┘
```

### 12.3 CI/CD
- GitHub Actions / GitLab CI
- 自动化测试
- Docker镜像构建
- 蓝绿部署

---

## 13. 里程碑规划

### Phase 1 - 基础架构（Week 1-2）
- [ ] 数据库设计与建表
- [ ] API框架搭建（FastAPI/Django）
- [ ] 用户认证系统
- [ ] Docker开发环境

### Phase 2 - 核心功能（Week 3-6）
- [ ] 食谱API实现
- [ ] 超市数据爬虫（Woolworths, Coles）
- [ ] 基础推荐算法
- [ ] 食谱计划生成API

### Phase 3 - 数据采集（Week 7-8）
- [ ] 食谱数据爬取与导入
- [ ] 超市价格数据采集
- [ ] 定时任务系统
- [ ] 数据清洗与标准化

### Phase 4 - 优化与完善（Week 9-12）
- [ ] Redis缓存集成
- [ ] 性能优化
- [ ] 监控与日志系统
- [ ] API文档（Swagger）

### Phase 5 - 上线准备（Week 13-16）
- [ ] 安全加固
- [ ] 负载测试
- [ ] 生产环境部署
- [ ] 备份与恢复方案

---

## 14. 技术风险与应对

### 14.1 风险识别

| 风险 | 影响 | 概率 | 应对措施 |
|-----|------|------|---------|
| 超市反爬虫 | 高 | 中 | 使用开源API项目，准备备用方案 |
| 数据质量低 | 中 | 中 | 数据清洗流程，人工审核 |
| 推荐算法效果差 | 中 | 低 | 从简单规则开始，逐步优化 |
| 性能瓶颈 | 高 | 低 | 缓存、数据库优化、水平扩展 |
| 第三方API限制 | 中 | 中 | 自建爬虫，数据本地化 |

### 14.2 备选方案
- **超市数据**: 如爬虫失败，考虑购买商业数据API
- **食谱数据**: 建立用户UGC机制，鼓励用户上传食谱
- **推荐算法**: 使用OpenAI API作为备选方案

---

## 15. 附录

### 15.1 澳洲超市API资源
- [Australian Supermarket OpenAPI Specifications](https://github.com/drkno/au-supermarket-apis) - 开源项目，提供Woolworths, Coles等超市的API规范
- [Australian Grocery Price Database](https://github.com/tjhowse/aus_grocery_price_database) - Golang实现的超市价格数据库

### 15.2 技术参考
- FastAPI文档: https://fastapi.tiangolo.com/
- Celery文档: https://docs.celeryq.dev/
- Scrapy文档: https://docs.scrapy.org/

---

*文档结束*
