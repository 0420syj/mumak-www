import { NextResponse } from 'next/server';

const locales = ['ko', 'en'];
const defaultLocale = 'ko';

function getLocale(request) {
  const acceptLanguage = request.headers.get('accept-language') || '';
  const preferredLocale = acceptLanguage.split(',')[0]?.split('-')[0];

  if (preferredLocale && locales.includes(preferredLocale)) {
    return preferredLocale;
  }

  return defaultLocale;
}

export function proxy(request) {
  const { pathname } = request.nextUrl;

  // Skip internal paths
  if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.includes('.')) {
    return;
  }

  // Check if pathname already has a locale
  const pathnameHasLocale = locales.some(locale => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`);

  if (pathnameHasLocale) {
    return;
  }

  // Redirect to locale path
  const locale = getLocale(request);
  request.nextUrl.pathname = `/${locale}${pathname}`;

  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  matcher: ['/((?!_next|api|.*\\..*).*)'],
};
