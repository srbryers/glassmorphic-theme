# Beacon Brand Library

## Overview

**Brand Name:** Beacon (with "Basics" as core product line)
**Mood:** Playful but simple
**Style:** Illustrated patch aesthetic with thick outlines

---

## Color Palette

### Primary Colors

| Token | Hex | RGB | Usage |
|-------|-----|-----|-------|
| `--primary` | `#C1272D` | 193, 39, 45 | Primary actions, links, CTAs |
| `--primary-hover` | `#A82025` | 168, 32, 37 | Hover state (10% darker) |
| `--primary-foreground` | `#FFFFFF` | 255, 255, 255 | Text on primary |

**Source:** Lighthouse roof red - warm, inviting, attention-grabbing

### Accent Colors

| Token | Hex | RGB | Usage |
|-------|-----|-----|-------|
| `--accent` | `#9DD1E3` | 157, 209, 227 | Secondary actions, highlights |
| `--accent-hover` | `#7FC4DB` | 127, 196, 219 | Hover state |
| `--accent-foreground` | `#1C1C1C` | 28, 28, 28 | Text on accent |

**Source:** Ocean water blue - playful, coastal, refreshing

### Supporting Colors

| Token | Hex | RGB | Usage |
|-------|-----|-----|-------|
| `--beacon-yellow` | `#F5D033` | 245, 208, 51 | Highlights, badges, stars |
| `--beacon-green` | `#6B7D3D` | 107, 125, 61 | Success states, positive |
| `--beacon-blue` | `#9DD1E3` | 157, 209, 227 | Info, links, water |

**Source:** Lighthouse light (yellow), grass (green), water (blue)

### Coastal Palette

| Token | Hex | RGB | Usage |
|-------|-----|-----|-------|
| `--sand` | `#F5F1EB` | 245, 241, 235 | Section backgrounds, warm neutral |
| `--sand-light` | `#FAF8F5` | 250, 248, 245 | Lighter sand accent |
| `--sand-dark` | `#E8E0D5` | 232, 224, 213 | Darker sand, borders |
| `--navy` | `#1B3A4B` | 27, 58, 75 | Footer, dark sections |
| `--navy-light` | `#2D5066` | 45, 80, 102 | Navy hover/accent |
| `--navy-dark` | `#0F2530` | 15, 37, 48 | Darkest navy |

**Source:** New England coastline - sandy beaches and deep ocean blues

**Usage:**
- Sand colors for alternating section backgrounds
- Navy for footer and dark mode sections
- Creates a warm, coastal feel that complements the lighthouse theme

### Semantic Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--success` | `#6B7D3D` | Success messages, positive actions |
| `--success-foreground` | `#FFFFFF` | Text on success |
| `--warning` | `#F5D033` | Warning messages, caution |
| `--warning-foreground` | `#1C1C1C` | Text on warning |
| `--destructive` | `#C1272D` | Error states, delete actions |
| `--destructive-foreground` | `#FFFFFF` | Text on destructive |

### Neutral Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `--background` | `#FAFAFA` | Page background (warm white) |
| `--foreground` | `#1C1C1C` | Primary text |
| `--card` | `#FFFFFF` | Card backgrounds |
| `--card-foreground` | `#1C1C1C` | Card text |
| `--muted` | `#F4F4F5` | Muted backgrounds |
| `--muted-foreground` | `#71717A` | Secondary text |
| `--border` | `#E4E4E7` | Borders |
| `--input` | `#E4E4E7` | Input borders |
| `--ring` | `#C1272D` | Focus rings |

### Color Tints (Primary Red)

| Tint | Hex | Usage |
|------|-----|-------|
| `--primary-50` | `#FEF2F2` | Lightest background |
| `--primary-100` | `#FEE2E2` | Light background |
| `--primary-200` | `#FECACA` | Subtle accent |
| `--primary-300` | `#FCA5A5` | Medium accent |
| `--primary-400` | `#F87171` | Strong accent |
| `--primary-500` | `#C1272D` | Primary (base) |
| `--primary-600` | `#A82025` | Hover |
| `--primary-700` | `#8B1A1F` | Active |
| `--primary-800` | `#6F1518` | Dark |
| `--primary-900` | `#531012` | Darkest |

