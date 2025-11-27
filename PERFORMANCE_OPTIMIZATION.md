R# Performance Optimization Plan - JomionStore

## Current Performance Issues (Speed Insights Analysis)

### Overall Metrics
- **RES (Real Experience Score)**: 68/100 (Needs Improvement)
- **Target**: >90 for good user experience
- **Critical Issue**: Only 75% of visits have a great experience

### Core Web Vitals

| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| **LCP** (Largest Contentful Paint) | 2.24s | <2.5s | ✅ Good |
| **FID** (First Input Delay) | 31ms | <100ms | ✅ Good |
| **INP** (Interaction to Next Paint) | **632ms** | <200ms | ❌ **CRITICAL** |
| **CLS** (Cumulative Layout Shift) | **0.23** | <0.1 | ⚠️ Needs Improvement |
| **FCP** (First Contentful Paint) | 1.36s | <1.8s | ✅ Good |
| **TTFB** (Time to First Byte) | 0.61s | <0.8s | ✅ Good |

### Route-Specific Issues (Worst Performers)

| Route | RES | Issue |
|-------|-----|-------|
| `/admin/products/import` | **20** | Critical - Heavy client-side rendering |
| `/admin/dashboard` | **19** | Critical - Multiple chart libraries, heavy data fetching |
| `/admin/analytics` | **17** | Critical - Large data processing |
| `/about` | **54** | Poor - Unoptimized images/content |
| `/product/[slug]` | **89** | Close - Needs minor optimization |
| `/category/[slug]` | **80** | Needs improvement |
| `/admin/products` | **84** | Needs improvement |

---

## Priority 1: Fix Critical INP Issue (632ms → <200ms)

### Root Causes
1. **Heavy JavaScript execution** blocking main thread
2. **Unoptimized event handlers** in Header component
3. **Multiple popup managers** running simultaneously
4. **Recharts library** causing render blocking on admin pages
5. **Large carousel** with seasonal announcements

### Solutions

#### 1.1 Optimize Header Component

**Current Issues:**
- Large seasonal announcements array (50+ items)
- Carousel auto-rotation every 6s
- Search suggestions fetching on every keystroke
- Multiple useEffect hooks

**Fixes:**
```typescript
// Reduce announcements to 6-8 max
// Increase carousel interval to 10s
// Debounce search to 500ms (currently 300ms)
// Memoize expensive computations
// Use passive event listeners
```

#### 1.2 Lazy Load Popup Managers
**Current Issue:** All popups load on every page

**Fix:**
```typescript
// Use dynamic imports
const PopupManager = dynamic(() => import('@/components/layout/PopupManager'), {
  ssr: false,
  loading: () => null
});
```

#### 1.3 Optimize Admin Dashboard Charts
**Current Issue:** Recharts is heavy and blocks rendering

**Fixes:**
- Lazy load chart components
- Use `react-window` for large lists
- Implement virtual scrolling
- Cache chart data in localStorage
- Use Web Workers for data processing

---

## Priority 2: Fix CLS Issue (0.23 → <0.1)

### Root Causes
1. **Images without dimensions** causing layout shifts
2. **Fonts loading** causing text reflow
3. **Dynamic content** (popups, banners) appearing
4. **Carousel** height changes

### Solutions

#### 2.1 Reserve Space for Images
```typescript
// Add explicit width/height to all Image components
<Image
  src={src}
  alt={alt}
  width={800}
  height={600}
  className="..."
  priority={isAboveFold}
/>
```

#### 2.2 Optimize Font Loading
```typescript
// Already using font-display: swap, but add preload
<link
  rel="preload"
  href="/fonts/inter-var.woff2"
  as="font"
  type="font/woff2"
  crossOrigin="anonymous"
/>
```

#### 2.3 Fix Carousel Height
```typescript
// Set fixed height for announcement carousel
<div className="h-10 overflow-hidden">
  <Carousel>...</Carousel>
</div>
```

---

