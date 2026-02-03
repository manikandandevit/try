# SynQuot Frontend - React + TypeScript

Complete frontend rewrite of SynQuot AI Quotation Maker using React + TypeScript (TSX only).

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📁 Project Structure

```
src/
├── assets/           # Static assets
├── components/       # React components
│   ├── common/      # Shared components
│   ├── layout/      # Layout components (Sidebar, etc.)
│   ├── pages/       # Page components (Chat, Quotation)
│   └── ui/          # UI primitives (Button, Input, etc.)
├── hooks/           # Custom React hooks
├── services/        # API services
├── utils/           # Utility functions
├── types/           # TypeScript types and interfaces
├── styles/          # Global styles
├── App.tsx          # Main app component
└── main.tsx         # Entry point
```

## 🛠️ Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety (strict mode)
- **Vite** - Build tool
- **CSS Modules** - Scoped styling
- **html2pdf.js** - PDF generation

## ✨ Features

- ✅ **100% TypeScript** - No JavaScript files
- ✅ **Strict Typing** - No 'any' types
- ✅ **Component-based** - Reusable, maintainable components
- ✅ **Custom Hooks** - Clean state management
- ✅ **Responsive Design** - Mobile-first approach
- ✅ **Production Ready** - Optimized and tested

## 📝 Type Safety

All components, hooks, and utilities are fully typed:
- Props interfaces
- State types
- API response types
- Utility function types

## 🎨 Styling

Uses CSS Modules for scoped styling with:
- Professional corporate design
- Consistent color system
- Responsive breakpoints
- Smooth animations

## 🔌 API Integration

All API calls are typed and handled through the `apiService`:
- Chat messages
- Quotation management
- Company info
- PDF generation

## 📱 Responsive Design

Fully responsive across:
- Mobile (< 768px)
- Tablet (768px - 1024px)
- Desktop (> 1024px)

## 🚫 Prohibited

- ❌ No JavaScript files (.js, .jsx)
- ❌ No 'any' types
- ❌ No implicit types
- ❌ No placeholder code

## 📄 License

Private project - All rights reserved

