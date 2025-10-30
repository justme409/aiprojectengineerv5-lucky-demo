"use client"

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { ModeToggle } from '@/components/mode-toggle'

export function PublicHeaderV2() {
  const { data: session, status } = useSession()
  const user = session?.user
  const isLoading = status === 'loading'

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 text-gray-900 border-gray-200 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold sm:inline-block">AI Project Engineer</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2 sm:space-x-4">
          {isLoading ? (
            <HeaderSkeleton showAuthButtons={!user} />
          ) : (
            <nav className="flex items-center space-x-1 sm:space-x-2">
              <ModeToggle />
              {user ? (
                <button className="px-3 py-1 text-sm rounded border border-input hover:bg-muted" onClick={() => signOut()}>Sign out</button>
              ) : (
                <>
                  <Link href="/auth/login" className="px-3 py-1 text-sm rounded hover:underline">Sign In</Link>
                  <Link href="/auth/signup" className="px-3 py-1 text-sm rounded border border-input hover:bg-muted">Sign Up</Link>
                </>
              )}
            </nav>
          )}
        </div>
      </div>
    </header>
  )
}

interface HeaderSkeletonProps {
  showAuthButtons?: boolean
}

function HeaderSkeleton({ showAuthButtons = false }: HeaderSkeletonProps) {
  return (
    <nav className="flex items-center space-x-1 sm:space-x-2">
      {/* Theme toggle skeleton */}
      <div className="h-8 w-8 rounded bg-muted animate-pulse" />
      {showAuthButtons ? (
        <>
          {/* Sign In button skeleton */}
          <div className="h-8 w-16 bg-muted rounded animate-pulse" />
          {/* Sign Up button skeleton */}
          <div className="h-8 w-18 bg-muted rounded animate-pulse" />
        </>
      ) : (
        /* Avatar skeleton for authenticated state */
        <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
      )}
    </nav>
  )
}