## Priority 3: Optimize Admin Routes

### 3.1 Admin Products Import Page (RES: 20)

**Issues:**
- Heavy form components
- Image preview loading
- No code splitting

**Fixes:**
```typescript
// 1. Lazy load preview component
const ProductPreview = dynamic(() => import('./ProductPreview'), {
  loading: () => <Skeleton />
});

// 2. Debounce URL validation
const debouncedValidation = useMemo(
  () => debounce(validateUrl, 500),
  []
);

// 3. Use React.memo for form components
const ImportForm = React.memo(({ ... }) => { ... });
```

### 3.2 Admin Dashboard (RES: 19)

**Issues:**
- Multiple chart libraries loading
- Heavy data fetching on mount
- No caching

**Fixes:**
```typescript
// 1. Implement data caching
const CACHE_KEY = 'dashboard_stats';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// 2. Lazy load charts
const SalesChart = dynamic(() => import('./charts/SalesChart'), {
  loading: () => <ChartSkeleton />
});

// 3. Use React Query for caching
const { data } = useQuery({
  queryKey: ['dashboard-stats'],
  queryFn: fetchStats,
  staleTime: 5 * 60 * 1000,
  cacheTime: 10 * 60 * 1000
});

// 4. Virtualize long lists
import { FixedSizeList } from 'react-window';
```

### 3.3 Admin Analytics (RES: 17)

**Fixes:**
- Implement pagination (show 50 items max)
- Use server-side filtering
- Add loading states
- Cache processed data

---

## Priority 4: Optimize Bundle Size

### Current Issues
- Large JavaScript bundles
- Unused dependencies
- No tree-shaking for some libraries

### Analysis Commands
```bash
npm run analyze
```

### Expected Optimizations
1. **Code splitting**: Split admin routes into separate chunks
2. **Tree shaking**: Remove unused Radix UI components
3. **Dynamic imports**: Lazy load heavy components
4. **Remove duplicates**: Check for duplicate dependencies

### Target Bundle Sizes
- First Load JS: <200KB (currently likely >300KB)
- Route JS: <100KB per route
- Shared chunks: <150KB

---

## Priority 5: Image Optimization

### Issues
1. Large hero images
2. Product images not optimized
3. No blur placeholders
4. Missing responsive images
5. Image quality warnings (85, 90 not configured)

### Fixes

#### 5.1 Add Blur Placeholders
```typescript
// Generate blur data URLs
import { getPlaiceholder } from 'plaiceholder';

// Or use simple blur
<Image
  src={src}
  alt={alt}
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>
```

#### 5.2 Optimize Hero Images
```typescript
// Use priority loading
<Image
  src="/hero.jpg"
  alt="Hero"
  priority
  quality={85}
  sizes="100vw"
/>
```

#### 5.3 Lazy Load Below-Fold Images
```typescript
<Image
  src={src}
  alt={alt}
  loading="lazy"
  quality={75}
/>
```

---

## Priority 6: Reduce JavaScript Execution

### Strategies

#### 6.1 Remove Unused Code
```bash
# Check for unused exports
npx depcheck

# Remove unused dependencies
npm uninstall <unused-package>
```

#### 6.2 Optimize Third-Party Scripts
```typescript
// Load analytics after page interactive
<Script
  src="analytics.js"
  strategy="lazyOnload"
/>
```

#### 6.3 Use Web Workers
```typescript
// Move heavy computations to workers
const worker = new Worker('/workers/data-processor.js');
worker.postMessage(largeDataset);
```

---

## Priority 7: Implement Caching Strategy

### 7.1 API Response Caching
```typescript
// Use React Query with aggressive caching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
    },
  },
});
```

### 7.2 Static Asset Caching
```javascript
// Already configured in next.config.js
// Verify headers are working:
// Cache-Control: public, max-age=31536000, immutable
```

### 7.3 Service Worker Caching
```javascript
// Enhance sw.js with better caching strategies
// - Cache-first for static assets
// - Network-first for API calls
// - Stale-while-revalidate for images
```

