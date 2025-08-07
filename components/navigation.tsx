// components/navigation.tsx
"use client"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Home, FolderOpen, Users, BarChart3, Settings, LogOut } from "lucide-react"
import { useAuth } from "@/lib/auth"
import Image from "next/image"

interface NavigationProps {
  currentView: string
  onViewChange: (view: string) => void
}

export default function Navigation({ currentView, onViewChange }: NavigationProps) {
  const { user, logout } = useAuth()

  const menuItems = [
    { id: "dashboard", label: "Tableau de bord", icon: Home },
    { id: "projects", label: "Projets", icon: FolderOpen },
    { id: "reports", label: "Rapports", icon: BarChart3 },
    { id: "users", label: "Utilisateurs", icon: Users },
  ]

  // Filter menu items based on user role
  const filteredMenuItems = menuItems.filter((item) => {
    if (item.id === "users" && user?.role !== "Administrateur fonctionnel") {
      return false
    }
    if (item.id === "reports" && user?.role === "Chef de Projet") {
      return false
    }
    return true
  })

  const handleLogout = () => {
    logout()
  }

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-6">
          {/* Logo replacing "Système Référentiel SI" text */}
          <div className="flex items-center">
            <Image
              src="/login-image.png"
              width={140}
              height={32}
              className="h-8 w-auto"
              priority
            />
          </div>
          
          <nav className="flex space-x-1">
            {filteredMenuItems.map((item) => (
              <Button
                key={item.id}
                variant={currentView === item.id ? "default" : "ghost"}
                size="sm"
                onClick={() => onViewChange(item.id)}
                className="flex items-center space-x-2"
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Button>
            ))}
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          {user && (
            <>
              <div className="text-sm text-gray-700">
                <span className="font-medium">{user.nom}</span>
                <span className="text-gray-500 ml-2">({user.role})</span>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar} alt={user.nom} />
                      <AvatarFallback>
                        {user.nom
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user.nom}</p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Se déconnecter</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </div>
    </header>
  )
}