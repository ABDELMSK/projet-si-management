// hooks/useProjects.ts
import { useState, useEffect, useCallback } from 'react'
import { projectService, Project, ProjectStats } from '../lib/api'

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [stats, setStats] = useState<ProjectStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Utiliser useCallback pour éviter les re-renders inutiles
  const fetchProjects = useCallback(async (params?: { search?: string; status?: string }) => {
    try {
      setLoading(true)
      setError(null)
      console.log('🔄 Chargement des projets...', params)
      
      const response = await projectService.getAllProjects(params)
      if (response.success) {
        console.log('✅ Projets chargés:', response.data.length)
        setProjects(response.data)
      } else {
        console.error('❌ Erreur chargement projets:', response.message)
        setError(response.message)
      }
    } catch (err) {
      console.error('❌ Erreur réseau projets:', err)
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des projets')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchStats = useCallback(async () => {
    try {
      console.log('🔄 Chargement des statistiques...')
      const response = await projectService.getProjectStats()
      if (response.success) {
        console.log('✅ Statistiques chargées:', response.data)
        setStats(response.data)
      }
    } catch (err) {
      console.error('❌ Erreur chargement stats:', err)
    }
  }, [])

  const createProject = async (projectData: any) => {
    try {
      console.log('🔄 Création de projet...', projectData)
      const response = await projectService.createProject(projectData)
      
      if (response.success) {
        console.log('✅ Projet créé avec succès, rechargement...')
        
        // Recharger immédiatement les données
        await Promise.all([
          fetchProjects(), // Recharger la liste
          fetchStats()     // Recharger les stats
        ])
        
        console.log('✅ Données rechargées après création')
        return { success: true }
      } else {
        console.error('❌ Erreur création projet:', response.message)
        return { success: false, error: response.message }
      }
    } catch (err) {
      console.error('❌ Erreur réseau création:', err)
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Erreur lors de la création' 
      }
    }
  }

  const updateProject = async (id: number, projectData: any) => {
    try {
      console.log('🔄 Mise à jour projet...', id, projectData)
      const response = await projectService.updateProject(id, projectData)
      
      if (response.success) {
        console.log('✅ Projet mis à jour, rechargement...')
        await Promise.all([
          fetchProjects(),
          fetchStats()
        ])
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

  const deleteProject = async (id: number) => {
    try {
      console.log('🔄 Suppression projet...', id)
      const response = await projectService.deleteProject(id)
      
      if (response.success) {
        console.log('✅ Projet supprimé, rechargement...')
        await Promise.all([
          fetchProjects(),
          fetchStats()
        ])
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

  const getProjectById = async (id: number) => {
    try {
      const response = await projectService.getProjectById(id)
      if (response.success) {
        return { success: true, data: response.data }
      } else {
        return { success: false, error: response.message }
      }
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Erreur lors de la récupération' 
      }
    }
  }

  // Fonction pour forcer le rechargement
  const refreshData = useCallback(async () => {
    console.log('🔄 Rechargement forcé des données...')
    await Promise.all([
      fetchProjects(),
      fetchStats()
    ])
  }, [fetchProjects, fetchStats])

  useEffect(() => {
    console.log('🔄 Chargement initial des données...')
    fetchProjects()
    fetchStats()
  }, [fetchProjects, fetchStats])

  return {
    projects,
    stats,
    loading,
    error,
    fetchProjects,
    fetchStats,
    createProject,
    updateProject,
    deleteProject,
    getProjectById,
    refreshData, // Nouvelle fonction pour forcer le rechargement
  }
}