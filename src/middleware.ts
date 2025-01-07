import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Excluir rutas públicas y API
  if (
    request.nextUrl.pathname.startsWith('/api') ||
    request.nextUrl.pathname === '/login'
  ) {
    return NextResponse.next();
  }

  // Verificar si existe la cookie de autenticación
  const isAuthenticated = request.cookies.get('isAuthenticated')?.value === 'true';

  // Si no está autenticado, redirigir a login
  if (!isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - login (login page)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|login).*)',
  ],
}; 