---

## Typography

### Font Stack

**Headings:** Bebas Neue
- Source: Google Fonts
- Weights: 400 (Regular only - it's a display font)
- Character: Bold, condensed, playful, impactful
- Usage: Hero headlines, section titles, display text

**Body:** Inter
- Source: Google Fonts
- Weights: 400 (Regular), 500 (Medium), 600 (Semibold), 700 (Bold)
- Character: Clean, modern, highly readable
- Usage: Body text, UI elements, buttons, labels

### Type Scale

| Level | Font | Size | Weight | Line Height | Letter Spacing | Usage |
|-------|------|------|--------|-------------|----------------|-------|
| Display | Bebas Neue | 4rem (64px) | 400 | 1.0 | 0.02em | Hero headlines |
| H1 | Bebas Neue | 3rem (48px) | 400 | 1.1 | 0.02em | Page titles |
| H2 | Bebas Neue | 2.25rem (36px) | 400 | 1.15 | 0.01em | Section headers |
| H3 | Inter | 1.5rem (24px) | 600 | 1.3 | 0 | Card titles |
| H4 | Inter | 1.25rem (20px) | 600 | 1.4 | 0 | Subsection titles |
| Body Large | Inter | 1.125rem (18px) | 400 | 1.6 | 0 | Lead paragraphs |
| Body | Inter | 1rem (16px) | 400 | 1.6 | 0 | Standard text |
| Body Small | Inter | 0.875rem (14px) | 400 | 1.5 | 0 | Secondary text |
| Caption | Inter | 0.75rem (12px) | 500 | 1.4 | 0.01em | Labels, metadata |
| Label | Inter | 0.875rem (14px) | 500 | 1.4 | 0 | Form labels |

### Font Pairing Notes

- **Bebas Neue** is a display font - use sparingly for maximum impact
- Use **ALL CAPS** for Bebas Neue headings (it's designed for this)
- **Inter** handles everything else - body, buttons, navigation, forms
- The contrast between condensed display and clean sans-serif creates visual interest

---

## Shadows

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-xs` | `0 1px 2px 0 rgb(0 0 0 / 0.05)` | Subtle depth |
| `--shadow-sm` | `0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)` | Cards, buttons |
| `--shadow-md` | `0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)` | Dropdowns |
| `--shadow-lg` | `0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)` | Modals, popovers |
| `--shadow-xl` | `0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)` | Large cards |
| `--shadow-2xl` | `0 25px 50px -12px rgb(0 0 0 / 0.25)` | Hero elements |
| `--shadow-glass` | `0 8px 32px 0 rgb(0 0 0 / 0.08)` | Glassmorphism |
| `--shadow-primary-sm` | `0 4px 14px 0 rgb(193 39 45 / 0.25)` | Primary buttons |
| `--shadow-primary-lg` | `0 10px 40px 0 rgb(193 39 45 / 0.3)` | Featured elements |

---

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | `0.375rem` (6px) | Small buttons, badges |
| `--radius-md` | `0.5rem` (8px) | Inputs, standard buttons |
| `--radius-lg` | `0.75rem` (12px) | Cards |
| `--radius-xl` | `1rem` (16px) | Large cards |
| `--radius-2xl` | `1.5rem` (24px) | Feature cards, modals |
| `--radius-3xl` | `2rem` (32px) | Hero elements |
| `--radius-full` | `9999px` | Pills, avatars |

---

## Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--space-1` | `0.25rem` (4px) | Tight spacing |
| `--space-2` | `0.5rem` (8px) | Icon gaps |
| `--space-3` | `0.75rem` (12px) | Small padding |
| `--space-4` | `1rem` (16px) | Standard padding |
| `--space-5` | `1.25rem` (20px) | Medium padding |
| `--space-6` | `1.5rem` (24px) | Card padding |
| `--space-8` | `2rem` (32px) | Section gaps |
| `--space-10` | `2.5rem` (40px) | Large gaps |
| `--space-12` | `3rem` (48px) | Section padding |
| `--space-16` | `4rem` (64px) | Major sections |
| `--space-20` | `5rem` (80px) | Hero padding |
| `--space-24` | `6rem` (96px) | Page sections |

