'use client'
import React, { createContext, useContext, useState, useEffect } from 'react'
import { createClient } from './client'

type AuthUser = {
  id: string
  email?: string
  [key: string]: any
}

type AuthContextState = {
  user: AuthUser | null
  session: any | null
  loading: boolean
  cloudToken: string | null
  signIn: (email: string, password: string) => Promise<{ error?: Error }>
  signOut: () => Promise<void>
  signUp: (email: string, password: string) => Promise<{ error?: Error }>
}

const AuthContext = createContext<AuthContextState>({
  user: null,
  session: null,
  loading: true,
  cloudToken: null,
  signIn: async () => ({}),
  signOut: async () => {},
  signUp: async () => ({}),
})

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [session, setSession] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [cloudToken, setCloudToken] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()

    // Load cloudToken from sessionStorage on initialization
    try {
      const storedToken = sessionStorage.getItem('cloudToken')
      if (storedToken) {
        setCloudToken(storedToken)
      }
    } catch (error) {
      console.warn('Failed to load cloudToken from sessionStorage:', error)
    }

    // Check if we're in development mode
    const isDevMode = process.env.NEXT_PUBLIC_DEV_MODE === 'true'

    if (isDevMode) {
      // Development mode - skip authentication
      console.log('🔧 Development mode: Skipping Supabase authentication')
      setUser({
        id: 'dev-user',
        email: 'dev@example.com',
        user_metadata: { name: 'Development User' }
      })
      setSession({ user: { id: 'dev-user', email: 'dev@example.com' } })
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ?? null)
      setUser(data.session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s ?? null)
      setUser(s?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string): Promise<{ error?: Error }> => {
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return error ? { error: new Error(error.message) } : {}
  }

  const signUp = async (email: string, password: string): Promise<{ error?: Error }> => {
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({ email, password })
    return error ? { error: new Error(error.message) } : {}
  }

  const signOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, cloudToken, signIn, signOut, signUp }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useSupabaseAuth = () => useContext(AuthContext)
export const useAuth = () => useSupabaseAuth()
export const useSupabase = () => useSupabaseAuth()

export default useSupabaseAuth
