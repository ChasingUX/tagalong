"use client";

import { useTransition, useSpring, animated } from "@react-spring/web";
import Image from "next/image";
import Link from "next/link";
import { CHARACTERS, getCharacterImageUrl } from "@/lib/characters";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  mounted: boolean;
  currentCharacterId?: string; // ID of currently viewed character
}

export default function Sidebar({ isOpen, onClose, mounted, currentCharacterId }: SidebarProps) {
  // Backdrop fade animation
  const backdropTransition = useTransition(mounted && isOpen, {
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
    config: { tension: 300, friction: 30 }
  });

  // Sidebar slide animation
  const sidebarSpring = useSpring({
    transform: mounted && isOpen ? 'translateX(0%)' : 'translateX(-100%)',
    config: { tension: 300, friction: 30 },
    immediate: !mounted // Skip animation on initial mount
  });

  return (
    <>
      {/* Animated Sidebar */}
      {mounted && backdropTransition((style, item) =>
        item ? (
          <>
            {/* Animated Backdrop */}
            <animated.div
              key="sidebar-backdrop"
              style={style}
              className="absolute inset-0 bg-black/20 z-[60]"
              onClick={onClose}
            />
            
            {/* Animated Sidebar Panel */}
            <animated.div
              key="sidebar-panel"
              style={sidebarSpring}
              className="absolute left-0 top-0 bottom-0 w-[70%] bg-white border-r border-gray-200 z-[70] flex flex-col"
            >
              {/* Conversations List */}
              <div className="flex-1 overflow-y-auto p-4 pt-20">
                <div className="space-y-0.5">
                  {/* Home Navigation */}
                  <Link
                    href="/"
                    onClick={onClose}
                    className="flex items-center gap-3 py-1 hover:bg-gray-100 cursor-pointer transition-colors rounded-lg px-2"
                  >
                    <div className="w-7 h-[32px] rounded-md overflow-hidden flex-shrink-0 flex items-center justify-center">
                      <Image
                        src="/star.svg"
                        alt="Find a Tagalong"
                        width={20}
                        height={20}
                        className="flex-shrink-0"
                      />
                    </div>
                    <div className="font-medium text-sm text-gray-900">Find a Tagalong</div>
                  </Link>
                  
                  <div className="mb-5"></div>
                  
                  {CHARACTERS.map((character) => {
                    const isActive = currentCharacterId === character.id;
                    return (
                      <Link
                        key={character.id}
                        href={`/character/${character.id}`}
                        onClick={onClose}
                        className={`flex items-center gap-3 py-2 cursor-pointer transition-colors rounded-lg px-2 ${
                          isActive 
                            ? 'bg-gray-100' 
                            : 'hover:bg-gray-100'
                        }`}
                      >
                      <div className="w-7 h-[32px] rounded-md overflow-hidden flex-shrink-0">
                        <Image
                          src={getCharacterImageUrl(character)}
                          alt={character.name}
                          width={20}
                          height={32}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-gray-900">
                          {character.name}
                        </div>
                        <div className="text-xs text-gray-600 capitalize">
                          {character.role}
                        </div>
                      </div>
                    </Link>
                    );
                  })}
                </div>
              </div>

            </animated.div>
          </>
        ) : null
      )}
    </>
  );
}