---

## Priority 8: Database Query Optimization

### Issues
- N+1 queries on dashboard
- Missing indexes
- Unoptimized joins

### Fixes
```sql
-- Add indexes for frequently queried columns
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_products_category ON products(category_id);

-- Use materialized views for dashboard stats
CREATE MATERIALIZED VIEW dashboard_stats AS
SELECT ...
REFRESH MATERIALIZED VIEW dashboard_stats;
```

---

## Implementation Checklist

### Week 1: Critical Fixes (INP & CLS)
- [ ] Optimize Header component (reduce announcements, debounce search)
- [ ] Lazy load popup managers
- [ ] Fix image dimensions across site
- [ ] Set fixed carousel height
- [ ] Add font preloading

### Week 2: Admin Routes
- [ ] Optimize admin dashboard (lazy load charts, add caching)
- [ ] Optimize admin products import (code splitting)
- [ ] Optimize admin analytics (pagination, virtualization)
- [ ] Add loading skeletons

### Week 3: Bundle & Images
- [ ] Run bundle analyzer
- [ ] Implement code splitting
- [ ] Add blur placeholders to images
- [ ] Optimize hero images
- [ ] Lazy load below-fold content

### Week 4: Advanced Optimizations
- [ ] Implement React Query caching
- [ ] Add database indexes
- [ ] Optimize service worker
- [ ] Add Web Workers for heavy computations
- [ ] Performance monitoring dashboard

---

## Monitoring & Testing

### Tools
1. **Lighthouse CI**: Automated performance testing
2. **Web Vitals**: Real user monitoring
3. **Vercel Analytics**: Track RES improvements
4. **Chrome DevTools**: Profile performance

### Success Metrics
- RES: 68 → **>90**
- INP: 632ms → **<200ms**
- CLS: 0.23 → **<0.1**
- Admin routes RES: 20-39 → **>75**

### Testing Commands
```bash
# Local Lighthouse test
npx lighthouse https://localhost:3000 --view

# Bundle analysis
npm run analyze

# Performance profiling
# Chrome DevTools > Performance > Record
```

---

## Quick Wins (Implement Today)

### 1. Reduce Announcements Array
```typescript
// components/layout/Header.tsx
// Keep only 6 announcements max
const announcements = useMemo(() => {
  const seasonal = getSeasonalAnnouncements();
  return [...defaultAnnouncements.slice(0, 3), ...seasonal.slice(0, 3)];
}, []);
```

### 2. Increase Search Debounce
```typescript
// Change from 300ms to 500ms
const timeoutId = setTimeout(fetchSuggestions, 500);
```

### 3. Lazy Load Charts
```typescript
// app/admin/dashboard/page.tsx
const AreaChart = dynamic(() => import('recharts').then(mod => mod.AreaChart), {
  ssr: false,
  loading: () => <div className="h-[300px] animate-pulse bg-gray-200" />
});
```

### 4. Add Image Dimensions
```typescript
// Find all <Image> without width/height
// Add explicit dimensions
```

### 5. Passive Event Listeners
```typescript
// components/layout/Header.tsx
window.addEventListener('scroll', handleScroll, { passive: true });
```

---

## Expected Results

### After Week 1
- INP: 632ms → ~400ms
- CLS: 0.23 → ~0.15
- RES: 68 → ~75

### After Week 2
- Admin routes RES: 20-39 → ~60-70
- Overall RES: 75 → ~82

### After Week 3
- Bundle size: -30%
- LCP: 2.24s → ~1.8s
- RES: 82 → ~88

### After Week 4
- **Target achieved**: RES >90
- INP: <200ms
- CLS: <0.1
- All routes: RES >75

---

## Notes

- Focus on INP first (biggest impact)
- Test on real devices (mobile especially)
- Monitor after each change
- Don't over-optimize (diminishing returns)
- Keep user experience smooth during changes
