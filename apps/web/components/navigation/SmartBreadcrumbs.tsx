'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface BreadcrumbItem {
  label: string;
  href: string;
  icon?: string;
}

const PATH_MAP: Record<string, BreadcrumbItem[]> = {
  '/': [{ label: 'Home', href: '/' }],
  '/wonder-build/playcanvas': [
    { label: 'Home', href: '/' },
    { label: '3D Builder', href: '/wonder-build/playcanvas', icon: '🎮' }
  ],
  '/ide': [
    { label: 'Home', href: '/' },
    { label: 'Code Editor', href: '/ide', icon: '💻' }
  ],
  '/wonder-build/puck': [
    { label: 'Home', href: '/' },
    { label: 'UI Builder', href: '/wonder-build/puck', icon: '🎨' }
  ],
  '/wonder-build/ai-builder': [
    { label: 'Home', href: '/' },
    { label: 'AI Builder', href: '/wonder-build/ai-builder', icon: '🤖' }
  ],
  '/marketplace': [
    { label: 'Home', href: '/' },
    { label: 'Registry', href: '/marketplace', icon: '📦' }
  ],
  '/dashboard': [
    { label: 'Home', href: '/' },
    { label: 'Dashboard', href: '/dashboard' }
  ],
  '/docs': [
    { label: 'Home', href: '/' },
    { label: 'Docs', href: '/docs' }
  ]
};

export function SmartBreadcrumbs() {
  const pathname = usePathname();

  // Find the best matching breadcrumb path
  const breadcrumbs = PATH_MAP[pathname] ||
    // Fallback for nested routes
    (() => {
      const segments = pathname.split('/').filter(Boolean);
      const crumbs: BreadcrumbItem[] = [{ label: 'Home', href: '/' }];

      let currentPath = '';
      segments.forEach((segment, index) => {
        currentPath += `/${segment}`;
        const knownCrumb = Object.entries(PATH_MAP).find(([path]) => path === currentPath);
        if (knownCrumb) {
          crumbs.push(knownCrumb[1][knownCrumb[1].length - 1]);
        } else {
          // Create a generic crumb for unknown paths
          crumbs.push({
            label: segment.charAt(0).toUpperCase() + segment.slice(1).replace('-', ' '),
            href: currentPath
          });
        }
      });

      return crumbs;
    })();

  if (breadcrumbs.length <= 1) return null;

  return (
    <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-sm text-white/60 mb-4">
      {breadcrumbs.map((crumb, index) => (
        <div key={crumb.href} className="flex items-center">
          {index > 0 && (
            <svg className="w-4 h-4 mx-2 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          )}
          {index === breadcrumbs.length - 1 ? (
            <span className="flex items-center text-white font-medium">
              {crumb.icon && <span className="mr-1">{crumb.icon}</span>}
              {crumb.label}
            </span>
          ) : (
            <Link
              href={crumb.href}
              className="flex items-center hover:text-white transition-colors"
            >
              {crumb.icon && <span className="mr-1">{crumb.icon}</span>}
              {crumb.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}