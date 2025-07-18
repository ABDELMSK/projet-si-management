"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { authService, User } from "./api"

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  isLoading: boolean
  hasPermission: (permission: string) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isHydrated, setIsHydrated] = useState(false)

  // Handle client-side hydration
  useEffect(() => {
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    // Only run after hydration to prevent SSR mismatch
    if (!isHydrated) return

    checkAuthStatus()
  }, [isHydrated])

  const checkAuthStatus = async () => {
    try {
      // Vérifier s'il y a un token stocké
      if (!authService.isAuthenticated()) {
        setIsLoading(false)
        return
      }

      // Vérifier le token avec le serveur
      const response = await authService.getCurrentUser()
      if (response.success) {
        setUser(response.user)
      } else {
        // Token invalide, nettoyer le localStorage
        authService.logout()
      }
    } catch (error) {
      console.error('Erreur de vérification d\'authentification:', error)
      authService.logout()
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const response = await authService.login(email, password)
      if (response.success) {
        setUser(response.user)
        return { success: true }
      } else {
        return { success: false, error: response.message }
      }
    } catch (error) {
      console.error('Erreur de connexion:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur de connexion' 
      }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    authService.logout()
    setUser(null)
  }

  // Fonction pour vérifier les permissions
  const hasPermission = (permission: string): boolean => {
    if (!user) return false
    
    // L'administrateur fonctionnel a tous les droits
    if (user.role_nom === "Administrateur fonctionnel") return true
    
    // Parser les permissions JSON
    try {
      const permissions = user.permissions ? JSON.parse(user.permissions) : {}
      return permissions[permission] === true
    } catch {
      return false
    }
  }

  // Prevent flash of unauthenticated content
  if (!isHydrated) {
    return (
      <AuthContext.Provider value={{ user: null, login, logout, isLoading: true, hasPermission: () => false }}>
        {children}
      </AuthContext.Provider>
    )
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, hasPermission }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

// Hook pour vérifier les permissions avec des noms plus clairs
export function usePermissions() {
  const { user, hasPermission } = useAuth()

  return {
    // Permissions basées sur les rôles
    isAdmin: user?.role_nom === "Administrateur fonctionnel",
    isPMO: user?.role_nom === "PMO / Directeur de projets",
    isChefProjet: user?.role_nom === "Chef de Projet",
    
    // Permissions spécifiques
    canManageUsers: user?.role_nom === "Administrateur fonctionnel",
    canCreateProject: user?.role_nom === "PMO / Directeur de projets" || user?.role_nom === "Administrateur fonctionnel",
    canViewAllProjects: user?.role_nom === "PMO / Directeur de projets" || user?.role_nom === "Administrateur fonctionnel",
    canGenerateReports: user?.role_nom === "PMO / Directeur de projets" || user?.role_nom === "Administrateur fonctionnel",
    
    // Fonction pour vérifier les permissions de projet
    canModifyProject: (projectChef?: string) => {
      if (user?.role_nom === "Administrateur fonctionnel") return true
      if (user?.role_nom === "PMO / Directeur de projets") return true
      if (user?.role_nom === "Chef de Projet" && projectChef === user.nom) return true
      return false
    },
    
    // Informations utilisateur
    userRole: user?.role_nom,
    userName: user?.nom,
    userEmail: user?.email,
  }
}