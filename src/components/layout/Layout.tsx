import type { ReactNode } from 'react';
import { Header } from './Header';
import { Navigation } from './Navigation';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-terminal-bg relative">
      {/* Grid overlay effect */}
      <div className="grid-overlay" />

      {/* Scanline effect - subtle CRT look */}
      <div className="scanline opacity-30" />

      {/* Main content */}
      <div className="relative z-10">
        <Header />
        <Navigation />
        <main className="max-w-[1920px] mx-auto px-3 sm:px-6 py-4 sm:py-6">
          {children}
        </main>
      </div>

      {/* Corner decorations */}
      <div className="fixed top-0 left-0 w-32 h-32 pointer-events-none">
        <div className="absolute top-4 left-4 w-16 h-px bg-gradient-to-r from-accent-cyan/50 to-transparent" />
        <div className="absolute top-4 left-4 w-px h-16 bg-gradient-to-b from-accent-cyan/50 to-transparent" />
      </div>
      <div className="fixed top-0 right-0 w-32 h-32 pointer-events-none">
        <div className="absolute top-4 right-4 w-16 h-px bg-gradient-to-l from-accent-cyan/50 to-transparent" />
        <div className="absolute top-4 right-4 w-px h-16 bg-gradient-to-b from-accent-cyan/50 to-transparent" />
      </div>
      <div className="fixed bottom-0 left-0 w-32 h-32 pointer-events-none">
        <div className="absolute bottom-4 left-4 w-16 h-px bg-gradient-to-r from-accent-cyan/50 to-transparent" />
        <div className="absolute bottom-4 left-4 w-px h-16 bg-gradient-to-t from-accent-cyan/50 to-transparent" />
      </div>
      <div className="fixed bottom-0 right-0 w-32 h-32 pointer-events-none">
        <div className="absolute bottom-4 right-4 w-16 h-px bg-gradient-to-l from-accent-cyan/50 to-transparent" />
        <div className="absolute bottom-4 right-4 w-px h-16 bg-gradient-to-t from-accent-cyan/50 to-transparent" />
      </div>
    </div>
  );
}
