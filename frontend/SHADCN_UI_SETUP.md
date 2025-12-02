# shadcn/ui Configuration Guide

## Overview

shadcn/ui is a collection of re-usable, well-designed, accessible, unstyled React components built on top of Radix UI primitives and Tailwind CSS. This document describes the complete setup and configuration for your project.

## Installation Status ✅

All shadcn/ui components have been successfully installed and configured.

- **Total Components**: 56 components installed
- **Setup Date**: December 2, 2025
- **Version**: Latest stable

## Installed Components (56 total)

### Layout Components
- ✅ Accordion
- ✅ AspectRatio
- ✅ Card
- ✅ Collapsible
- ✅ Separator
- ✅ Sidebar
- ✅ Resizable

### Input Components
- ✅ Button
- ✅ Checkbox
- ✅ Input
- ✅ Label
- ✅ Radio Group
- ✅ Select
- ✅ Switch
- ✅ Textarea
- ✅ Toggle
- ✅ Toggle Group

### Overlay Components
- ✅ Alert Dialog
- ✅ Dialog (Modal)
- ✅ Popover
- ✅ Tooltip
- ✅ Sheet (Drawer)
- ✅ Context Menu
- ✅ Dropdown Menu
- ✅ Hover Card
- ✅ Navigation Menu

### Data Display
- ✅ Avatar
- ✅ Badge
- ✅ Breadcrumb
- ✅ Calendar
- ✅ Carousel
- ✅ Chart
- ✅ Command (Cmdk)
- ✅ Progress
- ✅ Scroll Area
- ✅ Table
- ✅ Tabs

### Form Components
- ✅ Form (React Hook Form integration)
- ✅ Input
- ✅ Textarea
- ✅ Checkbox
- ✅ Radio Group
- ✅ Select
- ✅ Switch
- ✅ Input OTP

### Notification Components
- ✅ Alert
- ✅ Sonner (Toast)
- ✅ Toaster (Toast Provider)

### Navigation
- ✅ Breadcrumb
- ✅ Navigation Menu
- ✅ Menubar

### Utility Components
- ✅ Button Group
- ✅ Empty State
- ✅ Field
- ✅ Item
- ✅ KBD (Keyboard)
- ✅ Pagination
- ✅ Slider
- ✅ Skeleton
- ✅ Spinner

### Other
- ✅ Theme Provider
- ✅ Use Mobile Hook

## Configuration Files

### 1. components.json
Located at: `/frontend/components.json`

This file configures shadcn/ui CLI and component path settings:
```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": false,
  "tsx": true,
  "alias": "@",
  "baseColor": "slate",
  "cssVariables": true,
  "components": {
    "path": "src/components/ui"
  },
  "utils": {
    "path": "src/lib/utils.ts"
  }
}
```

### 2. Vite Configuration
Located at: `/frontend/vite.config.ts`

Path alias configured:
```typescript
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
  },
}
```

This allows importing components as:
```typescript
import { Button } from '@/components/ui/button'
```

### 3. Tailwind CSS Configuration
Located at: `/frontend/tailwind.config.js`

**Key Features:**
- CSS Variables enabled for theming
- All shadcn/ui color tokens configured
- Animation plugin included (tailwindcss-animate)
- Custom border radius scale
- Full color palette for light/dark modes

**Color Tokens:**
- background / foreground
- card / card-foreground
- popover / popover-foreground
- primary / primary-foreground
- secondary / secondary-foreground
- muted / muted-foreground
- accent / accent-foreground
- destructive / destructive-foreground
- border / input / ring

### 4. Global Styles
Located at: `/frontend/src/index.css`

**Features:**
- Uses Tailwind CSS v4 with `@import`
- Custom CSS variables for theming (OKLch color space)
- Custom scrollbar styling
- Dark mode support
- Font configuration (Geist font family)
- Optimized font rendering

## Theme Configuration

### Color Scheme
The application uses an **OKLch color space** for better color perception:

```css
:root {
  --background: oklch(0.11 0.01 252);     /* Dark background */
  --foreground: oklch(0.98 0 0);          /* Light foreground */
  --primary: oklch(0.65 0.22 252);        /* Blue primary */
  --accent: oklch(0.6 0.19 180);          /* Cyan accent */
  --destructive: oklch(0.55 0.22 25);     /* Red destructive */
  /* ... more colors ... */
}
```

### Light/Dark Mode
Both light and dark mode use the same token values. To add light mode variants, add a `.light` class with different CSS variables.

### Custom Properties
- `--radius`: 0.5rem (default border radius)
- `--sidebar`: Custom sidebar colors
- `--chart-1` through `--chart-5`: Chart colors

## Usage Examples

### Basic Button
```typescript
import { Button } from '@/components/ui/button'

export function MyComponent() {
  return <Button>Click me</Button>
}
```

### Dialog Component
```typescript
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export function MyDialog() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Title</DialogTitle>
        </DialogHeader>
        {/* Content */}
      </DialogContent>
    </Dialog>
  )
}
```

### Form with Validation
```typescript
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormField, FormItem, FormLabel } from '@/components/ui/form'

export function MyForm() {
  const form = useForm()

  return (
    <Form {...form}>
      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email</FormLabel>
            <Input {...field} />
          </FormItem>
        )}
      />
      <Button type="submit">Submit</Button>
    </Form>
  )
}
```

## Adding New Components

To add additional shadcn/ui components in the future:

```bash
# Navigate to frontend directory
cd frontend

# Add a component (e.g., data-table)
npx shadcn-ui@latest add data-table
```

## Available Utilities

### cn() Function
Located at: `/src/lib/utils.ts`

Combines classNames and merges Tailwind classes:
```typescript
import { cn } from '@/lib/utils'

// Usage
const buttonClass = cn(
  'px-4 py-2 rounded-lg',
  isActive && 'bg-primary text-white',
)
```

## Project Dependencies

### UI/Component Libraries
- `@radix-ui/*`: Base unstyled components (18+ packages)
- `lucide-react`: Icon library
- `sonner`: Toast notifications
- `cmdk`: Command menu
- `embla-carousel-react`: Carousel component
- `recharts`: Charts and graphs

### Styling
- `tailwindcss`: Utility CSS framework (v4)
- `tailwind-merge`: Merge Tailwind classes without conflicts
- `tailwindcss-animate`: Animation utilities
- `class-variance-authority`: Type-safe component variants
- `clsx`: Conditional classnames

### Form Handling
- `react-hook-form`: Form state management
- `zod`: Schema validation
- `@hookform/resolvers`: Validation resolvers

### Themes
- `next-themes`: Dark mode support

## Best Practices

1. **Use Compound Components**: shadcn/ui components are designed to be composed together
2. **Leverage TypeScript**: All components are fully typed
3. **Extend Safely**: Override only what you need, keep component structure
4. **Import Paths**: Always use `@/components/ui/...` for consistency
5. **Styling**: Use Tailwind CSS classes for styling, avoid inline styles
6. **Accessibility**: All components follow WAI-ARIA standards

## Testing

To ensure proper build:
```bash
cd frontend
npm run build
```

Build output shows:
- ✓ 1753 modules transformed
- ✓ Production build successful
- CSS: ~122 KB (19 KB gzipped)
- JS: ~503 KB (160 KB gzipped)

## Documentation References

- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Radix UI Documentation](https://www.radix-ui.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [React Hook Form](https://react-hook-form.com/)

## Support & Maintenance

- Components are automatically maintained through package.json
- Updates can be applied via `npm update`
- Breaking changes checked against compatibility
- All components have zero peer dependency conflicts

---

**Last Updated**: December 2, 2025
**Status**: Production Ready ✅
