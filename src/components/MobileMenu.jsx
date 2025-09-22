"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

const MobileMenu = ({ menuItems, pathname }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Close menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-[100] bg-neutral-900 text-yellow-500 p-3 rounded-full shadow-lg md:hidden"
        aria-label="Toggle mobile menu"
        type="button"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
      
      {/* Mobile Menu Overlay */}
      <div
        className={`
          fixed inset-0 z-[90] bg-black bg-opacity-80 backdrop-blur-sm transition-opacity duration-300 md:hidden
          ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}
        onClick={() => setIsOpen(false)}
      >
        <div
          className={`
            fixed bottom-20 right-6 z-[95] 
            bg-neutral-900 rounded-2xl shadow-xl border border-neutral-800
            p-4 w-64 max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-700
            transition-all duration-300 transform
            ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}
          `}
          onClick={(e) => e.stopPropagation()}
        >
          <ul className="space-y-1">
            {menuItems.map((item, index) => {
              const isActive = pathname === item.route;

              if (item.action) {
                return (
                  <li
                    key={index}
                    className="flex items-center p-3 rounded-xl cursor-pointer hover:bg-neutral-800 transition-colors"
                    onClick={() => {
                      item.action();
                      setIsOpen(false);
                    }}
                  >
                    <item.icon className={`w-5 h-5 mr-3 ${isActive ? 'text-yellow-500' : ''}`} strokeWidth={1.5} />
                    <span className={`${isActive ? 'text-yellow-500' : 'text-neutral-300'}`}>
                      {item.label}
                    </span>
                  </li>
                );
              }

              return (
                <Link key={index} href={item.route} onClick={() => setIsOpen(false)} className="block">
                  <li className="flex items-center p-3 rounded-xl cursor-pointer hover:bg-neutral-800 transition-colors">
                    <item.icon className={`w-5 h-5 mr-3 ${isActive ? 'text-yellow-500' : ''}`} strokeWidth={1.5} />
                    <span className={`${isActive ? 'text-yellow-500' : 'text-neutral-300'}`}>
                      {item.label}
                    </span>
                  </li>
                </Link>
              );
            })}
          </ul>
        </div>
      </div>
    </>
  );
};

export default MobileMenu;