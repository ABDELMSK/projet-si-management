"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Shield, AlertTriangle, Home, User } from "lucide-react"
import { useAuth } from "@/lib/auth"

interface AccessDeniedProps {
  title?: string
  message?: string
  requiredRole?: string
  requiredPermission?: string
  onGoBack?: () => void
}

export default function AccessDenied({ 
  title = "Accès refusé",
  message,
  requiredRole,
  requiredPermission,
  onGoBack
}: AccessDeniedProps) {
  const { user } = useAuth()

  const defaultMessage = requiredRole 
    ? `Cette fonctionnalité nécessite le rôle "${requiredRole}".`
    : requiredPermission
    ? `Cette fonctionnalité nécessite la permission "${requiredPermission}".`
    : "Vous n'avez pas les permissions nécessaires pour accéder à cette page."

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <Shield className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-xl font-bold text-red-600">{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <div className="flex items-start space-x-3 p-3 bg-amber-50 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-amber-800 text-left">
              <p className="font-medium mb-1">Permission insuffisante</p>
              <p>{message || defaultMessage}</p>
            </div>
          </div>

          {user && (
            <div className="text-sm text-gray-600 space-y-2">
              <div className="flex items-center justify-center space-x-2">
                <User className="h-4 w-4" />
                <span>Connecté en tant que: <strong>{user.nom}</strong></span>
              </div>
              <div className="text-xs">
                <span>Rôle actuel: </span>
                <span className="font-medium text-blue-600">{user.role_nom}</span>
              </div>
              {requiredRole && (
                <div className="text-xs">
                  <span>Rôle requis: </span>
                  <span className="font-medium text-green-600">{requiredRole}</span>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col space-y-2 pt-4">
            {onGoBack && (
              <Button onClick={onGoBack} variant="outline">
                Retour
              </Button>
            )}
            <Button 
              onClick={() => window.location.href = '/'}
              variant="default"
              className="flex items-center justify-center space-x-2"
            >
              <Home className="h-4 w-4" />
              <span>Retour à l'accueil</span>
            </Button>
          </div>

          <div className="text-xs text-gray-500 pt-4 border-t">
            Si vous pensez que c'est une erreur, contactez votre administrateur système.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}