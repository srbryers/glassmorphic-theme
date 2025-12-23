#!/usr/bin/env npx tsx
/**
 * Product Seed Script for Beacon Basics
 *
 * Seeds Comfort Colors products to the Shopify store using the Admin GraphQL API.
 *
 * Usage:
 *   pnpm seed:products              # Create product
 *   pnpm seed:products --dry-run    # Preview without creating
 *   pnpm seed:products --delete-existing --force  # Overwrite existing
 *
 * Environment Variables Required:
 *   SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
 *   SHOPIFY_ADMIN_ACCESS_TOKEN=shpat_xxxxx
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env.local from project root
dotenv.config({ path: join(__dirname, '..', '.env.local') });
import type {
  SeedConfig,
  ProductDefinition,
  ProductSetResponse,
  ProductByHandleResponse,
  ProductDeleteResponse,
} from './lib/types.js';
import { shopifyGraphQL, hasErrors, formatErrors } from './lib/shopify-client.js';
import {
  PRODUCT_SET_MUTATION,
  PRODUCT_BY_HANDLE_QUERY,
  PRODUCT_DELETE_MUTATION,
} from './lib/mutations.js';
import { COMFORT_COLORS_1717, generateSku, getVariantCount } from './data/comfort-colors-1717.js';

// =============================================================================
// CLI Argument Parsing
// =============================================================================

function parseArgs(): SeedConfig {
  const args = process.argv.slice(2);
  return {
    dryRun: args.includes('--dry-run'),
    force: args.includes('--force'),
    deleteExisting: args.includes('--delete-existing'),
  };
}

// =============================================================================
// Product Input Builder
// =============================================================================

interface ProductSetInput {
  title: string;
  handle: string;
  vendor: string;
  productType: string;
  tags: string[];
  descriptionHtml: string;
  status: 'ACTIVE' | 'DRAFT';
  productOptions: Array<{
    name: string;
    values: Array<{ name: string }>;
  }>;
  variants: Array<{
    optionValues: Array<{ optionName: string; name: string }>;
    price: string;
    compareAtPrice: string;
    sku: string;
    inventoryItem: { tracked: boolean };
  }>;
}

function buildProductInput(product: ProductDefinition): ProductSetInput {
  // Build option values
  const sizeValues = product.sizes.map((s) => ({ name: s.name }));
  const colorValues = product.colors.map((c) => ({ name: c.name }));

  // Build variants (Size × Color matrix)
  const variants: ProductSetInput['variants'] = [];

  for (const size of product.sizes) {
    for (const color of product.colors) {
      variants.push({
        optionValues: [
          { optionName: 'Size', name: size.name },
          { optionName: 'Color', name: color.name },
        ],
        price: product.basePrice.toFixed(2),
        compareAtPrice: product.compareAtPrice.toFixed(2),
        sku: generateSku(product.styleCode, size.sku, color.sku),
        inventoryItem: { tracked: false }, // POD items aren't inventory tracked
      });
    }
  }

  return {
    title: product.title,
    handle: product.handle,
    vendor: product.vendor,
    productType: product.productType,
    tags: product.tags,
    descriptionHtml: product.descriptionHtml,
    status: 'ACTIVE',
    productOptions: [
      { name: 'Size', values: sizeValues },
      { name: 'Color', values: colorValues },
    ],
    variants,
  };
}

// =============================================================================
// API Operations
// =============================================================================

async function checkProductExists(handle: string): Promise<{ exists: boolean; id?: string }> {
  const response = await shopifyGraphQL<ProductByHandleResponse['data']>(PRODUCT_BY_HANDLE_QUERY, {
    handle,
  });

  if (hasErrors(response)) {
    console.error('   Error checking product:', formatErrors(response));
    return { exists: false };
  }

  const product = response.data?.productByHandle;
  return {
    exists: !!product,
    id: product?.id,
  };
}

async function deleteProduct(id: string): Promise<boolean> {
  const response = await shopifyGraphQL<ProductDeleteResponse['data']>(PRODUCT_DELETE_MUTATION, {
    id,
  });

  if (hasErrors(response)) {
    console.error('   Error deleting product:', formatErrors(response));
    return false;
  }

  const userErrors = response.data?.productDelete?.userErrors || [];
  if (userErrors.length > 0) {
    console.error('   Delete errors:');
    userErrors.forEach((e) => console.error(`     - ${e.message}`));
    return false;
  }

  return true;
}

async function createProduct(input: ProductSetInput): Promise<boolean> {
  const response = await shopifyGraphQL<ProductSetResponse['data']>(PRODUCT_SET_MUTATION, {
    synchronous: true,
    input,
  });

  if (hasErrors(response)) {
    console.error('   GraphQL errors:', formatErrors(response));
    return false;
  }

  const userErrors = response.data?.productSet?.userErrors || [];
  if (userErrors.length > 0) {
    console.error('   User errors:');
    userErrors.forEach((e) => {
      const field = e.field?.join('.') || 'unknown';
      console.error(`     - [${field}] ${e.message}`);
    });
    return false;
  }

  const product = response.data?.productSet?.product;
  if (product) {
    console.log(`   Product ID: ${product.id}`);
    console.log(`   Handle: ${product.handle}`);
    console.log(`   Status: ${product.status}`);
    console.log(`   Variants created: ${product.variants.nodes.length}`);
  }

  return true;
}

// =============================================================================
// Main Seed Function
// =============================================================================

async function seedProduct(product: ProductDefinition, config: SeedConfig): Promise<boolean> {
  console.log(`\n🛍️  Seeding: ${product.title}`);
  console.log(`   Vendor: ${product.vendor}`);
  console.log(`   Style: ${product.styleCode}`);
  console.log(`   Sizes: ${product.sizes.length} | Colors: ${product.colors.length}`);
  console.log(`   Total variants: ${getVariantCount()}`);
  console.log(`   Price: $${product.basePrice} (was $${product.compareAtPrice})`);

  // Check if product already exists
  console.log('\n📋 Checking existing product...');
  const existing = await checkProductExists(product.handle);

  if (existing.exists) {
    console.log(`   ⚠️  Product already exists: ${existing.id}`);

    if (!config.deleteExisting) {
      console.log('   Use --delete-existing to overwrite');
      return false;
    }

    if (config.dryRun) {
      console.log('   [DRY RUN] Would delete existing product');
    } else {
      console.log('   🗑️  Deleting existing product...');
      const deleted = await deleteProduct(existing.id!);
      if (!deleted) {
        console.error('   Failed to delete existing product');
        return false;
      }
      console.log('   ✅ Deleted');
    }
  } else {
    console.log('   No existing product found');
  }

  // Build product input
  console.log('\n🔧 Building product data...');
  const input = buildProductInput(product);

  if (config.dryRun) {
    console.log('   [DRY RUN] Would create product with:');
    console.log(`     Title: ${input.title}`);
    console.log(`     Handle: ${input.handle}`);
    console.log(`     Options: ${input.productOptions.map((o) => o.name).join(', ')}`);
    console.log(`     Variants: ${input.variants.length}`);
    console.log('\n   Sample variant SKUs:');
    input.variants.slice(0, 5).forEach((v) => {
      console.log(`     - ${v.sku}`);
    });
    console.log(`     ... and ${input.variants.length - 5} more`);
    return true;
  }

  // Create product
  console.log('\n📤 Creating product in Shopify...');
  const success = await createProduct(input);

  if (success) {
    console.log('\n✅ Product created successfully!');
  } else {
    console.error('\n❌ Failed to create product');
  }

  return success;
}

// =============================================================================
// Entry Point
// =============================================================================

async function main() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  Beacon Basics - Product Seed Script');
  console.log('═══════════════════════════════════════════════════════════════');

  const config = parseArgs();

  if (config.dryRun) {
    console.log('\n🔍 DRY RUN MODE - No changes will be made\n');
  }

  // Validate environment
  if (!process.env.SHOPIFY_STORE_DOMAIN || !process.env.SHOPIFY_ADMIN_ACCESS_TOKEN) {
    console.error('\n❌ Missing environment variables!');
    console.error('   Create a .env.local file with:');
    console.error('   SHOPIFY_STORE_DOMAIN=your-store.myshopify.com');
    console.error('   SHOPIFY_ADMIN_ACCESS_TOKEN=shpat_xxxxx');
    console.error('\n   Get your access token from:');
    console.error('   Shopify Admin → Settings → Apps → Develop apps');
    process.exit(1);
  }

  console.log(`\n🏪 Store: ${process.env.SHOPIFY_STORE_DOMAIN}`);

  // Seed products
  const products: ProductDefinition[] = [COMFORT_COLORS_1717];

  let successCount = 0;
  let failCount = 0;

  for (const product of products) {
    const success = await seedProduct(product, config);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
  }

  // Summary
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('  Summary');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`  ✅ Succeeded: ${successCount}`);
  console.log(`  ❌ Failed: ${failCount}`);
  console.log('═══════════════════════════════════════════════════════════════\n');

  process.exit(failCount > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error('\n💥 Unexpected error:', error.message);
  process.exit(1);
});
