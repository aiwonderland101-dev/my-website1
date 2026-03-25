'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

interface NavItem {
  label: string;
  href: string;
  icon: string;
  description: string;
}

const MAIN_NAV: NavItem[] = [
  {
    label: 'Home',
    href: '/',
    icon: '🏠',
    description: 'Welcome & overview'
  },
  {
    label: '3D Builder',
    href: '/wonder-build/playcanvas',
    icon: '🎮',
    description: 'PlayCanvas 3D scenes'
  },
  {
    label: 'Code Editor',
    href: '/ide',
    icon: '💻',
    description: 'Theia IDE workspace'
  },
  {
    label: 'UI Builder',
    href: '/wonder-build/puck',
    icon: '🎨',
    description: 'Puck visual editor'
  },
  {
    label: 'AI Builder',
    href: '/wonder-build/ai-builder',
    icon: '🤖',
    description: 'Generate with AI'
  },
  {
    label: 'Registry',
    href: '/marketplace',
    icon: '📦',
    description: 'Extensions & tools'
  }
];

export function GlobalNavigation() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const currentItem = MAIN_NAV.find(item => item.href === pathname);

  return (
    <>
      {/* Fixed Top Navigation Bar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-black/80 backdrop-blur-xl border-b border-white/10 shadow-lg'
          : 'bg-transparent'
      }`}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 text-white hover:text-white/80 transition">
              <span className="text-lg font-bold">AI Wonderland</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {MAIN_NAV.slice(0, 6).map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    pathname === item.href
                      ? 'bg-white/10 text-white shadow-lg'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`}
                  title={item.description}
                >
                  <span className="mr-1">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/5 transition"
              aria-label="Toggle navigation menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isOpen && (
          <div className="md:hidden bg-black/95 backdrop-blur-xl border-t border-white/10">
            <div className="px-4 py-4 space-y-1">
              {MAIN_NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`block px-3 py-3 rounded-lg text-sm font-medium transition-all ${
                    pathname === item.href
                      ? 'bg-white/10 text-white'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="mr-2 text-lg">{item.icon}</span>
                  <span className="font-semibold">{item.label}</span>
                  <p className="text-xs text-white/40 mt-1">{item.description}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Current Page Indicator */}
      {currentItem && (
        <div className="fixed top-20 left-4 z-40 hidden lg:block">
          <div className="bg-black/80 backdrop-blur-xl border border-white/10 rounded-lg px-3 py-2 shadow-lg">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-lg">{currentItem.icon}</span>
              <span className="text-white font-medium">{currentItem.label}</span>
            </div>
            <p className="text-xs text-white/60 mt-1">{currentItem.description}</p>
          </div>
        </div>
      )}

      {/* Quick Access FAB */}
      <div className="fixed bottom-6 right-6 z-40">
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 rounded-full shadow-lg flex items-center justify-center text-white text-xl transition-all duration-300 hover:scale-105"
            aria-label="Quick access menu"
          >
            ⚡
          </button>

          {/* Quick Access Menu */}
          {isOpen && (
            <div className="absolute bottom-16 right-0 bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl p-2 min-w-[200px]">
              <div className="text-xs font-semibold text-white/60 mb-2 px-2">Quick Access</div>
              <div className="space-y-1">
                {MAIN_NAV.slice(1, 5).map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition text-sm"
                  >
                    <span className="text-lg">{item.icon}</span>
                    <div>
                      <div className="text-white font-medium">{item.label}</div>
                      <div className="text-xs text-white/50">{item.description}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}