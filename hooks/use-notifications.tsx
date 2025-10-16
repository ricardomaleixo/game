"use client"

import { createContext, useContext, useState, useCallback, ReactNode } from "react"
import type { Notification } from "@/types"

interface NotificationContextType {
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, "id" | "timestamp" | "read">) => void
  removeNotification: (id: string) => void
  markAsRead: (id: string) => void
  clearAll: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

interface NotificationProviderProps {
  children: ReactNode
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const addNotification = useCallback((notification: Omit<Notification, "id" | "timestamp" | "read">) => {
    const newNotification: Notification = {
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      read: false
    }

    setNotifications(prev => [newNotification, ...prev])

    // Auto remove after 5 seconds for success notifications
    if (notification.type === "success") {
      setTimeout(() => {
        removeNotification(newNotification.id)
      }, 5000)
    }
  }, [])

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }, [])

  const clearAll = useCallback(() => {
    setNotifications([])
  }, [])

  return (
    <NotificationContext.Provider value={{
      notifications,
      addNotification,
      removeNotification,
      markAsRead,
      clearAll
    }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider")
  }
  return context
}

// Hook simplificado para toast messages
export function useToast() {
  const { addNotification } = useNotifications()

  const toast = useCallback((type: Notification["type"], message: string, title?: string) => {
    addNotification({
      type,
      title: title || getTitleByType(type),
      message
    })
  }, [addNotification])

  const success = useCallback((message: string, title?: string) => {
    toast("success", message, title)
  }, [toast])

  const error = useCallback((message: string, title?: string) => {
    toast("error", message, title)
  }, [toast])

  const warning = useCallback((message: string, title?: string) => {
    toast("warning", message, title)
  }, [toast])

  const info = useCallback((message: string, title?: string) => {
    toast("info", message, title)
  }, [toast])

  return {
    success,
    error,
    warning,
    info
  }
}

function getTitleByType(type: Notification["type"]): string {
  switch (type) {
    case "success":
      return "Sucesso"
    case "error":
      return "Erro"
    case "warning":
      return "Aviso"
    case "info":
      return "Informação"
    default:
      return "Notificação"
  }
}