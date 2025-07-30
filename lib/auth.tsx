// lib/auth.tsx
"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { authService } from './api'

interface User {
  id: number
  nom: string
  email: string
  role: string
  role_nom: string
  direction_id?: number
  direction_nom?: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  loading: boolean
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Fonction pour vérifier et charger l'utilisateur
  const loadUser = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      
      if (!token) {
        console.log('🔐 Aucun token trouvé')
        setUser(null)
        return
      }

      console.log('🔐 Token trouvé, vérification...')
      const response = await authService.me()
      
      // ✅ CORRECTION: L'API retourne response.user, pas response.data
      if (response.success && response.user) {
        console.log('✅ Utilisateur authentifié:', response.user.nom)
        setUser(response.user)
      } else {
        console.log('❌ Token invalide, suppression')
        localStorage.removeItem('token')
        setUser(null)
      }
    } catch (error: any) {
      console.error('❌ Erreur vérification auth:', error.message)
      
      // Si erreur 401, supprimer le token invalide
      if (error.message.includes('401') || error.message.includes('Token') || error.message.includes('Session expirée')) {
        console.log('🗑️ Suppression du token invalide')
        localStorage.removeItem('token')
      }
      
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  // Fonction de connexion
  const login = async (email: string, password: string) => {
    try {
      console.log('🔐 Tentative de connexion...', email)
      const response = await authService.login(email, password)
      
      // ✅ CORRECTION: L'API retourne response.user, pas response.data
      if (response.success && response.user) {
        console.log('✅ Connexion réussie:', response.user.nom)
        setUser(response.user)
        return { success: true }
      } else {
        console.error('❌ Échec de connexion:', response.message)
        return { success: false, error: response.message || 'Échec de la connexion' }
      }
    } catch (error: any) {
      console.error('❌ Erreur de connexion:', error.message)
      return { success: false, error: error.message || 'Erreur de connexion' }
    }
  }

  // Fonction de déconnexion
  const logout = () => {
  console.log('🔐 Déconnexion...')
  authService.logout()
  setUser(null)
  
  // ✅ Solution simple : recharger la page au lieu de rediriger
  if (typeof window !== 'undefined') {
    window.location.reload()
  }
}

  // Charger l'utilisateur au démarrage
  useEffect(() => {
    loadUser()
  }, [])

  // Intercepteur global pour les erreurs 401
  useEffect(() => {
    const handleUnauthorized = () => {
      console.log('🔐 Erreur 401 détectée - Déconnexion automatique')
      logout()
    }

    // Écouter les erreurs d'authentification
    window.addEventListener('auth-error', handleUnauthorized)
    
    return () => {
      window.removeEventListener('auth-error', handleUnauthorized)
    }
  }, [])

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Hook pour les permissions
export function usePermissions() {
  const { user } = useAuth()
  
  if (!user) {
    return {
      canCreateProject: false,
      canManageUsers: false,
      canViewAllProjects: false,
      canEditProject: () => false,
    }
  }

  const isAdmin = user.role_nom === 'Administrateur fonctionnel'
  const isPMO = user.role_nom === 'PMO / Directeur de projets'
  const isChefProjet = user.role_nom === 'Chef de Projet'

  return {
    canCreateProject: isAdmin || isPMO,
    canManageUsers: isAdmin,
    canViewAllProjects: isAdmin || isPMO,
    canEditProject: (projectChefId?: number) => {
      if (isAdmin || isPMO) return true
      if (isChefProjet && projectChefId === user.id) return true
      return false
    },
  }
}