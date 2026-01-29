import { Recipe, Product, Deal, UserPreferences, Supermarket } from '@/types';

// Mock Products
export const mockProducts: Product[] = [
  {
    id: 'p1',
    name: 'Chicken Breast Fillets',
    supermarket: 'Woolworths',
    price: 12.50,
    originalPrice: 15.00,
    unit: 'per kg',
    image: '/images/chicken-breast.jpg',
    onSale: true,
    discount: 2.50,
    category: 'Meat & Seafood'
  },
  {
    id: 'p2',
    name: 'Fresh Broccoli',
    supermarket: 'Coles',
    price: 2.90,
    unit: 'per bunch',
    image: '/images/broccoli.jpg',
    onSale: false,
    category: 'Vegetables'
  },
  {
    id: 'p3',
    name: 'Jasmine Rice 5kg',
    supermarket: 'ALDI',
    price: 8.99,
    originalPrice: 11.99,
    unit: '5kg',
    image: '/images/rice.jpg',
    onSale: true,
    discount: 3.00,
    category: 'Pantry'
  },
  {
    id: 'p4',
    name: 'Soy Sauce 500ml',
    supermarket: 'Woolworths',
    price: 3.50,
    unit: '500ml',
    image: '/images/soy-sauce.jpg',
    onSale: false,
    category: 'Asian Foods'
  },
  {
    id: 'p5',
    name: 'Beef Mince',
    supermarket: 'Coles',
    price: 9.00,
    originalPrice: 12.00,
    unit: 'per kg',
    image: '/images/beef-mince.jpg',
    onSale: true,
    discount: 3.00,
    category: 'Meat & Seafood'
  }
];

// Mock Deals
export const mockDeals: Deal[] = [
  {
    id: 'd1',
    name: 'Atlantic Salmon Fillets',
    supermarket: 'Woolworths',
    price: 18.00,
    originalPrice: 25.00,
    unit: 'per kg',
    image: '/images/salmon.jpg',
    onSale: true,
    discount: 7.00,
    category: 'Meat & Seafood',
    dealEndDate: '2026-01-31',
    discountPercentage: 28
  },
  {
    id: 'd2',
    name: 'Bok Choy',
    supermarket: 'Coles',
    price: 1.50,
    originalPrice: 2.50,
    unit: 'per bunch',
    image: '/images/bok-choy.jpg',
    onSale: true,
    discount: 1.00,
    category: 'Vegetables',
    dealEndDate: '2026-01-28',
    discountPercentage: 40
  },
  {
    id: 'd3',
    name: 'Premium Olive Oil 1L',
    supermarket: 'ALDI',
    price: 6.99,
    originalPrice: 9.99,
    unit: '1L',
    image: '/images/olive-oil.jpg',
    onSale: true,
    discount: 3.00,
    category: 'Pantry',
    dealEndDate: '2026-02-02',
    discountPercentage: 30
  },
  {
    id: 'd4',
    name: 'Pork Loin Chops',
    supermarket: 'Woolworths',
    price: 10.50,
    originalPrice: 14.00,
    unit: 'per kg',
    image: '/images/pork-chops.jpg',
    onSale: true,
    discount: 3.50,
    category: 'Meat & Seafood',
    dealEndDate: '2026-01-30',
    discountPercentage: 25
  },
  {
    id: 'd5',
    name: 'Cherry Tomatoes 250g',
    supermarket: 'Coles',
    price: 2.00,
    originalPrice: 3.50,
    unit: '250g',
    image: '/images/cherry-tomatoes.jpg',
    onSale: true,
    discount: 1.50,
    category: 'Vegetables',
    dealEndDate: '2026-01-29',
    discountPercentage: 43
  },
  {
    id: 'd6',
    name: 'Chinese Cabbage',
    supermarket: 'ALDI',
    price: 1.99,
    originalPrice: 2.99,
    unit: 'each',
    image: '/images/chinese-cabbage.jpg',
    onSale: true,
    discount: 1.00,
    category: 'Vegetables',
    dealEndDate: '2026-01-31',
    discountPercentage: 33
  }
];

