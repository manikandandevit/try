# Setup Instructions

## Prerequisites
- Node.js 18+ and npm
- Python 3.8+ with Django backend running

## Frontend Setup

```bash
cd frontend-react
npm install
npm run dev
```

Frontend will run on http://localhost:3000

## Backend Setup (Required)

The frontend requires the Django backend to be running. Start it in a separate terminal:

```bash
cd backend
python manage.py runserver
```

Backend will run on http://localhost:8000

## Important Notes

1. **Backend Must Be Running**: The Vite proxy will forward `/api/*` requests to `http://localhost:8000`. If the backend isn't running, you'll see connection errors.

2. **CORS**: Make sure Django CORS settings allow requests from `http://localhost:3000`

3. **CSRF Token**: The frontend automatically retrieves CSRF tokens from cookies or meta tags.

## Troubleshooting

### Proxy Errors (ECONNREFUSED)
- **Solution**: Start the Django backend server first
- Run: `cd backend && python manage.py runserver`

### TypeScript Errors
- Run: `npm run build` to check for type errors
- All files should be `.ts` or `.tsx` (no `.js` files)

### Port Conflicts
- Change Vite port in `vite.config.ts` if 3000 is taken
- Change Django port: `python manage.py runserver 8001`

