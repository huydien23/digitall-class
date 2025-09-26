# EduAttend Design System

## 🎨 Tổng quan

Đây là design system thống nhất cho toàn bộ ứng dụng EduAttend, được xây dựng dựa trên màu sắc chuyên nghiệp từ dashboard và tạo sự hài hòa giữa các component.

## 🌟 Điểm nổi bật

- **Màu sắc thống nhất**: Gradient xanh chuyên nghiệp (#6366f1 → #4f46e5 → #4338ca)
- **Typography cải thiện**: Inter font với letter-spacing tối ưu
- **Shadows hiện đại**: Tailwind-inspired box shadows
- **Border radius**: 12px-16px cho modern look
- **Animations**: Smooth transitions với cubic-bezier

## 📋 Color Palette

### Primary Colors
```js
primary: {
  50: '#f0f4ff',   // Lightest
  100: '#e0e7ff',
  200: '#c7d2fe',
  300: '#a5b4fc',
  400: '#818cf8',
  500: '#6366f1',  // Main brand color
  600: '#4f46e5',
  700: '#4338ca',
  800: '#3730a3',
  900: '#312e81',  // Darkest
}
```

### Secondary Colors  
```js
secondary: {
  500: '#64748b',  // Blue-gray
  // ... full scale từ 50-900
}
```

### Semantic Colors
- **Success**: `#22c55e` (Green)
- **Warning**: `#f59e0b` (Orange)
- **Error**: `#ef4444` (Red)
- **Info**: `#0ea5e9` (Blue)

## 🎯 Custom Gradients

```js
gradients: {
  primary: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 50%, #4338ca 100%)',
  secondary: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)',
  success: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
  info: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
  subtle: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
}
```

## 🔧 Component Styles

### Button
- **Border radius**: `12px`
- **Font weight**: `600`
- **Hover effects**: `translateY(-1px)` + enhanced shadow
- **Transitions**: `all 0.2s cubic-bezier(0.4, 0, 0.2, 1)`

### Card
- **Border radius**: `16px`
- **Border**: `1px solid #f1f5f9`
- **Hover shadow**: Enhanced elevation
- **Background**: Clean white with subtle shadow

### TextField
- **Border radius**: `12px`
- **Focus border**: `2px solid #6366f1`
- **Hover effects**: Smooth color transitions

## 📁 Files Structure

```
src/theme/
├── theme.js           # Main theme configuration
├── ThemeProvider.jsx  # Theme provider component
└── README.md         # This documentation
```

## 🚀 Usage

### 1. Import theme
```jsx
import theme from '../theme/theme'
import ThemeProvider from '../theme/ThemeProvider'
```

### 2. Wrap your app
```jsx
function App() {
  return (
    <ThemeProvider>
      <YourAppContent />
    </ThemeProvider>
  )
}
```

### 3. Use theme values
```jsx
// In sx prop
sx={{
  background: theme.palette.gradients.primary,
  color: theme.palette.primary.main,
  borderRadius: theme.shape.borderRadius,
}}

// Or with theme function
import { useTheme } from '@mui/material/styles'

const theme = useTheme()
```

## 🎨 Components Updated

### ✅ Completed
- **HomePage/HeroSection**: Gradient xanh mới + hiệu ứng cải thiện
- **Login Form**: Glass morphism design + spacing tối ưu
- **Register Form**: Consistent với Login + input styling
- **Navigation**: Unified gradient + hover effects
- **Theme System**: Complete color palette + component overrides

### 🔄 Before vs After

**Before:**
- Gradient tím-hồng không thống nhất (#6366f1 → #8b5cf6 → #ec4899)
- Màu sắc khác nhau giữa pages
- Border radius không consistent

**After:**
- Gradient xanh chuyên nghiệp thống nhất
- Color palette đầy đủ với semantic meanings
- Modern glassmorphism effects
- Consistent spacing và typography

## 🏗️ Extensibility

Theme system dễ dàng mở rộng:

```jsx
// Add new gradient
const customTheme = createTheme({
  ...theme,
  palette: {
    ...theme.palette,
    gradients: {
      ...theme.palette.gradients,
      myCustomGradient: 'linear-gradient(135deg, #custom1, #custom2)'
    }
  }
})
```

## 📱 Responsive Design

Theme hỗ trợ responsive breakpoints:
- `xs`: 0px
- `sm`: 600px  
- `md`: 960px
- `lg`: 1280px
- `xl`: 1920px

## 🎯 Best Practices

1. **Luôn sử dụng theme values** thay vì hard-code colors
2. **Consistent spacing** với theme.spacing()
3. **Use semantic colors** (success, warning, error) cho UI states
4. **Gradient backgrounds** cho primary elements
5. **Smooth transitions** cho better UX

## 🔮 Future Enhancements

- [ ] Dark mode support
- [ ] More gradient variations
- [ ] Animation presets
- [ ] Component variants system
- [ ] Custom breakpoints for tablet