// Mock Recipes
export const mockRecipes: Recipe[] = [
  {
    id: 'r1',
    name: '宫保鸡丁',
    nameEn: 'Kung Pao Chicken',
    image: '/images/kung-pao-chicken.jpg',
    cookingTime: 30,
    difficulty: 'medium',
    servings: 4,
    estimatedCost: 18.50,
    cuisine: ['Chinese', 'Sichuan'],
    ingredients: [
      {
        id: 'i1',
        name: '鸡胸肉',
        nameEn: 'Chicken breast',
        quantity: 500,
        unit: 'g',
        category: 'Meat',
        productMatches: [mockProducts[0]]
      },
      {
        id: 'i2',
        name: '花生',
        nameEn: 'Peanuts',
        quantity: 100,
        unit: 'g',
        category: 'Nuts'
      },
      {
        id: 'i3',
        name: '青椒',
        nameEn: 'Capsicum',
        quantity: 2,
        unit: 'pieces',
        category: 'Vegetables'
      },
      {
        id: 'i4',
        name: '酱油',
        nameEn: 'Soy sauce',
        quantity: 2,
        unit: 'tbsp',
        category: 'Condiments',
        productMatches: [mockProducts[3]]
      }
    ],
    steps: [
      {
        stepNumber: 1,
        instruction: '将鸡胸肉切成2cm见方的块，用料酒、盐、淀粉腌制15分钟',
        duration: 15
      },
      {
        stepNumber: 2,
        instruction: '青椒切块，葱姜蒜切末备用',
        duration: 5
      },
      {
        stepNumber: 3,
        instruction: '热油炸花生至金黄，捞出备用',
        duration: 3
      },
      {
        stepNumber: 4,
        instruction: '大火爆炒鸡丁至变色，加入宫保酱翻炒均匀',
        duration: 5
      },
      {
        stepNumber: 5,
        instruction: '加入青椒和花生，快速翻炒后出锅',
        duration: 2
      }
    ],
    nutrition: {
      calories: 385,
      protein: 32,
      carbs: 18,
      fat: 22,
      fiber: 3,
      sodium: 680
    },
    rating: 4.7,
    reviewCount: 328,
    isFavorite: false
  },
  {
    id: 'r2',
    name: '西兰花炒牛肉',
    nameEn: 'Beef and Broccoli Stir Fry',
    image: '/images/beef-broccoli.jpg',
    cookingTime: 25,
    difficulty: 'easy',
    servings: 4,
    estimatedCost: 22.00,
    cuisine: ['Chinese', 'Cantonese'],
    ingredients: [
      {
        id: 'i5',
        name: '牛肉片',
        nameEn: 'Beef slices',
        quantity: 400,
        unit: 'g',
        category: 'Meat'
      },
      {
        id: 'i6',
        name: '西兰花',
        nameEn: 'Broccoli',
        quantity: 1,
        unit: 'bunch',
        category: 'Vegetables',
        productMatches: [mockProducts[1]]
      },
      {
        id: 'i7',
        name: '蚝油',
        nameEn: 'Oyster sauce',
        quantity: 2,
        unit: 'tbsp',
        category: 'Condiments'
      }
    ],
    steps: [
      {
        stepNumber: 1,
        instruction: '牛肉切薄片，用酱油、糖、淀粉腌制10分钟',
        duration: 10
      },
      {
        stepNumber: 2,
        instruction: '西兰花切小朵，焯水1分钟后捞出',
        duration: 3
      },
      {
        stepNumber: 3,
        instruction: '热油快炒牛肉至七成熟，盛出备用',
        duration: 4
      },
      {
        stepNumber: 4,
        instruction: '加入西兰花、牛肉和蚝油，大火翻炒均匀',
        duration: 3
      }
    ],
    nutrition: {
      calories: 320,
      protein: 28,
      carbs: 12,
      fat: 18,
      fiber: 4,
      sodium: 520
    },
    rating: 4.5,
    reviewCount: 215,
    isFavorite: true
  },
  {
    id: 'r3',
    name: '番茄炒鸡蛋',
    nameEn: 'Tomato and Egg Stir Fry',
    image: '/images/tomato-egg.jpg',
    cookingTime: 15,
    difficulty: 'easy',
    servings: 2,
    estimatedCost: 8.50,
    cuisine: ['Chinese'],
    ingredients: [
      {
        id: 'i8',
        name: '番茄',
        nameEn: 'Tomatoes',
        quantity: 3,
        unit: 'pieces',
        category: 'Vegetables'
      },
      {
        id: 'i9',
        name: '鸡蛋',
        nameEn: 'Eggs',
        quantity: 4,
        unit: 'pieces',
        category: 'Dairy & Eggs'
      }
    ],
    steps: [
      {
        stepNumber: 1,
        instruction: '番茄切块，鸡蛋打散',
        duration: 3
      },
      {
        stepNumber: 2,
        instruction: '炒蛋至七成熟，盛出备用',
        duration: 3
      },
      {
        stepNumber: 3,
        instruction: '炒番茄至软烂出汁',
        duration: 5
      },
      {
        stepNumber: 4,
        instruction: '加入鸡蛋，翻炒均匀后加盐调味',
        duration: 2
      }
    ],
    nutrition: {
      calories: 245,
      protein: 14,
      carbs: 10,
      fat: 16,
      fiber: 2,
      sodium: 380
    },
    rating: 4.8,
    reviewCount: 542,
    isFavorite: false
  },
  {
    id: 'r4',
    name: '红烧排骨',
    nameEn: 'Braised Pork Ribs',
    image: '/images/braised-ribs.jpg',
    cookingTime: 60,
    difficulty: 'medium',
    servings: 4,
    estimatedCost: 26.00,
    cuisine: ['Chinese'],
    ingredients: [
      {
        id: 'i10',
        name: '排骨',
        nameEn: 'Pork ribs',
        quantity: 800,
        unit: 'g',
        category: 'Meat'
      },
      {
        id: 'i11',
        name: '生姜',
        nameEn: 'Ginger',
        quantity: 30,
        unit: 'g',
        category: 'Vegetables'
      },
      {
        id: 'i12',
        name: '八角',
        nameEn: 'Star anise',
        quantity: 3,
        unit: 'pieces',
        category: 'Spices'
      }
    ],
    steps: [
      {
        stepNumber: 1,
        instruction: '排骨焯水去血沫，洗净备用',
        duration: 10
      },
      {
        stepNumber: 2,
        instruction: '炒糖色至焦黄，加入排骨上色',
        duration: 5
      },
      {
        stepNumber: 3,
        instruction: '加入姜片、八角、酱油和水，大火烧开',
        duration: 5
      },
      {
        stepNumber: 4,
        instruction: '转小火炖煮40分钟至软烂',
        duration: 40
      },
      {
        stepNumber: 5,
        instruction: '大火收汁，装盘即可',
        duration: 5
      }
    ],
    nutrition: {
      calories: 425,
      protein: 26,
      carbs: 8,
      fat: 32,
      fiber: 1,
      sodium: 720
    },
    rating: 4.6,
    reviewCount: 189,
    isFavorite: false
  },
  {
    id: 'r5',
    name: '麻婆豆腐',
    nameEn: 'Mapo Tofu',
    image: '/images/mapo-tofu.jpg',
    cookingTime: 20,
    difficulty: 'easy',
    servings: 3,
    estimatedCost: 12.00,
    cuisine: ['Chinese', 'Sichuan'],
    ingredients: [
      {
        id: 'i13',
        name: '嫩豆腐',
        nameEn: 'Soft tofu',
        quantity: 400,
        unit: 'g',
        category: 'Tofu & Soy'
      },
      {
        id: 'i14',
        name: '猪肉末',
        nameEn: 'Pork mince',
        quantity: 150,
        unit: 'g',
        category: 'Meat'
      },
      {
        id: 'i15',
        name: '豆瓣酱',
        nameEn: 'Doubanjiang',
        quantity: 2,
        unit: 'tbsp',
        category: 'Condiments'
      }
    ],
    steps: [
      {
        stepNumber: 1,
        instruction: '豆腐切块，用盐水浸泡5分钟',
        duration: 5
      },
      {
        stepNumber: 2,
        instruction: '炒香肉末，加入豆瓣酱爆香',
        duration: 4
      },
      {
        stepNumber: 3,
        instruction: '加水、豆腐，煮5分钟',
        duration: 5
      },
      {
        stepNumber: 4,
        instruction: '勾芡，撒花椒粉和葱花',
        duration: 2
      }
    ],
    nutrition: {
      calories: 280,
      protein: 18,
      carbs: 12,
      fat: 19,
      fiber: 3,
      sodium: 850
    },
    rating: 4.7,
    reviewCount: 412,
    isFavorite: true
  },
  {
    id: 'r6',
    name: '清蒸鲈鱼',
    nameEn: 'Steamed Sea Bass',
    image: '/images/steamed-fish.jpg',
    cookingTime: 25,
    difficulty: 'medium',
    servings: 4,
    estimatedCost: 32.00,
    cuisine: ['Chinese', 'Cantonese'],
    ingredients: [
      {
        id: 'i16',
        name: '鲈鱼',
        nameEn: 'Sea bass',
        quantity: 1,
        unit: 'whole (600g)',
        category: 'Seafood'
      },
      {
        id: 'i17',
        name: '葱姜',
        nameEn: 'Spring onion & ginger',
        quantity: 50,
        unit: 'g',
        category: 'Vegetables'
      }
    ],
    steps: [
      {
        stepNumber: 1,
        instruction: '鱼洗净，两面划刀，塞入姜片',
        duration: 5
      },
      {
        stepNumber: 2,
        instruction: '水烧开后，蒸8-10分钟',
        duration: 10
      },
      {
        stepNumber: 3,
        instruction: '倒掉蒸鱼水，铺上葱丝',
        duration: 2
      },
      {
        stepNumber: 4,
        instruction: '浇热油，淋蒸鱼豉油',
        duration: 2
      }
    ],
    nutrition: {
      calories: 195,
      protein: 28,
      carbs: 2,
      fat: 8,
      fiber: 0,
      sodium: 420
    },
    rating: 4.9,
    reviewCount: 267,
    isFavorite: false
  }
];

