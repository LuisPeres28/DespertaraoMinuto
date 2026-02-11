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
    const initializeAuth = async () => {
      try {
        const savedUser = localStorage.getItem('desperto_user')
        if (savedUser) {
          const userData = JSON.parse(savedUser)
          setUser(userData)

          if (supabase) {
            supabase.rpc('set_current_user', { user_id_input: userData.id }).catch(
              (error) => console.error('Error setting user context:', error)
            )
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
        localStorage.removeItem('desperto_user')
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()
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
          try {
            await supabase.rpc('set_current_user', { user_id_input: userData.id })
          } catch (error) {
            console.error('Error setting user context:', error)
          }
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

  const signUp = async (email: string, password: string, fullName: string, phone?: string) => {
    try {
      setLoading(true)

      console.log('📝 Tentativa de registo:', { email, fullName })

      // Use AuthService to register user
      const result = await AuthService.signUp(email, password, fullName, phone)
      console.log('📡 Resposta do servidor:', result)

      if (result.success) {
        const userData = result.user
        console.log('✅ Registo bem-sucedido:', userData)
        setUser(userData)
        localStorage.setItem('desperto_user', JSON.stringify(userData))

        // Set user context for RLS
        if (supabase) {
          try {
            await supabase.rpc('set_current_user', { user_id_input: userData.id })
          } catch (error) {
            console.error('Error setting user context:', error)
          }
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