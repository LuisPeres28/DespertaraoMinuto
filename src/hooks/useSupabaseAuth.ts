import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { AuthService } from '../services/authService'

export interface User {
  id: string
  username: string
  email: string
  userType: 'client' | 'therapist' | 'admin'
  fullName: string
}

export function useSupabaseAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('desperto_user')
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser)
        setUser(userData)
        // Set user context for RLS
        if (supabase) {
          supabase.rpc('set_current_user', { user_id_input: userData.id }).catch((error) => {
            console.error('Error setting user context:', error)
          })
        }
      } catch (error) {
        console.error('Error parsing saved user:', error)
        localStorage.removeItem('desperto_user')
      }
    }
    setLoading(false)
  }, [])

  const signIn = async (username: string, password: string) => {
    try {
      setLoading(true)
      
      console.log('🔐 Tentativa de login:', { username, password })
      
      // Use the new AuthService
      const result = await AuthService.login(username, password)
      console.log('📡 Resposta do servidor:', result)

      if (result.success) {
        const userData = result.user
        console.log('✅ Login bem-sucedido:', userData)
        setUser(userData)
        localStorage.setItem('desperto_user', JSON.stringify(userData))

        // Set user context for RLS
        if (supabase) {
          await supabase.rpc('set_current_user', { user_id_input: userData.id }).catch((error) => {
            console.error('Error setting user context:', error)
          })
        }

        return { success: true, user: userData }
      } else if (result.requiresTwoFactor) {
        console.log('🔐 2FA requerido')
        return { success: false, error: result.error, requiresTwoFactor: true }
      } else if (result.isLocked) {
        console.log('🔒 Conta bloqueada')
        return { success: false, error: result.error, isLocked: true, lockoutUntil: result.lockoutUntil }
      } else {
        console.log('❌ Login falhado:', result.error)
        return { success: false, error: result.error || 'Login failed' }
      }
    } catch (error: any) {
      console.error('Login error:', error)
      console.log('🚨 Erro de rede ou servidor:', error.message)
      return { success: false, error: error.message || 'Network error' }
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (username: string, email: string, password: string, fullName: string) => {
    try {
      setLoading(true)
      
      // Call the auth edge function
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          action: 'register',
          username,
          email,
          password,
          fullName,
          userType: 'client'
        })
      })

      const result = await response.json()

      if (result.success) {
        const userData = result.user
        setUser(userData)
        localStorage.setItem('desperto_user', JSON.stringify(userData))

        // Set user context for RLS
        if (supabase) {
          await supabase.rpc('set_current_user', { user_id_input: userData.id }).catch((error) => {
            console.error('Error setting user context:', error)
          })
        }

        return { success: true, user: userData }
      } else {
        return { success: false, error: result.error || 'Registration failed' }
      }
    } catch (error: any) {
      console.error('Registration error:', error)
      return { success: false, error: error.message || 'Network error' }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setUser(null)
    localStorage.removeItem('desperto_user')
  }

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    isAuthenticated: !!user
  }
}