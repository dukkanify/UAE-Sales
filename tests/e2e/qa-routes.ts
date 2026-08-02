export const publicRoutes = [
  '/',
  '/categories',
  '/listings',
  '/login',
  '/register',
  '/forgot-password',
  '/profile',
  '/wallet',
  '/orders',
  '/notifications',
  '/chat',
] as const;

export const adminRoutes = [
  '/admin',
  '/admin/users',
  '/admin/listings',
  '/admin/orders',
  '/admin/escrow',
  '/admin/disputes',
  '/admin/categories',
  '/admin/reports',
] as const;

export const apiSmokeRoutes = [
  '/api/health',
  '/api/categories',
  '/api/listings',
] as const;
