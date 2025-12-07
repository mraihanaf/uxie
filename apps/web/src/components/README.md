# UXIE Components Library

Komponen UI library untuk Uxie dengan design system **Futuristic Soft Glass Edu**.

## 📁 Struktur Folder

Setiap komponen memiliki folder terpisah dengan file-file yang terkait:

```
components/
├── button/
│   ├── button-primary.tsx
│   ├── button-secondary.tsx
│   ├── button-outline.tsx
│   ├── button-destructive.tsx
│   ├── button-ghost.tsx
│   └── index.ts
├── card/
│   ├── card-feature.tsx
│   ├── card-content.tsx
│   ├── card-stats.tsx
│   └── index.ts
├── input/
│   ├── input-text.tsx
│   ├── input-password.tsx
│   ├── input-search.tsx
│   └── index.ts
├── textarea/
│   ├── textarea.tsx
│   └── index.ts
├── badge/
│   ├── badge.tsx
│   └── index.ts
└── avatar/
    ├── avatar.tsx
    └── index.ts
```

## 🎨 Color Palette

- **Primary (Biru):** `#5B7FEE`
- **Secondary (Lavender):** `#E6D9F3` (light) / `#3D2D5C` (dark)
- **Accent (Teal):** `#6ECDC1`
- **Destructive (Red):** `#D94E3D`
- **Background:** `#FFFFFF` (light) / `#000000` (dark)
- **Text:** `#3A3A3A` (light) / `#EFEFEF` (dark)
- **Border:** `#E8E8E8` (light) / `#505050` (dark)
- **Muted:** `#F3F3F3` (light) / `#383838` (dark)

## 📦 Komponen yang Tersedia

### Button

Semua varian button dengan ukuran yang berbeda:

```tsx
import { PrimaryButton, SecondaryButton, OutlineButton, DestructiveButton, GhostButton } from "@/components/button";

// Primary Button
<PrimaryButton size="default">Click Me</PrimaryButton>

// Secondary Button
<SecondaryButton size="lg">Secondary</SecondaryButton>

// Outline Button
<OutlineButton size="sm">Outline</OutlineButton>

// Destructive Button
<DestructiveButton>Delete</DestructiveButton>

// Ghost Button
<GhostButton>Ghost</GhostButton>
```

**Sizes:** `sm`, `default`, `lg`, `full`

### Card

Tiga jenis card untuk berbagai use case:

```tsx
import { FeatureCard, ContentCard, StatsCard } from "@/components/card";

// Feature Card
<FeatureCard
  icon={<Icon />}
  title="Title"
  description="Description"
  iconColor="text-[#6ECDC1]"
/>

// Content Card
<ContentCard
  image={<img />}
  title="Title"
  excerpt="Excerpt"
  date="2024-01-01"
/>

// Stats Card
<StatsCard
  icon={<Icon />}
  value="1,234"
  label="Total Users"
  trend={{ value: "+12%", isPositive: true }}
  variant="success"
/>
```

### Input

Input fields dengan berbagai states:

```tsx
import { TextInput, PasswordInput, SearchInput } from "@/components/input";

// Text Input
<TextInput
  label="Email"
  placeholder="Enter email"
  error={false}
  helperText="Helper text"
/>

// Password Input
<PasswordInput
  label="Password"
  error={hasError}
  errorMessage="Error message"
/>

// Search Input
<SearchInput
  label="Search"
  placeholder="Search..."
/>
```

### Textarea

```tsx
import { Textarea } from "@/components/textarea";

<Textarea
  label="Description"
  maxLength={250}
  showCounter
  helperText="Helper text"
/>;
```

### Badge

```tsx
import { Badge } from "@/components/badge";

<Badge variant="primary" size="default">New</Badge>
<Badge variant="success">Active</Badge>
<Badge variant="error">Error</Badge>
```

**Variants:** `primary`, `secondary`, `success`, `error`, `warning`, `info`, `outline`

### Avatar

```tsx
import { Avatar } from "@/components/avatar";

<Avatar
  src="/path/to/image.png"
  alt="User"
  size="md"
  status="online"
/>

<Avatar
  initials="JD"
  size="lg"
  status="away"
/>
```

**Sizes:** `sm`, `md`, `lg`  
**Status:** `online`, `away`, `offline`

## 🚀 Penggunaan

Semua komponen dapat diimport dari folder masing-masing:

```tsx
// Import dari index
import { PrimaryButton } from "@/components/button";
import { FeatureCard } from "@/components/card";
import { TextInput } from "@/components/input";
```

## 📝 Catatan

- Semua komponen sudah mendukung **dark mode** secara otomatis
- Menggunakan **glassmorphism** effect untuk card dan overlay
- Animasi menggunakan **cubic-bezier(0.16, 1, 0.3, 1)** untuk smooth transition
- Semua komponen **accessible** dengan proper ARIA labels
- **Responsive** untuk mobile, tablet, dan desktop

## 🔄 Komponen yang Masih Perlu Dibuat

Berdasarkan dokumentasi, komponen berikut masih perlu dibuat:

- [ ] Select / Dropdown
- [ ] Checkbox
- [ ] Radio Button
- [ ] Toggle / Switch
- [ ] Slider / Range
- [ ] Tabs
- [ ] Breadcrumb
- [ ] Pagination
- [ ] Modal / Dialog
- [ ] Toast / Notification
- [ ] Alert / Banner
- [ ] Tooltip
- [ ] Popover
- [ ] Progress Bar
- [ ] Spinner / Loader
- [ ] Skeleton
- [ ] Table / Data Grid
- [ ] List Item
- [ ] Timeline / Stepper
- [ ] Image Container
- [ ] Carousel / Image Slider
- [ ] Divider / Separator

Silakan buat komponen-komponen tersebut dengan mengikuti pola yang sama seperti komponen yang sudah ada.
