'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/supabase/auth-context';
import { useRouter } from 'next/navigation';
import { GlobalNavigation } from '@/components/navigation/GlobalNavigation';

export default function Homepage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const isAuthenticated = Boolean(user);
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.refresh();
  };

  return (
    <main className="relative min-h-screen bg-black text-white">
      <GlobalNavigation />

      {/* ─── HERO — Clean and simple ─────────────────── */}
      <section className="relative w-full overflow-hidden pt-20" style={{ minHeight: "100svh" }}>
        {/* Full-bleed background image */}
        <Image
          src="/images/wonderland-theme.webp"
          alt="AI Wonderland hero scene"
          fill
          priority
          className="object-cover object-left"
          sizes="100vw"
        />

        {/* Gradient overlays */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/60 via-black/10 to-black/80" />

        {/* Hero content overlay */}
        <div className="relative z-20 flex min-h-[100svh] flex-col justify-center px-6 sm:px-10">
          <div className="max-w-4xl mx-auto text-center">
            <p className="mb-4 text-sm font-bold uppercase tracking-widest text-pink-400">
              AI Wonderland
            </p>
            <h1 className="text-5xl font-extrabold leading-tight tracking-tight text-white drop-shadow-lg sm:text-6xl lg:text-7xl mb-6">
              Build Anything,<br />Get Lost Never
            </h1>
            <p className="text-xl text-white/80 drop-shadow mb-12 max-w-2xl mx-auto">
              Choose your builder. Navigate with confidence. Create with power.
            </p>

            {/* Main Action Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <Link
                href="/wonder-build/playcanvas"
                className="group bg-gradient-to-br from-blue-600/90 to-blue-800/90 backdrop-blur-sm border border-blue-500/50 rounded-2xl p-8 hover:from-blue-500 hover:to-blue-700 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25"
              >
                <div className="text-4xl mb-4">🎮</div>
                <h3 className="text-xl font-bold text-white mb-2">3D Builder</h3>
                <p className="text-blue-100 text-sm">Create immersive 3D worlds with PlayCanvas</p>
              </Link>

              <Link
                href="/ide"
                className="group bg-gradient-to-br from-green-600/90 to-green-800/90 backdrop-blur-sm border border-green-500/50 rounded-2xl p-8 hover:from-green-500 hover:to-green-700 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-green-500/25"
              >
                <div className="text-4xl mb-4">💻</div>
                <h3 className="text-xl font-bold text-white mb-2">Code Editor</h3>
                <p className="text-green-100 text-sm">Full-featured IDE with Theia workspace</p>
              </Link>

              <Link
                href="/wonder-build/puck"
                className="group bg-gradient-to-br from-purple-600/90 to-purple-800/90 backdrop-blur-sm border border-purple-500/50 rounded-2xl p-8 hover:from-purple-500 hover:to-purple-700 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25"
              >
                <div className="text-4xl mb-4">🎨</div>
                <h3 className="text-xl font-bold text-white mb-2">UI Builder</h3>
                <p className="text-purple-100 text-sm">Visual drag-and-drop interface design</p>
              </Link>

              <Link
                href="/wonder-build/ai-builder"
                className="group bg-gradient-to-br from-orange-600/90 to-orange-800/90 backdrop-blur-sm border border-orange-500/50 rounded-2xl p-8 hover:from-orange-500 hover:to-orange-700 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/25"
              >
                <div className="text-4xl mb-4">🤖</div>
                <h3 className="text-xl font-bold text-white mb-2">AI Builder</h3>
                <p className="text-orange-100 text-sm">Generate complete apps with AI assistance</p>
              </Link>

              <Link
                href="/marketplace"
                className="group bg-gradient-to-br from-cyan-600/90 to-cyan-800/90 backdrop-blur-sm border border-cyan-500/50 rounded-2xl p-8 hover:from-cyan-500 hover:to-cyan-700 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/25"
              >
                <div className="text-4xl mb-4">📦</div>
                <h3 className="text-xl font-bold text-white mb-2">Registry</h3>
                <p className="text-cyan-100 text-sm">Extensions, templates, and marketplace</p>
              </Link>

              <Link
                href="/docs"
                className="group bg-gradient-to-br from-gray-600/90 to-gray-800/90 backdrop-blur-sm border border-gray-500/50 rounded-2xl p-8 hover:from-gray-500 hover:to-gray-700 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-gray-500/25"
              >
                <div className="text-4xl mb-4">📚</div>
                <h3 className="text-xl font-bold text-white mb-2">Documentation</h3>
                <p className="text-gray-100 text-sm">Guides, tutorials, and API reference</p>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ───────────────────────────────────────────────── */}
      <footer className="border-t border-white/10 bg-black/50 backdrop-blur-sm py-12">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <p className="text-white/60 text-sm">
            Never get lost again. Every page has clear navigation back to your builders.
          </p>
        </div>
      </footer>
    </main>
  );
}