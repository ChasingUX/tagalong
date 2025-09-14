"use client";

import React from 'react';
import Image from 'next/image';

interface ComposerProps {
  value?: string;
  onChange?: (value: string) => void;
  onSubmit?: (e: React.FormEvent) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export const Composer: React.FC<ComposerProps> = ({
  value = "",
  onChange,
  onSubmit,
  placeholder = "Type a message...",
  disabled = false,
  className = ""
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit && !disabled) {
      onSubmit(e);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange && !disabled) {
      onChange(e.target.value);
    }
  };

  return (
    <div className={className}>
      <form onSubmit={handleSubmit}>
        <div className="flex items-center gap-2 bg-white border border-gray-200" style={{ height: '48px', padding: '12px 6px 12px 12px', borderRadius: '14px', boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)' }}>
          {/* Input field */}
          <div className="relative flex-1">
            <input
              value={value}
              onChange={handleInputChange}
              placeholder={placeholder}
              className="w-full bg-transparent text-[14px] text-gray-900 placeholder:text-gray-500 focus:outline-none"
              disabled={disabled}
            />
          </div>
          
          {/* Wave button */}
          <button 
            type={disabled ? "button" : "submit"} 
            className="flex-shrink-0 rounded-lg transition-all duration-150 hover:bg-gray-100 hover:shadow-inner" 
            style={{ width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            disabled={disabled}
          >
            <Image
              src="/wave.svg"
              alt="Send"
              width={22}
              height={22}
              className="text-gray-600"
            />
          </button>
        </div>
      </form>
    </div>
  );
};

export default Composer;
