/**
 * Comfort Colors 1717 - Heavyweight T-Shirt
 *
 * The original Comfort Colors garment-dyed heavyweight t-shirt.
 * 6.1 oz, 100% ring spun cotton, relaxed fit.
 */

import type { ProductDefinition, SizeDefinition } from '../lib/types.js';
import { COMFORT_COLORS_CORE } from './colors.js';

/**
 * Size definitions with weights (approximate for garment-dyed)
 */
const SIZES: SizeDefinition[] = [
  { name: 'S', sku: 'S', weightOz: 5.4 },
  { name: 'M', sku: 'M', weightOz: 5.6 },
  { name: 'L', sku: 'L', weightOz: 5.8 },
  { name: 'XL', sku: 'XL', weightOz: 6.0 },
  { name: '2XL', sku: '2XL', weightOz: 6.2 },
  { name: '3XL', sku: '3XL', weightOz: 6.4 },
];

/**
 * Product description HTML
 */
const DESCRIPTION_HTML = `
<p><strong>The Original Comfort Colors Heavyweight Tee</strong></p>

<p>Our signature garment-dyed t-shirt in a relaxed, easy fit. Made from 100% ring spun cotton for incredible softness that only gets better with every wash.</p>

<h4>Features</h4>
<ul>
  <li>6.1 oz heavyweight fabric</li>
  <li>100% ring spun cotton</li>
  <li>Garment-dyed for unique, lived-in look</li>
  <li>Relaxed fit through body</li>
  <li>Double-needle stitched collar, sleeves, and hem</li>
  <li>Twill-taped neck and shoulders</li>
</ul>

<h4>Care</h4>
<p>Machine wash cold with like colors. Tumble dry low. Slight shrinkage and color variation is normal for garment-dyed items.</p>
`.trim();

/**
 * Comfort Colors 1717 Product Definition
 */
export const COMFORT_COLORS_1717: ProductDefinition = {
  handle: 'heavyweight-t-shirt',
  title: 'Heavyweight T-Shirt',
  vendor: 'Comfort Colors',
  productType: 'T-Shirts',
  tags: ['basics', 'heavyweight', 'comfort-colors', '1717', 'garment-dyed', 'cotton'],
  descriptionHtml: DESCRIPTION_HTML,
  styleCode: '1717',
  sizes: SIZES,
  colors: COMFORT_COLORS_CORE,
  basePrice: 24.99,
  compareAtPrice: 29.99,
};

/**
 * Generate SKU for a size/color combination
 * Format: CC-1717-{SIZE}-{COLOR}
 */
export function generateSku(styleCode: string, sizeSku: string, colorSku: string): string {
  return `CC-${styleCode}-${sizeSku}-${colorSku}`;
}

/**
 * Get total variant count for this product
 */
export function getVariantCount(): number {
  return SIZES.length * COMFORT_COLORS_CORE.length;
}
