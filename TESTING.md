# Testing Checklist

Use this checklist to verify all templates and features are working correctly.

---

## Customer Account

### Login (`/account/login`)

- [ ] Page displays with glassmorphic styling
- [ ] Email field validation (required, email format)
- [ ] Password field validation (required)
- [ ] "Forgot password?" links to reset page
- [ ] "Create one" links to register page
- [ ] Valid credentials → redirects to account
- [ ] Invalid credentials → shows error message

### Register (`/account/register`)

- [ ] Page displays with glassmorphic styling
- [ ] First name, last name, email, password fields present
- [ ] All field validations work
- [ ] Form submission creates account and redirects
- [ ] "Sign in" links to login page

### Dashboard (`/account`)

- [ ] Welcome message shows customer's first name
- [ ] Address count card displays correctly
- [ ] Orders count card displays correctly
- [ ] Email displays correctly
- [ ] "Addresses" card navigates to addresses page
- [ ] "Sign out" logs out and redirects

**With orders:**
- [ ] Order table displays with correct columns
- [ ] Order numbers link to order details
- [ ] Payment status badges show correct colors
- [ ] Fulfillment status badges show correct colors
- [ ] Pagination works if >20 orders

**Without orders:**
- [ ] Empty state displays
- [ ] "Start shopping" button links to products

### Order Details (`/account/orders/{id}`)

- [ ] "Back to account" link works
- [ ] Order name and date display in header
- [ ] Payment status badge displays
- [ ] Fulfillment status badge displays
- [ ] Total amount displays
- [ ] Shipping address displays correctly
- [ ] Billing address displays correctly
- [ ] Line items show images, titles, variants
- [ ] Line item quantities and prices correct
- [ ] Discounts display (if applicable)
- [ ] Subtotal, shipping, tax, total correct

**With tracking:**
- [ ] Tracking section displays
- [ ] Tracking company and number show
- [ ] "Track shipment" button opens tracking URL

### Addresses (`/account/addresses`)

- [ ] "Back to account" link works
- [ ] "Add new address" button expands form
- [ ] All address fields present in form
- [ ] Country dropdown populates provinces
- [ ] "Set as default" checkbox works
- [ ] Submit creates address in grid
- [ ] Default address shows badge
- [ ] "Edit" expands inline form
- [ ] Edit form saves changes
- [ ] "Delete" shows confirmation
- [ ] Delete removes address
- [ ] Setting new default moves badge

**Without addresses:**
- [ ] Empty state displays with message

### Password Reset (`/account/recover`)

- [ ] Page displays with glassmorphic styling
- [ ] Email field present and validates
- [ ] Submit shows success message
- [ ] "Back to login" links to login page

### Activate Account (`/account/activate/{token}`)

- [ ] Page displays with glassmorphic styling
- [ ] Password field present
- [ ] Confirm password field present
- [ ] Matching passwords → activates account
- [ ] "Decline invitation" links to login

---

## Search

### Search Results (`/search`)

- [ ] Search form displays with placeholder
- [ ] Search input is focused/prominent

**With search term:**
- [ ] Results count message displays
- [ ] Sort dropdown present and functional

**Type filters:**
- [ ] "All" shows all result types
- [ ] "Products" filters to products only
- [ ] "Articles" filters to articles only
- [ ] "Pages" filters to pages only
- [ ] Active filter is highlighted

**Product results:**
- [ ] Product cards display correctly
- [ ] Images, titles, prices show
- [ ] Cards link to product pages

**Article results:**
- [ ] Article cards show featured image
- [ ] Date displays
- [ ] Excerpt displays
- [ ] "Article" badge shows
- [ ] Cards link to article pages

**Page results:**
- [ ] Page cards show title
- [ ] Content preview displays
- [ ] "Page" badge shows
- [ ] Cards link to pages

**No results:**
- [ ] Empty state displays
- [ ] Search suggestions show
- [ ] "Browse all products" button works

