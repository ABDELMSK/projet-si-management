// hooks/useProjects.ts
import { useState, useEffect, useCallback } from 'react'
import { projectService, Project, ProjectStats } from '../lib/api'

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [stats, setStats] = useState<ProjectStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fonction pour récupérer les projets avec useCallback pour éviter les re-renders
  const fetchProjects = useCallback(async (params?: { search?: string; status?: string }) => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('🔄 Frontend: Récupération des projets...', params)
      
      const response = await projectService.getAllProjects(params)
      
      if (response.success) {
        console.log(`✅ Frontend: ${response.data.length} projets récupérés`)
        console.log('📋 Projets:', response.data.map((p: Project) => `${p.nom} (ID: ${p.id})`))
        setProjects(response.data)
      } else {
        console.error('❌ Frontend: Erreur API:', response.message)
        setError(response.message)
      }
    } catch (err) {
      console.error('❌ Frontend: Erreur réseau:', err)
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des projets')
    } finally {
      setLoading(false)
    }
  }, [])

  // Fonction pour récupérer les statistiques
  const fetchStats = useCallback(async () => {
    try {
      const response = await projectService.getProjectStats()
      if (response.success) {
        setStats(response.data)
      }
    } catch (err) {
      console.error('Erreur lors du chargement des statistiques:', err)
    }
  }, [])

  // Fonction pour créer un projet avec rafraîchissement immédiat
  const createProject = async (projectData: any) => {
    try {
      console.log('🆕 Frontend: Création de projet...', projectData)
      
      const response = await projectService.createProject(projectData)
      
      if (response.success) {
        console.log('✅ Frontend: Projet créé avec succès!', response.data)
        
        // IMPORTANT: Rafraîchir immédiatement les données
        console.log('🔄 Frontend: Rafraîchissement des listes...')
        
        // Attendre un petit délai pour s'assurer que la base est mise à jour
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Recharger les projets ET les statistiques
        await Promise.all([
          fetchProjects(),
          fetchStats()
        ])
        
        console.log('✅ Frontend: Listes rafraîchies!')
        
        return { success: true, data: response.data }
      } else {
        console.error('❌ Frontend: Échec création:', response.message)
        return { success: false, error: response.message }
      }
    } catch (err) {
      console.error('❌ Frontend: Erreur création:', err)
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Erreur lors de la création' 
      }
    }
  }

  // Fonction pour forcer le rafraîchissement
  const refreshData = useCallback(async () => {
    console.log('🔄 Frontend: Rafraîchissement forcé des données...')
    await Promise.all([
      fetchProjects(),
      fetchStats()
    ])
  }, [fetchProjects, fetchStats])

  const updateProject = async (id: number, projectData: any) => {
    try {
      const response = await projectService.updateProject(id, projectData)
      if (response.success) {
        await refreshData() // Utiliser la fonction de rafraîchissement
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
      const response = await projectService.deleteProject(id)
      if (response.success) {
        await refreshData() // Utiliser la fonction de rafraîchissement
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

  // Chargement initial
  useEffect(() => {
    console.log('🚀 Frontend: Chargement initial des projets...')
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
    refreshData, // Nouvelle fonction pour forcer le rafraîchissement
  }
}