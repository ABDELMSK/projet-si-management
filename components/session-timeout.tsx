"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

export default function SessionTimeout() {
  const { user, logout } = useAuth()
  const [showWarning, setShowWarning] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)

  useEffect(() => {
    if (!user) return

    const checkSession = () => {
      const sessionExpiry = localStorage.getItem("auth_expiry")
      if (!sessionExpiry) return

      const now = new Date().getTime()
      const expiry = Number.parseInt(sessionExpiry)
      const timeUntilExpiry = expiry - now

      // Afficher l'avertissement 5 minutes avant l'expiration
      const warningTime = 5 * 60 * 1000 // 5 minutes en millisecondes

      if (timeUntilExpiry <= warningTime && timeUntilExpiry > 0) {
        setShowWarning(true)
        setTimeLeft(Math.ceil(timeUntilExpiry / 1000))
      } else if (timeUntilExpiry <= 0) {
        logout()
      }
    }

    const interval = setInterval(checkSession, 1000)
    return () => clearInterval(interval)
  }, [user, logout])

  useEffect(() => {
    if (showWarning && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft((prev) => prev - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft <= 0 && showWarning) {
      logout()
    }
  }, [timeLeft, showWarning, logout])

  const extendSession = () => {
    // Étendre la session de 8 heures
    const newExpiryTime = new Date().getTime() + 8 * 60 * 60 * 1000
    localStorage.setItem("auth_expiry", newExpiryTime.toString())
    setShowWarning(false)
    setTimeLeft(0)
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  if (!showWarning) return null

  return (
    <Dialog open={showWarning} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Session expirée bientôt</DialogTitle>
          <DialogDescription>
            Votre session va expirer dans {formatTime(timeLeft)}. Souhaitez-vous prolonger votre session ?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Progress value={(timeLeft / 300) * 100} className="w-full" />
          <p className="text-sm text-center text-muted-foreground">Temps restant : {formatTime(timeLeft)}</p>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={logout}>
            Se déconnecter
          </Button>
          <Button onClick={extendSession}>Prolonger la session</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
