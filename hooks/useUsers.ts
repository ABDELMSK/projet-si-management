// hooks/useUsers.ts
import { useState, useEffect } from 'react'
import { userService, User } from '../lib/api'

export function useUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUsers = async (searchTerm?: string) => {
    try {
      setLoading(true)
      setError(null)
      const response = await userService.getAllUsers(searchTerm)
      if (response.success) {
        setUsers(response.data)
      } else {
        setError(response.message)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  const createUser = async (userData: any) => {
    try {
      const response = await userService.createUser(userData)
      if (response.success) {
        await fetchUsers() // Recharger la liste
        return { success: true }
      } else {
        return { success: false, error: response.message }
      }
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Erreur lors de la création' 
      }
    }
  }

  const updateUser = async (id: number, userData: any) => {
    try {
      const response = await userService.updateUser(id, userData)
      if (response.success) {
        await fetchUsers() // Recharger la liste
        return { success: true }
      } else {
        return { success: false, error: response.message }
      }
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Erreur lors de la mise à jour' 
      }
    }
  }

  const deleteUser = async (id: number) => {
    try {
      const response = await userService.deleteUser(id)
      if (response.success) {
        await fetchUsers() // Recharger la liste
        return { success: true }
      } else {
        return { success: false, error: response.message }
      }
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Erreur lors de la suppression' 
      }
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  return {
    users,
    loading,
    error,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
  }
}