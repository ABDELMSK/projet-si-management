// components/create-project-dialog.tsx
"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon, Loader2, AlertCircle } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { toast } from "@/components/ui/use-toast"
import { projectApi, referenceApi, type CreateProjectData, type ReferenceData } from "@/lib/api"
import { useAuth } from "@/lib/auth"

interface CreateProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onProjectCreated: () => void // Callback pour rafraîchir la liste
}

export default function CreateProjectDialog({ 
  open, 
  onOpenChange, 
  onProjectCreated 
}: CreateProjectDialogProps) {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingRef, setIsLoadingRef] = useState(false)
  const [referenceData, setReferenceData] = useState<ReferenceData | null>(null)
  
  const [formData, setFormData] = useState<CreateProjectData>({
    nom: "",
    description: "",
    chef_projet_id: 0,
    direction_id: 0,
    statut_id: 0,
    budget: 0,
    date_debut: "",
    date_fin_prevue: "",
    priorite: "Normale" as const,
  })

  const [dateDebut, setDateDebut] = useState<Date>()
  const [dateFin, setDateFin] = useState<Date>()
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Charger les données de référence à l'ouverture
  useEffect(() => {
    if (open && !referenceData) {
      loadReferenceData()
    }
  }, [open])

  // Initialiser le chef de projet avec l'utilisateur connecté
  useEffect(() => {
    if (user && referenceData) {
      const currentUser = referenceData.utilisateurs.find(u => u.email === user.email)
      if (currentUser) {
        setFormData(prev => ({ ...prev, chef_projet_id: currentUser.id }))
      }
    }
  }, [user, referenceData])

  const loadReferenceData = async () => {
    setIsLoadingRef(true)
    try {
      const response = await referenceApi.getAllReference()
      if (response.success && response.data) {
        setReferenceData(response.data)
        
        // Sélectionner automatiquement le premier statut "Planification" ou le premier disponible
        const defaultStatus = response.data.statuts.find(s => s.nom === "Planification") || response.data.statuts[0]
        if (defaultStatus) {
          setFormData(prev => ({ ...prev, statut_id: defaultStatus.id }))
        }
      } else {
        toast({
          title: "Erreur",
          description: "Impossible de charger les données de référence",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Erreur lors du chargement des référentiels:", error)
      toast({
        title: "Erreur",
        description: "Erreur de connexion au serveur",
        variant: "destructive",
      })
    } finally {
      setIsLoadingRef(false)
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.nom.trim()) {
      newErrors.nom = "Le nom du projet est obligatoire"
    }
    if (!formData.chef_projet_id) {
      newErrors.chef_projet_id = "Le chef de projet est obligatoire"
    }
    if (!formData.direction_id) {
      newErrors.direction_id = "La direction est obligatoire"
    }
    if (!formData.statut_id) {
      newErrors.statut_id = "Le statut est obligatoire"
    }
    if (dateDebut && dateFin && dateDebut > dateFin) {
      newErrors.date_fin_prevue = "La date de fin doit être postérieure à la date de début"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    
    try {
      // Préparer les données avec les dates formatées
      const projectData: CreateProjectData = {
        ...formData,
        date_debut: dateDebut ? format(dateDebut, "yyyy-MM-dd") : "",
        date_fin_prevue: dateFin ? format(dateFin, "yyyy-MM-dd") : "",
        budget: formData.budget || undefined,
      }

      console.log("Envoi des données projet:", projectData)
      
      const response = await projectApi.createProject(projectData)
      
      if (response.success) {
        toast({
          title: "Succès",
          description: "Le projet a été créé avec succès",
        })
        
        // Réinitialiser le formulaire
        resetForm()
        
        // Fermer le dialogue
        onOpenChange(false)
        
        // Notifier le parent pour rafraîchir la liste
        onProjectCreated()
      } else {
        throw new Error(response.message || "Erreur lors de la création")
      }
    } catch (error) {
      console.error("Erreur lors de la création du projet:", error)
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur lors de la création du projet",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      nom: "",
      description: "",
      chef_projet_id: user ? referenceData?.utilisateurs.find(u => u.email === user.email)?.id || 0 : 0,
      direction_id: 0,
      statut_id: referenceData?.statuts.find(s => s.nom === "Planification")?.id || 0,
      budget: 0,
      date_debut: "",
      date_fin_prevue: "",
      priorite: "Normale",
    })
    setDateDebut(undefined)
    setDateFin(undefined)
    setErrors({})
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm()
    }
    onOpenChange(newOpen)
  }

  if (isLoadingRef) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Chargement...</span>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Créer un nouveau projet</DialogTitle>
          <DialogDescription>
            Remplissez les informations pour créer un nouveau projet
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations de base */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nom">Nom du projet *</Label>
              <Input
                id="nom"
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                placeholder="Ex: Migration ERP SAP"
                className={errors.nom ? "border-red-500" : ""}
              />
              {errors.nom && (
                <p className="text-sm text-red-500 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.nom}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="priorite">Priorité</Label>
              <Select 
                value={formData.priorite} 
                onValueChange={(value: "Haute" | "Normale" | "Faible") => 
                  setFormData({ ...formData, priorite: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Haute">🔴 Haute</SelectItem>
                  <SelectItem value="Normale">🟡 Normale</SelectItem>
                  <SelectItem value="Faible">🟢 Faible</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Décrivez les objectifs et le périmètre du projet..."
              rows={3}
            />
          </div>

          {/* Attribution et organisation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="chef_projet">Chef de projet *</Label>
              <Select 
                value={formData.chef_projet_id.toString()} 
                onValueChange={(value) => setFormData({ ...formData, chef_projet_id: parseInt(value) })}
              >
                <SelectTrigger className={errors.chef_projet_id ? "border-red-500" : ""}>
                  <SelectValue placeholder="Sélectionner un chef de projet" />
                </SelectTrigger>
                <SelectContent>
                  {referenceData?.utilisateurs
                    .filter(u => ["Chef de Projet", "PMO / Directeur de projets", "Administrateur fonctionnel"].includes(u.role))
                    .map((user) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.nom} ({user.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.chef_projet_id && (
                <p className="text-sm text-red-500 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.chef_projet_id}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="direction">Direction *</Label>
              <Select 
                value={formData.direction_id.toString()} 
                onValueChange={(value) => setFormData({ ...formData, direction_id: parseInt(value) })}
              >
                <SelectTrigger className={errors.direction_id ? "border-red-500" : ""}>
                  <SelectValue placeholder="Sélectionner une direction" />
                </SelectTrigger>
                <SelectContent>
                  {referenceData?.directions.map((direction) => (
                    <SelectItem key={direction.id} value={direction.id.toString()}>
                      {direction.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.direction_id && (
                <p className="text-sm text-red-500 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.direction_id}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="statut">Statut *</Label>
              <Select 
                value={formData.statut_id.toString()} 
                onValueChange={(value) => setFormData({ ...formData, statut_id: parseInt(value) })}
              >
                <SelectTrigger className={errors.statut_id ? "border-red-500" : ""}>
                  <SelectValue placeholder="Sélectionner un statut" />
                </SelectTrigger>
                <SelectContent>
                  {referenceData?.statuts.map((statut) => (
                    <SelectItem key={statut.id} value={statut.id.toString()}>
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-2" 
                          style={{ backgroundColor: statut.couleur }}
                        />
                        {statut.nom}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.statut_id && (
                <p className="text-sm text-red-500 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.statut_id}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="budget">Budget (€)</Label>
              <Input
                id="budget"
                type="number"
                value={formData.budget || ""}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value ? parseFloat(e.target.value) : 0 })}
                placeholder="50000"
                min="0"
                step="100"
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date de début</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateDebut && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateDebut ? format(dateDebut, "PPP", { locale: fr }) : "Sélectionner une date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateDebut}
                    onSelect={setDateDebut}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Date de fin prévue</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateFin && "text-muted-foreground",
                      errors.date_fin_prevue && "border-red-500"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateFin ? format(dateFin, "PPP", { locale: fr }) : "Sélectionner une date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateFin}
                    onSelect={setDateFin}
                    initialFocus
                    disabled={(date) => dateDebut ? date < dateDebut : false}
                  />
                </PopoverContent>
              </Popover>
              {errors.date_fin_prevue && (
                <p className="text-sm text-red-500 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.date_fin_prevue}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => handleOpenChange(false)}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Création...
                </>
              ) : (
                "Créer le projet"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}