**Pagination:**
- [ ] Pagination displays if results > per page
- [ ] Page navigation works

---

## Blog

### Blog Listing (`/blogs/{handle}`)

- [ ] Blog title displays
- [ ] Tag filter pills display (if tags exist)
- [ ] "All" tag is highlighted by default

**Article cards:**
- [ ] Featured image displays
- [ ] Date displays
- [ ] Author displays
- [ ] Excerpt displays
- [ ] "Read more" link works

**Tag filtering:**
- [ ] Clicking tag filters articles
- [ ] Active tag is highlighted
- [ ] Clicking "All" removes filter

**Pagination:**
- [ ] Pagination displays if >6 articles
- [ ] Page navigation works

**Empty state:**
- [ ] Message displays if no articles

### Article (`/blogs/{handle}/{article}`)

- [ ] "Back to {blog}" link works
- [ ] Article title displays
- [ ] Date displays with icon
- [ ] Author displays with icon
- [ ] Comment count displays (if comments enabled)
- [ ] Featured image displays (if present)
- [ ] Article content renders correctly

**Prose styling:**
- [ ] Headings styled correctly
- [ ] Paragraphs have proper spacing
- [ ] Links are styled and clickable
- [ ] Lists render correctly
- [ ] Blockquotes styled with border
- [ ] Images have rounded corners

**Tags:**
- [ ] Tags display below content
- [ ] Tag links go to filtered blog

**Share buttons:**
- [ ] Facebook share opens dialog
- [ ] Twitter share opens dialog
- [ ] Email share opens mail client

**Comments (if enabled):**
- [ ] Existing comments display
- [ ] Comment author initial avatar shows
- [ ] Comment date displays
- [ ] Comment form displays
- [ ] Name field validates
- [ ] Email field validates
- [ ] Comment body validates
- [ ] Submit posts comment
- [ ] Comment pagination works (if >10)

---

## Page

### General Page (`/pages/{handle}`)

- [ ] Page title displays (if enabled)
- [ ] Page content renders correctly

**Prose styling:**
- [ ] Headings styled correctly
- [ ] Paragraphs spaced correctly
- [ ] Links styled and clickable
- [ ] Lists render correctly
- [ ] Tables render with borders
- [ ] Blockquotes styled

**Theme editor settings:**
- [ ] "Show page title" toggle works
- [ ] "Center title" toggle works
- [ ] "Center content" toggle works
- [ ] Content width options work (narrow/medium/wide)

---

## Responsive Testing

### Mobile (375px)

- [ ] Login page usable
- [ ] Register page usable
- [ ] Account dashboard stacks correctly
- [ ] Order table scrolls horizontally
- [ ] Address cards stack in single column
- [ ] Search results stack correctly
- [ ] Blog cards stack in single column
- [ ] Article page readable
- [ ] Page template readable

### Tablet (768px)

- [ ] Account dashboard 2-3 columns
- [ ] Address cards 2 columns
- [ ] Search results 2 columns
- [ ] Blog cards 2 columns

### Desktop (1280px)

- [ ] All layouts display as designed
- [ ] Proper max-widths applied
- [ ] Content centered correctly

---

## Accessibility

### Keyboard Navigation

- [ ] Tab order is logical on all forms
- [ ] Focus indicators visible
- [ ] Enter key submits forms
- [ ] Escape closes modals (if any)

### Screen Reader

- [ ] Form labels announced correctly
- [ ] Error messages announced
- [ ] Buttons have accessible names
- [ ] Links have descriptive text
- [ ] Images have alt text

### General

- [ ] Color contrast passes WCAG AA
- [ ] Text is resizable
- [ ] Touch targets are 44px minimum

---

## Notes

Record any issues found during testing:

| Page | Issue | Severity | Status |
|------|-------|----------|--------|
|      |       |          |        |
|      |       |          |        |
|      |       |          |        |
