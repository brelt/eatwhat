import * as fs from 'fs'
import * as path from 'path'
import { createClient } from '@supabase/supabase-js'

// Parse .env
const envContent = fs.readFileSync(path.resolve(__dirname, '..', '.env'), 'utf-8')
const env: Record<string, string> = {}
envContent.split('\n').forEach(line => {
  const i = line.indexOf('=')
  if (i > 0) env[line.slice(0, i).trim()] = line.slice(i + 1).trim()
})

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY)

interface NormalizedProduct {
  supermarket_brand: string
  product_id: string
  name: string
  brand: string | null
  size: string | null
  image_url: string | null
  current_price: number
  original_price: number | null
  is_on_sale: boolean
  discount_percentage: number | null
  category: string | null
  scraped_at: string
}

function normalizeWoolworths(raw: any): NormalizedProduct {
  return {
    supermarket_brand: 'Woolworths',
    product_id: String(raw.stockcode),
    name: raw.name,
    brand: raw.brand || null,
    size: raw.package_size || null,
    image_url: raw.image_medium || null,
    current_price: raw.price,
    original_price: raw.was_price || null,
    is_on_sale: raw.on_sale || false,
    discount_percentage: raw.discount_percentage ? Math.round(raw.discount_percentage) : null,
    category: raw.category || null,
    scraped_at: new Date().toISOString(),
  }
}

function normalizeColes(raw: any): NormalizedProduct {
  return {
    supermarket_brand: 'Coles',
    product_id: String(raw.product_id),
    name: raw.name,
    brand: raw.brand || null,
    size: raw.size || null,
    image_url: raw.image_url || null,
    current_price: raw.price,
    original_price: raw.was_price || null,
    is_on_sale: raw.on_sale || false,
    discount_percentage: raw.discount_percentage ? Math.round(raw.discount_percentage) : null,
    category: raw.category || null,
    scraped_at: new Date().toISOString(),
  }
}

function normalizeAldi(raw: any): NormalizedProduct {
  return {
    supermarket_brand: 'ALDI',
    product_id: raw.product_id,
    name: raw.name,
    brand: raw.brand || null,
    size: raw.unit || null,
    image_url: raw.image_url || null,
    current_price: raw.price,
    original_price: null,
    is_on_sale: false,
    discount_percentage: null,
    category: null,
    scraped_at: new Date().toISOString(),
  }
}

function detectSupermarket(product: any): string {
  if (product.supermarket) {
    const s = product.supermarket.toLowerCase()
    if (s === 'woolworths') return 'woolworths'
    if (s === 'coles') return 'coles'
    if (s === 'aldi') return 'aldi'
  }
  if (product.stockcode) return 'woolworths'
  return 'unknown'
}

function normalizeProduct(raw: any): NormalizedProduct | null {
  const supermarket = detectSupermarket(raw)
  switch (supermarket) {
    case 'woolworths': return normalizeWoolworths(raw)
    case 'coles': return normalizeColes(raw)
    case 'aldi': return normalizeAldi(raw)
    default:
      console.warn(`Unknown supermarket for product: ${raw.name}`)
      return null
  }
}

async function upsertBatch(products: NormalizedProduct[]) {
  const batchSize = 100
  for (let i = 0; i < products.length; i += batchSize) {
    const batch = products.slice(i, i + batchSize)
    const { error } = await supabase
      .from('supermarket_products')
      .upsert(batch, { onConflict: 'supermarket_brand,product_id' })

    if (error) {
      console.error(`Batch ${Math.floor(i / batchSize) + 1} failed:`, error.message)
    } else {
      console.log(`  Upserted batch ${Math.floor(i / batchSize) + 1} (${batch.length} products)`)
    }
  }
}

async function main() {
  // Default: reads all_supermarkets_products.json from poc/
  // Override: npx ts-node scripts/import-products.ts path/to/file.json
  const filePath = process.argv[2] || path.resolve(__dirname, '..', 'poc', 'all_supermarkets_products.json')
  console.log(`Reading: ${filePath}`)

  const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8'))

  let products: any[] = []

  if (Array.isArray(raw)) {
    // Flat array (individual scraper output)
    products = raw
  } else if (raw.supermarkets) {
    // Combined format: { supermarkets: { woolworths: { products: [] }, ... } }
    for (const key of Object.keys(raw.supermarkets)) {
      products.push(...(raw.supermarkets[key].products || []))
    }
  }

  console.log(`Found ${products.length} raw products`)

  const normalized = products
    .map(normalizeProduct)
    .filter((p): p is NormalizedProduct => p !== null)

  console.log(`Normalized ${normalized.length} products`)

  await upsertBatch(normalized)
  console.log('Done.')
}

main()
