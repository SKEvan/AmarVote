'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function GlobalLoading() {
  const [isLoading, setIsLoading] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Set minimum loading time
    const minLoadTime = 1000; // 1 second minimum
    const startTime = Date.now();

    const hideLoading = () => {
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, minLoadTime - elapsedTime);
      
      setTimeout(() => {
        setIsFadingOut(true);
        setTimeout(() => {
          setIsLoading(false);
        }, 500); // Wait for fade-out animation
      }, remainingTime);
    };

    // Check if document is already loaded
    if (document.readyState === 'complete') {
      hideLoading();
    } else {
      window.addEventListener('load', hideLoading);
      // Fallback timeout in case load event doesn't fire
      const fallbackTimeout = setTimeout(hideLoading, 3000);
      
      return () => {
        window.removeEventListener('load', hideLoading);
        clearTimeout(fallbackTimeout);
      };
    }
  }, []);

  if (!mounted || !isLoading) return null;

  return (
    <div 
      className={`fixed inset-0 z-[9999] bg-gradient-to-br from-[#0a0e1a] via-[#0d111f] to-[#111827] flex items-center justify-center transition-opacity duration-500 ${
        isFadingOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="text-center">
        {/* Logo with pulse animation */}
        <div className="mb-8 animate-pulse-slow">
          <div className="w-24 h-24 mx-auto mb-6 relative">
            <div className="absolute inset-0 bg-emerald-500/20 rounded-2xl blur-xl animate-pulse"></div>
            <Image
              src="/images/logo-AmarVote.png"
              alt="AmarVote"
              width={96}
              height={96}
              className="relative w-full h-full rounded-2xl shadow-2xl shadow-emerald-500/30 object-cover"
              priority
            />
          </div>
          
          {/* Brand Name */}
          <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2">
            Amar<span className="text-emerald-400">Vote</span>
          </h1>
          <p className="text-gray-400 text-sm">Secure Election Monitoring System</p>
        </div>

        {/* Loading Spinner */}
        <div className="flex items-center justify-center gap-2">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce-delay-0"></div>
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce-delay-1"></div>
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce-delay-2"></div>
        </div>
        
        <p className="text-gray-500 text-xs mt-4">Loading...</p>
      </div>
    </div>
  );
}
