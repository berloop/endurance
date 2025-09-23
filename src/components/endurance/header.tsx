'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'

const Header = () => {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    { href: '/', label: 'Wormhole' },
    { href: '/blackhole', label: 'Black Hole' },
    { href: '/research', label: 'Paper' },
    { href: '/docs', label: 'Docs' }
  ]

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="relative z-50 p-6"
    >
      <div className="flex items-center justify-between">
        {/* Logo/Brand */}
        <Link href="/" className="flex items-center">
          <h1 className="text-xl md:text-2xl font-light text-white hover:text-gray-300 transition-colors">
            Project Lazarus <span className="text-xs md:text-sm text-neutral-400">by Egret</span>
          </h1>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm transition-colors relative group ${
                pathname === item.href
                  ? 'text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {item.label}
              {pathname === item.href && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute -bottom-1 left-0 right-0 h-0.5 bg-white"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </Link>
          ))}
        </nav>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-white p-2"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <motion.nav
  initial={{ opacity: 0, y: -10 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -10 }}
  className="md:hidden mt-6 pb-4 border-t border-neutral-800 bg-black rounded-xs"
>
  <div className="flex flex-col space-y-4 pt-4 px-4">
    {navItems.map((item) => (
      <Link
        key={item.href}
        href={item.href}
        onClick={() => setMobileMenuOpen(false)}
        className={`text-sm transition-colors ${
          pathname === item.href
            ? 'text-white font-medium'
            : 'text-neutral-400 hover:text-white'
        }`}
      >
        {item.label}
      </Link>
    ))}
  </div>
</motion.nav>
      )}

     
    </motion.header>
  )
}

export default Header