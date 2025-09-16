"use client";

import { ReactNode, useState, useEffect } from "react";
import clsx from "clsx";
import Image from "next/image";
import Sidebar from "./Sidebar";

type MobileShellProps = {
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  currentCharacterId?: string;
  showComposeButton?: boolean;
  showSearchButton?: boolean;
  showInfoButton?: boolean;
  onInfoClick?: () => void;
  useWhiteHandle?: boolean;
  hideHandle?: boolean;
};

export default function MobileShell({ children, className, title = "Tagalong", subtitle, currentCharacterId, showComposeButton = false, showSearchButton = false, showInfoButton = false, onInfoClick, useWhiteHandle = false, hideHandle = false }: MobileShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Reset sidebar state on hot reload to prevent animation errors
  useEffect(() => {
    setMounted(true);
    setSidebarOpen(false);
  }, []);

  return (
    <div className="min-h-screen w-full bg-[radial-gradient(1200px_600px_at_70%_-20%,rgba(59,130,246,0.15),transparent_60%),radial-gradient(1000px_500px_at_10%_10%,rgba(236,72,153,0.12),transparent_60%),#f8fafc] text-gray-900">
      <div className="mx-auto flex min-h-screen w-full max-w-[1200px] items-center justify-center p-4 sm:p-8">
        <div
          className={clsx(
            "relative w-[393px] h-[840px] overflow-hidden rounded-[40px] border border-gray-200 bg-white/95 shadow-[0_10px_50px_rgba(0,0,0,0.15)] backdrop-blur-xl",
            className
          )}
        >
          {/* Top gradient sheen */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.5),transparent)]" />

          {/* App content scroll area */}
          <div className="absolute inset-0 flex flex-col">
            {/* Toolbar */}
            <div className="pb-3 relative z-40">
              <Image
                src="/toolbar.png"
                alt="Toolbar"
                width={393}
                height={40}
                className="w-full h-auto"
              />
            </div>

            {/* Sticky App Bar */}
            <div className="sticky top-0 z-0 bg-white/95 backdrop-blur-sm px-5 py-3">
              <div className="relative flex items-center justify-center">
                {/* Left side - Sidebar toggle */}
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="absolute left-0 p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  aria-label="Toggle sidebar"
                >
                  <Image
                    src="/menu.svg"
                    alt="Menu"
                    width={20}
                    height={20}
                    className="text-gray-600"
                  />
                </button>

                {/* Center-aligned title */}
                <div className="text-center">
                  <h1 className={`${subtitle ? 'text-sm' : 'text-base'} font-semibold text-gray-900 tracking-tight`}>{title}</h1>
                  {subtitle && (
                    <div className="text-xs text-gray-500" style={{ marginTop: '1px' }}>{subtitle}</div>
                  )}
                </div>

                {/* Right side - Action buttons */}
                {(showComposeButton || showSearchButton || showInfoButton) && (
                  <div className="absolute right-0 flex items-center">
                    {showSearchButton && (
                      <button
                        className="p-2 -mr-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                        aria-label="Search"
                      >
                        <Image
                          src="/search.svg"
                          alt="Search"
                          width={20}
                          height={20}
                          className="text-gray-600"
                        />
                      </button>
                    )}
                    {showComposeButton && (
                      <button
                        className="p-2 -mr-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                        aria-label="Compose"
                      >
                        <Image
                          src="/composeB.svg"
                          alt="Compose"
                          width={20}
                          height={20}
                          className="text-gray-600"
                        />
                      </button>
                    )}
                    {showInfoButton && (
                      <button
                        onClick={onInfoClick}
                        className="p-2 -mr-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                        aria-label="Info"
                      >
                        <Image
                          src="/info.svg"
                          alt="Info"
                          width={20}
                          height={20}
                        />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            <Sidebar 
              isOpen={sidebarOpen} 
              onClose={() => setSidebarOpen(false)} 
              mounted={mounted} 
              currentCharacterId={currentCharacterId}
            />

            {/* Scrollable content */}
            <div className="relative flex-1 overflow-y-auto px-5 pb-4">
              {children}
            </div>

           {!hideHandle && (
             <div>
                <Image
                  src={useWhiteHandle ? "/handle-white.png" : "/handle.png"}
                  alt="Handle"
                  width={393}
                  height={34}
                  className="w-full h-auto"
                />
              </div>
           )}
          </div>
        </div>
      </div>
    </div>
  );
}