---

## Animation

### Timing

| Duration | Value | Usage |
|----------|-------|-------|
| Fast | `150ms` | Micro-interactions (hovers, focus) |
| Normal | `200ms` | Buttons, toggles |
| Moderate | `300ms` | Cards, transitions |
| Slow | `500ms` | Page transitions, reveals |

### Easing

| Name | Value | Usage |
|------|-------|-------|
| Default | `cubic-bezier(0.4, 0, 0.2, 1)` | General purpose |
| In | `cubic-bezier(0.4, 0, 1, 1)` | Enter animations |
| Out | `cubic-bezier(0, 0, 0.2, 1)` | Exit animations |
| In-Out | `cubic-bezier(0.4, 0, 0.2, 1)` | Symmetric transitions |

---

## Logo Usage

### Versions

1. **Full Logo** (`Beacons Logo - Vector.png`) - Primary usage, horizontal
2. **Lighthouse Icon** (`Lighthouse - Vector.png`) - Favicon, app icons, small spaces
3. **Patch Style** (`Lighthouse - Patch.png`) - Embroidery, merchandise

### Clear Space

- Minimum clear space: Height of the lighthouse roof
- Never place logo on busy backgrounds without sufficient contrast

### Color Variations

- **Full Color**: Default, use on white/light backgrounds
- **Black**: Use on light backgrounds when color isn't available
- **White**: Use on dark backgrounds or photos

---

## Accessibility

### Contrast Ratios (WCAG AA)

| Combination | Ratio | Pass |
|-------------|-------|------|
| Primary on White | 7.2:1 | ✅ AAA |
| Foreground on Background | 14.5:1 | ✅ AAA |
| Muted-foreground on Background | 4.8:1 | ✅ AA |
| Primary-foreground on Primary | 7.2:1 | ✅ AAA |
| Warning-foreground on Warning | 12.1:1 | ✅ AAA |

### Focus States

- Use `--ring` color (`#C1272D`) for focus outlines
- Minimum 2px outline width
- Include offset for visibility

---

## Lighthouse Visual Elements

### Wave Dividers

Use the `wave-divider.liquid` snippet to create smooth coastal transitions between sections:

```liquid
{% render 'wave-divider', color: 'var(--navy)', direction: 'down', height: '60px' %}
```

**Parameters:**
- `color` - CSS color value (default: `var(--sand)`)
- `direction` - `'up'` or `'down'` (default: `'down'`)
- `height` - CSS height value (default: `'60px'`)

### Lighthouse Illustration

The footer includes an animated lighthouse illustration:

```liquid
{% render 'footer-lighthouse', size: '80px', animate: true %}
```

**Parameters:**
- `size` - Height of the lighthouse (default: `'100px'`)
- `animate` - Show glow animation (default: `true`)

### Lighthouse Beam Effect

The hero section includes an optional lighthouse beam sweep animation:

**CSS Class:** `.lighthouse-beam`
- Radial gradient from yellow center
- 8-second sweep animation
- Subtle opacity (0.15-0.35)

**Enable in Theme Editor:** Hero > Show lighthouse beam effect

### Stripe Pattern

Use lighthouse stripes as decorative accents:

```css
.stripe-lighthouse { /* Vertical red/white stripes */ }
.stripe-lighthouse-horizontal { /* Horizontal red/white stripes */ }
```

---

## Implementation Files

- `frontend/styles/variables.css` - CSS custom properties (including coastal palette)
- `frontend/styles/utilities.css` - Lighthouse effects, wave utilities
- `frontend/styles/fonts.css` - Font imports and definitions
- `snippets/wave-divider.liquid` - Wave SVG component
- `snippets/footer-lighthouse.liquid` - Footer lighthouse illustration
- `assets/Lighthouse - Vector.svg` - Source lighthouse SVG
- `config/settings_schema.json` - Shopify theme editor settings
