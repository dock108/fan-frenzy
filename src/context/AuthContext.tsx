'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode, useMemo, PropsWithChildren } from 'react'
import { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/utils/supabase' // Assuming supabase client is exported from here
import toast from 'react-hot-toast'

interface AuthContextType {
  session: Session | null
  user: User | null
  loading: boolean
  signIn: (credentials: Credentials) => Promise<AuthResponse>
  signUp: (credentials: Credentials) => Promise<AuthResponse>
  signOut: () => Promise<void>
  error: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) throw error
        setSession(session)
        setUser(session?.user ?? null)
      } catch (error: any) {
        console.error("Error fetching session:", error.message)
        toast.error('Failed to fetch session')
      } finally {
        setLoading(false)
      }
    }

    fetchSession()

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => {
      authListener?.subscription.unsubscribe()
    }
  }, [])

  const value = useMemo(() => ({
    user,
    session,
    loading,
    error,
    signIn: async (credentials: Credentials) => {
      setError(null)
      try {
        const response = await supabase.auth.signInWithPassword(credentials)
        if (response.error) throw response.error
        return response
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Sign in failed'
        setError(message)
        throw err
      }
    },
    signUp: async (credentials: Credentials) => {
      setError(null)
      try {
        const response = await supabase.auth.signUp(credentials)
        if (response.error) throw response.error
        return response
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Sign up failed'
        setError(message)
        throw err
      }
    },
    signOut: async () => {
      setError(null)
      try {
        await supabase.auth.signOut()
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Sign out failed'
        setError(message)
        console.error('Sign out error:', err)
      }
    },
  }), [user, session, loading, error])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 