// Mock User Preferences
export const defaultUserPreferences: UserPreferences = {
  familySize: 2,
  weeklyBudget: 100,
  cuisinePreferences: ['Chinese'],
  dietaryRestrictions: [],
  cookingDifficulty: 'medium',
  maxCookingTime: 60,
  allergies: []
};

// Mock Supermarkets
export const mockSupermarkets: Supermarket[] = [
  {
    id: 's1',
    name: 'Woolworths',
    distance: 1.2,
    address: '123 Main St, Sydney NSW 2000',
    openingHours: '7am - 10pm'
  },
  {
    id: 's2',
    name: 'Coles',
    distance: 1.8,
    address: '456 George St, Sydney NSW 2000',
    openingHours: '6am - 11pm'
  },
  {
    id: 's3',
    name: 'ALDI',
    distance: 2.5,
    address: '789 Pitt St, Sydney NSW 2000',
    openingHours: '8:30am - 8pm'
  }
];

// Helper function to get random recipes
export const getRandomRecipes = (count: number): Recipe[] => {
  const shuffled = [...mockRecipes].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// Helper function to get recipes by cuisine
export const getRecipesByCuisine = (cuisine: string): Recipe[] => {
  return mockRecipes.filter(recipe =>
    recipe.cuisine.includes(cuisine)
  );
};

// Helper function to filter deals by supermarket
export const getDealsBySupermarket = (supermarket: string): Deal[] => {
  return mockDeals.filter(deal => deal.supermarket === supermarket);
};
