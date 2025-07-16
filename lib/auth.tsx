"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"

export interface User {
  id: string
  nom: string
  email: string
  role: "Chef de Projet" | "PMO / Directeur de projets" | "Administrateur fonctionnel"
  direction: string
  avatar?: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Utilisateurs de démonstration
const DEMO_USERS: (User & { password: string })[] = [
  {
    id: "1",
    nom: "Marie Dubois",
    email: "marie.dubois@entreprise.fr",
    password: "password123",
    role: "Chef de Projet",
    direction: "DSI",
  },
  {
    id: "2",
    nom: "Thomas Durand",
    email: "thomas.durand@entreprise.fr",
    password: "password123",
    role: "PMO / Directeur de projets",
    direction: "DSI",
  },
  {
    id: "3",
    nom: "Admin System",
    email: "admin@entreprise.fr",
    password: "admin123",
    role: "Administrateur fonctionnel",
    direction: "DSI",
  },
]

// Helper function to safely access localStorage
const getStorageItem = (key: string): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem(key)
  }
  return null
}

const setStorageItem = (key: string, value: string): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem(key, value)
  }
}

const removeStorageItem = (key: string): void => {
  if (typeof window !== "undefined") {
    localStorage.removeItem(key)
  }
}

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

    // Vérifier s'il y a une session existante
    const savedUser = getStorageItem("auth_user")
    const sessionExpiry = getStorageItem("auth_expiry")

    if (savedUser && sessionExpiry) {
      const now = new Date().getTime()
      const expiry = Number.parseInt(sessionExpiry, 10)

      if (now < expiry) {
        try {
          const parsedUser = JSON.parse(savedUser) as User
          setUser(parsedUser)
        } catch (error) {
          console.error("Error parsing saved user:", error)
          removeStorageItem("auth_user")
          removeStorageItem("auth_expiry")
        }
      } else {
        // Session expirée
        removeStorageItem("auth_user")
        removeStorageItem("auth_expiry")
      }
    }

    setIsLoading(false)
  }, [isHydrated])

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true)

    try {
      // Simulation d'un délai d'authentification
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const foundUser = DEMO_USERS.find((u) => u.email === email && u.password === password)

      if (foundUser) {
        const { password: _, ...userWithoutPassword } = foundUser
        setUser(userWithoutPassword)

        // Sauvegarder la session (expire dans 8 heures)
        const expiryTime = new Date().getTime() + 8 * 60 * 60 * 1000
        setStorageItem("auth_user", JSON.stringify(userWithoutPassword))
        setStorageItem("auth_expiry", expiryTime.toString())

        return { success: true }
      } else {
        return { success: false, error: "Email ou mot de passe incorrect" }
      }
    } catch (error) {
      console.error("Login error:", error)
      return { success: false, error: "Une erreur s'est produite lors de la connexion" }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    removeStorageItem("auth_user")
    removeStorageItem("auth_expiry")
  }

  // Prevent flash of unauthenticated content
  if (!isHydrated) {
    return (
      <AuthContext.Provider value={{ user: null, login, logout, isLoading: true }}>
        {children}
      </AuthContext.Provider>
    )
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
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

// Hook pour vérifier les permissions
export function usePermissions() {
  const { user } = useAuth()

  return {
    canCreateProject: user?.role === "PMO / Directeur de projets" || user?.role === "Administrateur fonctionnel",
    canManageUsers: user?.role === "Administrateur fonctionnel",
    canViewAllProjects: user?.role === "PMO / Directeur de projets" || user?.role === "Administrateur fonctionnel",
    canModifyProject: (projectChef?: string) => {
      if (user?.role === "Administrateur fonctionnel") return true
      if (user?.role === "PMO / Directeur de projets") return true
      if (user?.role === "Chef de Projet" && projectChef === user.nom) return true
      return false
    },
    canGenerateReports: user?.role === "PMO / Directeur de projets" || user?.role === "Administrateur fonctionnel",
  }
}