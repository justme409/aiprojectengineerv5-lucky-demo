"use client"

import Link from 'next/link'

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white text-slate-900 border-slate-200 backdrop-blur">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold sm:inline-block">
              AI Project Engineer
            </span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2 sm:space-x-4">
          <nav className="flex items-center space-x-1 sm:space-x-2">
            <Link href="/auth/login">
              <button className="px-3 py-1 text-sm rounded hover:underline text-slate-600 hover:text-slate-900">
                Sign In
              </button>
            </Link>
            <Link href="/auth/signup">
              <button className="px-3 py-1 text-sm rounded border border-slate-300 hover:bg-slate-50 text-slate-700">
                Sign Up
              </button>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}