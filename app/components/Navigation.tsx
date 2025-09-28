'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from './AuthProvider';

export default function Navigation() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  const navItems = [
    { href: '/', label: 'Dashboard' },
    { href: '/import', label: 'Import' },
    { href: '/chronicle', label: 'View Chronicle' },
  ];

  return (
    <nav className="bg-[#04090F] border-b border-[#6E6E6E]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-[#F8F8F8] to-[#6E6E6E] rounded-lg flex items-center justify-center">
                <span className="text-[#04090F] font-bold text-lg">C</span>
              </div>
              <span className="text-xl font-bold text-[#F8F8F8]">ContactChronicle</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    pathname === item.href
                      ? 'bg-[#6E6E6E]/20 text-[#F8F8F8]'
                      : 'text-[#F8F8F8]/70 hover:text-[#F8F8F8] hover:bg-[#6E6E6E]/10'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              
              {user ? (
                <div className="flex items-center space-x-4 ml-8">
                  <span className="text-sm text-[#F8F8F8]/70">
                    {user.email}
                  </span>
                  <button
                    onClick={() => {
                      signOut().then(() => {
                        // Force page reload to clear any cached state
                        window.location.href = '/auth';
                      });
                    }}
                    className="text-sm text-[#F8F8F8]/70 hover:text-[#F8F8F8] transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <Link
                  href="/auth"
                  className="ml-8 text-sm font-medium text-[#F8F8F8]/70 hover:text-[#F8F8F8] transition-colors"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              type="button"
              className="text-[#F8F8F8]/70 hover:text-[#F8F8F8] focus:outline-none focus:ring-2 focus:ring-[#6E6E6E] focus:ring-offset-2 focus:ring-offset-[#04090F]"
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className="block h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="md:hidden" id="mobile-menu">
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-[#04090F] border-t border-[#6E6E6E]/20">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                pathname === item.href
                  ? 'bg-[#6E6E6E]/20 text-[#F8F8F8]'
                  : 'text-[#F8F8F8]/70 hover:text-[#F8F8F8] hover:bg-[#6E6E6E]/10'
              }`}
            >
              {item.label}
            </Link>
          ))}
          
          {user ? (
            <div className="px-3 py-2 border-t border-[#6E6E6E]/20 mt-2">
              <div className="text-sm text-[#F8F8F8]/70 mb-2">
                {user.email}
              </div>
              <button
                onClick={() => {
                  signOut().then(() => {
                    // Force page reload to clear any cached state
                    window.location.href = '/auth';
                  });
                }}
                className="text-sm text-[#F8F8F8]/70 hover:text-[#F8F8F8] transition-colors"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <Link
              href="/auth"
              className="block px-3 py-2 rounded-md text-base font-medium text-[#F8F8F8]/70 hover:text-[#F8F8F8] hover:bg-[#6E6E6E]/10 transition-colors duration-200"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
