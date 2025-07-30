"use client"

import React, { useState, useEffect } from "react"
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
import { CalendarIcon, Loader2 } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { toast } from "@/components/ui/use-toast"

interface CreateProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onProjectCreated: () => void
}

interface ReferenceData {
  directions: Array<{id: number, nom: string}>
  statuts: Array<{id: number, nom: string, couleur: string}>
  utilisateurs: Array<{id: number, nom: string, email: string}>
}

export default function CreateProjectDialog({ 
  open, 
  onOpenChange, 
  onProjectCreated 
}: CreateProjectDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingRef, setIsLoadingRef] = useState(false)
  const [dateDebut, setDateDebut] = useState<Date>()
  const [dateFin, setDateFin] = useState<Date>()
  
  const [formData, setFormData] = useState({
    nom: "",
    code: "",
    description: "",
    chef_projet_id: "",
    direction_id: "",
    statut_id: "",
    budget: "",
    priorite: "Normale"
  })

  const [referenceData, setReferenceData] = useState<ReferenceData>({
    directions: [
      { id: 1, nom: "DSI" },
      { id: 2, nom: "Marketing" },
      { id: 3, nom: "Finance" },
      { id: 4, nom: "RH" },
      { id: 5, nom: "Commercial" }
    ],
    statuts: [
      { id: 1, nom: "Planifié", couleur: "#6B7280" },
      { id: 2, nom: "En cours", couleur: "#3B82F6" },
      { id: 3, nom: "Terminé", couleur: "#10B981" },
      { id: 4, nom: "Suspendu", couleur: "#F59E0B" },
      { id: 5, nom: "Annulé", couleur: "#EF4444" }
    ],
    utilisateurs: [
      { id: 1, nom: "Marie Dubois", email: "marie.dubois@company.com" },
      { id: 2, nom: "Pierre Martin", email: "pierre.martin@company.com" },
      { id: 3, nom: "Sophie Laurent", email: "sophie.laurent@company.com" }
    ]
  })

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setFormData({
        nom: "",
        code: "",
        description: "",
        chef_projet_id: "",
        direction_id: "",
        statut_id: "",
        budget: "",
        priorite: "Normale"
      })
      setDateDebut(undefined)
      setDateFin(undefined)
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Prepare data for API
      const projectData = {
        nom: formData.nom.trim(),
        code: formData.code.trim(),
        description: formData.description.trim() || null,
        chef_projet_id: parseInt(formData.chef_projet_id),
        direction_id: parseInt(formData.direction_id),
        statut_id: parseInt(formData.statut_id),
        budget: formData.budget ? parseFloat(formData.budget) : null,
        date_debut: dateDebut ? format(dateDebut, 'yyyy-MM-dd') : null,
        date_fin_prevue: dateFin ? format(dateFin, 'yyyy-MM-dd') : null,
        priorite: formData.priorite
      }

      console.log('🔄 Création de projet avec données:', projectData)

      // API call to create project
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(projectData)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Erreur lors de la création du projet')
      }

      console.log('✅ Projet créé avec succès:', result)

      toast({
        title: "Succès",
        description: "Le projet a été créé avec succès",
      })

      onProjectCreated()
      onOpenChange(false)

    } catch (error) {
      console.error('❌ Erreur lors de la création du projet:', error)
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur lors de la création du projet",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Créer un nouveau projet</DialogTitle>
          <DialogDescription>
            Remplissez les informations générales du projet
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom du projet *</Label>
              <Input
                id="name"
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                placeholder="Ex: Migration ERP SAP"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">Code projet *</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="Ex: PRJ-2025-001"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Résumé des objectifs du projet"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Chef de projet *</Label>
              <Select
                value={formData.chef_projet_id}
                onValueChange={(value) => setFormData({ ...formData, chef_projet_id: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un chef de projet" />
                </SelectTrigger>
                <SelectContent>
                  {referenceData.utilisateurs.map((user) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Direction *</Label>
              <Select
                value={formData.direction_id}
                onValueChange={(value) => setFormData({ ...formData, direction_id: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une direction" />
                </SelectTrigger>
                <SelectContent>
                  {referenceData.directions.map((direction) => (
                    <SelectItem key={direction.id} value={direction.id.toString()}>
                      {direction.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Statut *</Label>
              <Select
                value={formData.statut_id}
                onValueChange={(value) => setFormData({ ...formData, statut_id: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un statut" />
                </SelectTrigger>
                <SelectContent>
                  {referenceData.statuts.map((statut) => (
                    <SelectItem key={statut.id} value={statut.id.toString()}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: statut.couleur }}
                        />
                        {statut.nom}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Priorité</Label>
              <Select
                value={formData.priorite}
                onValueChange={(value) => setFormData({ ...formData, priorite: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Faible">🟢 Faible</SelectItem>
                  <SelectItem value="Normale">🟡 Normale</SelectItem>
                  <SelectItem value="Haute">🔴 Haute</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date de début</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateDebut && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateDebut ? format(dateDebut, "dd MMMM yyyy", { locale: fr }) : "Sélectionner une date"}
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
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateFin && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateFin ? format(dateFin, "dd MMMM yyyy", { locale: fr }) : "Sélectionner une date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateFin}
                    onSelect={setDateFin}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="budget">Budget (€)</Label>
            <Input
              id="budget"
              type="number"
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
              placeholder="Ex: 450000"
              min="0"
              step="1000"
            />
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Créer le projet
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
