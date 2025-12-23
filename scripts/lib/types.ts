/**
 * TypeScript interfaces for Shopify product seeding
 */

// =============================================================================
// CLI Configuration
// =============================================================================

export interface SeedConfig {
  dryRun: boolean;
  force: boolean;
  deleteExisting: boolean;
}

// =============================================================================
// Product Data Types
// =============================================================================

export interface ColorDefinition {
  name: string;
  hex: string;
  sku: string; // 3-letter code for SKU generation
}

export interface SizeDefinition {
  name: string;
  sku: string; // Size code for SKU
  weightOz: number; // Weight in ounces
}

export interface ProductDefinition {
  handle: string;
  title: string;
  vendor: string;
  productType: string;
  tags: string[];
  descriptionHtml: string;
  styleCode: string; // e.g., "1717" for Comfort Colors
  sizes: SizeDefinition[];
  colors: ColorDefinition[];
  basePrice: number;
  compareAtPrice: number;
}

// =============================================================================
// GraphQL Input Types (matching Shopify Admin API)
// =============================================================================

export interface ProductOptionValueInput {
  name: string;
}

export interface ProductOptionInput {
  name: string;
  values: ProductOptionValueInput[];
}

export interface VariantOptionValueInput {
  optionName: string;
  name: string;
}

export interface InventoryItemInput {
  tracked: boolean;
}

export interface ProductVariantInput {
  optionValues: VariantOptionValueInput[];
  price: number;
  compareAtPrice?: number;
  sku?: string;
  inventoryItem?: InventoryItemInput;
}

export interface ProductSetInput {
  title: string;
  handle?: string;
  vendor?: string;
  productType?: string;
  tags?: string[];
  descriptionHtml?: string;
  status?: 'ACTIVE' | 'ARCHIVED' | 'DRAFT';
  productOptions?: ProductOptionInput[];
  variants?: ProductVariantInput[];
}

// =============================================================================
// GraphQL Response Types
// =============================================================================

export interface ProductOption {
  id: string;
  name: string;
  values: string[];
}

export interface ProductVariant {
  id: string;
  title: string;
  price: string;
  sku: string | null;
}

export interface Product {
  id: string;
  handle: string;
  title: string;
  status: string;
  options: ProductOption[];
  variants: {
    nodes: ProductVariant[];
  };
}

export interface UserError {
  field: string[] | null;
  message: string;
  code?: string;
}

export interface ProductSetPayload {
  product: Product | null;
  userErrors: UserError[];
}

export interface ProductSetResponse {
  data?: {
    productSet: ProductSetPayload;
  };
  errors?: Array<{
    message: string;
    path?: string[];
  }>;
}

export interface ProductDeletePayload {
  deletedProductId: string | null;
  userErrors: UserError[];
}

export interface ProductDeleteResponse {
  data?: {
    productDelete: ProductDeletePayload;
  };
  errors?: Array<{
    message: string;
  }>;
}

export interface ProductByHandleResponse {
  data?: {
    productByHandle: {
      id: string;
      handle: string;
      title: string;
    } | null;
  };
  errors?: Array<{
    message: string;
  }>;
}

// =============================================================================
// Utility Types
// =============================================================================

export interface GeneratedVariant {
  size: SizeDefinition;
  color: ColorDefinition;
  sku: string;
  price: number;
  compareAtPrice: number;
}
