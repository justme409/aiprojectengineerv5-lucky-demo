'use client'

import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from 'react'
import { useSession } from 'next-auth/react'

interface FeatureFlags {
  quality_module: boolean
  enable_primary_testing: boolean
  enable_qrs_requirements: boolean
  enable_indicative_conformance: boolean
  enable_annexL_sampling: boolean
  roles_required: string[]
  ncr_dual_mode: boolean
  [key: string]: any
}

interface FeatureFlagContextType {
  flags: FeatureFlags
  loading: boolean
  refreshFlags: () => Promise<void>
}

const FeatureFlagContext = createContext<FeatureFlagContextType | undefined>(undefined)

export function FeatureFlagProvider({ children }: { children: ReactNode }) {
  const [flags, setFlags] = useState<FeatureFlags>({
    quality_module: false,
    enable_primary_testing: false,
    enable_qrs_requirements: false,
    enable_indicative_conformance: false,
    enable_annexL_sampling: false,
    roles_required: [],
    ncr_dual_mode: false
  })
  const [loading, setLoading] = useState(true)
  const { data: session } = useSession()

  const refreshFlags = useCallback(async () => {
    if (!session?.user) {
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/v1/projects')
      if (response.ok) {
        const data = await response.json()
        const userProjects = data.projects

        if (userProjects.length > 0) {
          const projectId = userProjects[0].id
          const flagResponse = await fetch(`/api/v1/projects/${projectId}/compliance/config`)

          if (flagResponse.ok) {
            const flagData = await flagResponse.json()
            setFlags(prev => flagData.flags || prev)
          }
        }
      }
    } catch (error) {
      console.error('Error loading feature flags:', error)
    } finally {
      setLoading(false)
    }
  }, [session?.user])

  useEffect(() => {
    refreshFlags()
  }, [refreshFlags])

  return (
    <FeatureFlagContext.Provider value={{ flags, loading, refreshFlags }}>
      {children}
    </FeatureFlagContext.Provider>
  )
}

export function useFeatureFlags() {
  const context = useContext(FeatureFlagContext)
  if (context === undefined) {
    throw new Error('useFeatureFlags must be used within a FeatureFlagProvider')
  }
  return context
}

export function useFeatureFlag(flagName: keyof FeatureFlags): boolean {
  const { flags } = useFeatureFlags()
  return flags[flagName] as boolean
}

export function FeatureGate({
  flag,
  children,
  fallback = null
}: {
  flag: keyof FeatureFlags
  children: ReactNode
  fallback?: ReactNode
}) {
  const enabled = useFeatureFlag(flag)

  if (!enabled) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

