'use client';

import Link from 'next/link';
import { Logo } from '@/components/icons';
import { Button } from '@/components/ui/button';

// Inline SVG for the astronaut illustration
const AstronautIllustration = () => (
    <svg width="300" height="300" viewBox="0 0 300 300" className="absolute -right-16 -top-10 md:relative md:-right-0 md:-top-0 opacity-50 md:opacity-100">
        <defs>
            <radialGradient id="grad1" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                <stop offset="0%" style={{stopColor: 'rgba(100, 120, 255, 0.4)', stopOpacity: 1}} />
                <stop offset="100%" style={{stopColor: 'rgba(100, 120, 255, 0)', stopOpacity: 1}} />
            </radialGradient>
        </defs>
        <circle cx="150" cy="150" r="150" fill="url(#grad1)" />
        <g transform="translate(50, 50) rotate(15 100 100)">
            <path d="M118.8,36.2c-1.2-1.9-3.7-2.6-5.6-1.4l-11.8,7.3c-1.9,1.2-2.6,3.7-1.4,5.6c1.2,1.9,3.7,2.6,5.6,1.4l11.8-7.3 C119.3,40.6,120,38.1,118.8,36.2z" fill="#FFD700" />
            <path d="M165.7,112.5c-1.9-1.2-4.4-0.5-5.6,1.4l-7.3,11.8c-1.2,1.9-0.5,4.4,1.4,5.6c1.9,1.2,4.4,0.5,5.6-1.4l7.3-11.8 C168.3,116,167.6,113.6,165.7,112.5z" fill="#FFD700" />
            <path d="M102,150.8l-4.7,2.2c-0.8,0.4-1.7,0.3-2.5-0.1l-4.7-2.2c-0.8-0.4-1.2-1.3-0.9-2.1l2-4.4c0.3-0.7,1-1.2,1.8-1.2h5.8 c0.8,0,1.5,0.5,1.8,1.2l2,4.4C103.2,149.5,102.8,150.4,102,150.8z" fill="#a4b0be" />
            
            <g transform="rotate(-20, 100, 90)">
                <path d="M127,53.3c-23,0-41.7,18.7-41.7,41.7S104,136.7,127,136.7s41.7-18.7,41.7-41.7S150,53.3,127,53.3z" fill="#f5f6fa" />
                <path d="M127,58.3c-20.2,0-36.7,16.4-36.7,36.7s16.4,36.7,36.7,36.7s36.7-16.4,36.7-36.7S147.2,58.3,127,58.3z" fill="#1e272e" />
            </g>

            <path d="M110.1,139.4l-20.2,12.3c-3.1,1.9-4.2,5.9-2.3,9.1l5.8,9.5c1.9,3.1,5.9,4.2,9.1,2.3l20.2-12.3c3.1-1.9,4.2-5.9,2.3-9.1 l-5.8-9.5C117,148,113.2,137.5,110.1,139.4z" fill="#f5f6fa" />
            
            <path d="M96.3,101.4c-7.5-4.8-17.1-2.4-21.9,5.1l-8.6,13.4c-4.8,7.5-2.4,17.1,5.1,21.9c7.5,4.8,17.1,2.4,21.9-5.1l8.6-13.4 C106.1,115.8,103.8,106.2,96.3,101.4z" fill="#f5f6fa"/>

            <path d="M83,163.6l-10,16.5c-1.6,2.7-5,3.6-7.7,2l-9.1-5.5c-2.7-1.6-3.6-5-2-7.7l10-16.5c1.6-2.7,5-3.6,7.7-2l9.1,5.5 C83.7,157.5,84.6,160.9,83,163.6z" fill="#f5f6fa" />

            <path d="M124.5,108.9L113,127.3c-2,3.3-6.2,4.4-9.5,2.4l-11.2-6.8c-3.3-2-4.4-6.2-2.4-9.5L101.5,95c2-3.3,6.2-4.4,9.5-2.4l11.2,6.8 C125.5,101.4,126.5,105.6,124.5,108.9z" fill="#ff7979"/>
            <path d="M119.8,114.2l-9.9,16.2c-2,3.3-6.2,4.4-9.5,2.4l-11.2-6.8c-3.3-2-4.4-6.2-2.4-9.5l9.9-16.2c2-3.3,6.2-4.4,9.5-2.4l11.2,6.8 C120.8,106.7,121.8,110.9,119.8,114.2z" fill="#ff7979" />
        </g>
    </svg>
);

export default function NotFound() {
  return (
    <div className="bg-[#0a0a0a] text-white min-h-screen flex flex-col font-body antialiased">
      <header className="absolute top-0 left-0 right-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-20">
                <Logo className="h-8 w-auto" />
                <nav className="hidden md:flex gap-8">
                    <Link href="#" className="text-sm font-medium hover:text-primary transition-colors">Products</Link>
                    <Link href="#" className="text-sm font-medium hover:text-primary transition-colors">Features</Link>
                    <Link href="#" className="text-sm font-medium hover:text-primary transition-colors">Pricing</Link>
                    <Link href="#" className="text-sm font-medium hover:text-primary transition-colors">Support</Link>
                </nav>
                <Button variant="outline" className="hidden md:inline-flex bg-transparent border-primary/50 text-white hover:bg-primary/10 hover:text-white">
                    Start free trial
                </Button>
            </div>
        </div>
      </header>
      
      <main className="flex-1 flex items-center justify-center">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 items-center gap-16">
            <div className="text-center md:text-left">
              <p className="text-7xl md:text-8xl font-bold tracking-tighter">404-error</p>
              <p className="text-3xl md:text-4xl font-semibold tracking-tight mt-2">PAGE NOT FOUND</p>
              <p className="mt-6 text-lg text-white/70">
                Your search has ventured beyond the known universe.
              </p>
              <Button asChild variant="outline" className="mt-8 bg-transparent border-primary/50 text-white hover:bg-primary/10 hover:text-white">
                <Link href="/dashboard">Back To Home</Link>
              </Button>
            </div>
            <div className="relative h-64 md:h-auto">
               <AstronautIllustration />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
