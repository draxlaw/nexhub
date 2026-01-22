# Tailwind CSS v4 to v3 Downgrade Plan

## Issue
`react-scripts` 5.0.1 has internal PostCSS configuration that conflicts with Tailwind CSS v4. The error occurs because Tailwind v4 moved the PostCSS plugin to a separate package `@tailwindcss/postcss`, but react-scripts tries to use tailwindcss directly.

## Solution
Downgrade to Tailwind CSS v3.x which is fully compatible with `react-scripts` 5.0.1.

## Steps to Complete

### 1. Update package.json
- [x] Downgrade `tailwindcss` from `^4.1.18` to `^3.4.17`
- [x] Remove `@tailwindcss/postcss` from dependencies

### 2. Update postcss.config.js
- [x] Change from `@tailwindcss/postcss` to `tailwindcss` plugin
- [x] Keep autoprefixer

### 3. Update src/index.css
- [x] Change from `@import "tailwindcss";` to v3 syntax:
  - `@tailwind base;`
  - `@tailwind components;`
  - `@tailwind utilities;`
- [x] Keep custom theme and layer definitions

### 4. Update/Remove tailwind.config.js
- [x] Check if tailwind.config.js exists and update for v3 compatibility

### 5. Install dependencies
- [ ] Run `npm install` in frontend directory

### 6. Test build
- [ ] Run `npm run build` to verify the fix

## Files to Modify
1. `/home/walbe/Documents/nexus-hub/frontend/package.json`
2. `/home/walbe/Documents/nexus-hub/frontend/postcss.config.js`
3. `/home/walbe/Documents/nexus-hub/frontend/src/index.css`
4. `/home/walbe/Documents/nexus-hub/frontend/tailwind.config.js` (if exists)

