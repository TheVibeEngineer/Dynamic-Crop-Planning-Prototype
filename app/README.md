# Next.js App Router Structure

This directory contains the Next.js App Router implementation of the Dynamic Crop Planning System.

## 🏗️ Directory Structure

```
app/
├── layout.tsx          # Root layout with metadata and AppLayout wrapper
├── page.tsx            # Home page (redirects to /orders)
├── loading.tsx         # Global loading component
├── error.tsx           # Global error boundary
├── not-found.tsx       # 404 error page
├── orders/             # Orders management section
│   ├── layout.tsx      # Orders section layout
│   └── page.tsx        # Orders page component
├── commodities/        # Commodities & varieties section
│   ├── layout.tsx      # Commodities section layout
│   └── page.tsx        # Commodities page component
├── land/               # Land management section
│   ├── layout.tsx      # Land section layout
│   └── page.tsx        # Land page component
├── planning/           # Crop planning analytics section
│   ├── layout.tsx      # Planning section layout
│   └── page.tsx        # Planning page component
├── gantt/              # Timeline view section
│   ├── layout.tsx      # Gantt section layout
│   └── page.tsx        # Gantt page component
└── data/               # Data management section
    ├── layout.tsx      # Data section layout
    └── page.tsx        # Data page component
```

## 🚀 Key Features

### 1. **App Router Benefits**
- **File-based routing**: Each directory becomes a route automatically
- **Nested layouts**: Section-specific layouts with proper metadata
- **Server Components**: Improved performance with server-side rendering
- **Code splitting**: Automatic code splitting per route

### 2. **Global State Management**
- **AppLayout Component**: Manages global application state
- **Context Injection**: Passes state to all child pages
- **Centralized Hooks**: All custom hooks managed in one place

### 3. **SEO & Metadata**
- **Dynamic Titles**: Each section has appropriate page titles
- **Meta Descriptions**: SEO-optimized descriptions per page
- **Open Graph**: Social media sharing optimization

### 4. **Error Handling**
- **Error Boundaries**: Graceful error handling per route
- **Loading States**: Professional loading indicators
- **404 Pages**: User-friendly not found pages

## 🔄 Routing

### Navigation Structure
```
/ (root)           → Redirects to /orders
/orders           → Customer order management
/commodities      → Commodity & variety configuration
/land             → Land management with drag & drop
/planning         → Crop planning analytics
/gantt            → Timeline visualization
/data             → Data export/import tools
```

### URL Examples
```
https://yourapp.com/orders          # Orders page
https://yourapp.com/land            # Land management
https://yourapp.com/planning        # Analytics dashboard
```

## 🎯 State Management Pattern

### Global Context Flow
1. **AppLayout** initializes all hooks and state
2. **Global Context** object created with all data and actions
3. **Pages** receive context via props injection
4. **Components** get specific props they need

### Benefits
- **Single Source of Truth**: All state managed in AppLayout
- **Type Safety**: Full TypeScript support throughout
- **Performance**: Only re-renders when necessary
- **Maintainability**: Clear data flow pattern

## 🔧 Development

### Adding New Pages
1. Create new directory under `app/`
2. Add `page.tsx` with your component
3. Add `layout.tsx` with metadata
4. Update navigation in `components/layout/Navigation.tsx`

### Adding New Features
1. Create component in `components/[feature]/`
2. Add to global context in `AppLayout.tsx`
3. Create page that uses the component
4. Add route to navigation

## 📱 Mobile Responsiveness

All layouts and components are designed to be mobile-first and responsive:
- **Responsive Navigation**: Adapts to mobile screens
- **Flexible Grids**: Adjust based on screen size
- **Touch-Friendly**: Optimized for touch interactions

## 🚀 Performance

### Optimization Features
- **Automatic Code Splitting**: Per-route bundles
- **Server Components**: Reduced client-side JavaScript
- **Lazy Loading**: Components load when needed
- **Tree Shaking**: Unused code eliminated

### Bundle Analysis
```bash
npm run build
npm run analyze  # If bundle analyzer is configured
```

## 🔍 SEO Optimization

Each page includes:
- **Unique titles** reflecting the current section
- **Meta descriptions** for search engines
- **Open Graph tags** for social media
- **Structured navigation** for better crawling

## 🛠️ Extending

The app router structure makes it easy to:
- **Add new sections** by creating new directories
- **Implement nested routes** for detailed views
- **Add API routes** in the same directory structure
- **Include middleware** for authentication/authorization

This modern architecture provides a solid foundation for scaling the crop planning system while maintaining excellent performance and developer experience.
