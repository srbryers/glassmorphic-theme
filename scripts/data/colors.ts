/**
 * Comfort Colors core color palette
 *
 * These are the most popular colors from the Comfort Colors catalog.
 * Hex codes are approximate and used for placeholder images.
 */

import type { ColorDefinition } from '../lib/types.js';

/**
 * Core Comfort Colors palette (20 colors)
 * Subset of the full 80+ color catalog
 */
export const COMFORT_COLORS_CORE: ColorDefinition[] = [
  // Neutrals
  { name: 'White', hex: '#FFFFFF', sku: 'WHT' },
  { name: 'Black', hex: '#1C1C1C', sku: 'BLK' },
  { name: 'Graphite', hex: '#4B4B4B', sku: 'GRP' },
  { name: 'Grey', hex: '#A8A8A8', sku: 'GRY' },
  { name: 'Pepper', hex: '#3B3B3B', sku: 'PEP' },

  // Blues
  { name: 'Blue Jean', hex: '#4A6FA5', sku: 'BJN' },
  { name: 'Midnight', hex: '#191970', sku: 'MID' },
  { name: 'Lagoon', hex: '#5BCED2', sku: 'LAG' },

  // Greens & Teals
  { name: 'Seafoam', hex: '#71D9C0', sku: 'SFM' },
  { name: 'Chalky Mint', hex: '#B5E2C4', sku: 'CMT' },
  { name: 'Island Reef', hex: '#7FCDBB', sku: 'ISR' },
  { name: 'Moss', hex: '#8A9A5B', sku: 'MOS' },

  // Earth Tones
  { name: 'Hemp', hex: '#CBCBA9', sku: 'HMP' },
  { name: 'Khaki', hex: '#C3B091', sku: 'KHK' },

  // Reds & Pinks
  { name: 'Crimson', hex: '#DC143C', sku: 'CRM' },
  { name: 'Berry', hex: '#8E4585', sku: 'BRY' },
  { name: 'Watermelon', hex: '#FD4659', sku: 'WTM' },
  { name: 'Blossom', hex: '#FFB7C5', sku: 'BLS' },

  // Yellows & Purples
  { name: 'Butter', hex: '#FFFACD', sku: 'BTR' },
  { name: 'Orchid', hex: '#DA70D6', sku: 'ORC' },
];

/**
 * Get all color names
 */
export function getColorNames(): string[] {
  return COMFORT_COLORS_CORE.map((c) => c.name);
}

/**
 * Get color by name
 */
export function getColorByName(name: string): ColorDefinition | undefined {
  return COMFORT_COLORS_CORE.find((c) => c.name.toLowerCase() === name.toLowerCase());
}
