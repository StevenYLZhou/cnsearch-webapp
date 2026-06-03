'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/',        label: 'Home' },
  { href: '/cases',   label: 'Cases' },
  { href: '/compare', label: 'Phase Comparison' },
  { href: '/about',   label: 'About' },
]

export default function Nav() {
  const pathname = usePathname()
  const isAdmin = pathname.startsWith('/admin')

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="font-bold text-gray-900 text-sm leading-tight">
            US–China Tariff<br />Dispute Database
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {!isAdmin && links.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`text-sm font-medium transition-colors ${
                  pathname === href
                    ? 'text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {label}
              </Link>
            ))}
            {isAdmin && (
              <>
                <Link href="/admin" className="text-sm font-medium text-gray-600 hover:text-gray-900">Dashboard</Link>
                <Link href="/admin/cases" className="text-sm font-medium text-gray-600 hover:text-gray-900">Cases</Link>
                <Link href="/admin/update-log" className="text-sm font-medium text-gray-600 hover:text-gray-900">Update Log</Link>
                <Link href="/" className="text-sm font-medium text-blue-600 hover:text-blue-700">← Public Site</Link>
              </>
            )}
          </nav>

          {!isAdmin && (
            <Link
              href="/admin"
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              Admin
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
