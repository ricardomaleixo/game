"use client"

import { useNotifications } from "@/hooks/use-notifications"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { X, CheckCircle, XCircle, AlertTriangle, Info } from "lucide-react"
import type { Notification } from "@/types"

export function NotificationContainer() {
  const { notifications, removeNotification, markAsRead } = useNotifications()

  if (notifications.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.slice(0, 5).map((notification) => (
        <NotificationCard
          key={notification.id}
          notification={notification}
          onClose={() => removeNotification(notification.id)}
          onRead={() => markAsRead(notification.id)}
        />
      ))}
    </div>
  )
}

interface NotificationCardProps {
  notification: Notification
  onClose: () => void
  onRead: () => void
}

function NotificationCard({ notification, onClose, onRead }: NotificationCardProps) {
  const Icon = getIconByType(notification.type)
  const bgColor = getBgColorByType(notification.type)
  const textColor = getTextColorByType(notification.type)

  return (
    <Card className={`${bgColor} border-l-4 shadow-lg animate-in slide-in-from-right-5 duration-300`}>
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <Icon className={`h-5 w-5 ${textColor} flex-shrink-0 mt-0.5`} />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h4 className={`text-sm font-semibold ${textColor}`}>
                {notification.title}
              </h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-6 w-6 p-0 hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <p className="text-sm text-gray-700 mt-1">
              {notification.message}
            </p>
            
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-gray-500">
                {formatTime(notification.timestamp)}
              </span>
              
              {!notification.read && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onRead}
                  className="text-xs h-6 px-2 hover:bg-white/20"
                >
                  Marcar como lida
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function getIconByType(type: Notification["type"]) {
  switch (type) {
    case "success":
      return CheckCircle
    case "error":
      return XCircle
    case "warning":
      return AlertTriangle
    case "info":
      return Info
    default:
      return Info
  }
}

function getBgColorByType(type: Notification["type"]) {
  switch (type) {
    case "success":
      return "bg-green-50 border-l-green-500"
    case "error":
      return "bg-red-50 border-l-red-500"
    case "warning":
      return "bg-yellow-50 border-l-yellow-500"
    case "info":
      return "bg-blue-50 border-l-blue-500"
    default:
      return "bg-gray-50 border-l-gray-500"
  }
}

function getTextColorByType(type: Notification["type"]) {
  switch (type) {
    case "success":
      return "text-green-700"
    case "error":
      return "text-red-700"
    case "warning":
      return "text-yellow-700"
    case "info":
      return "text-blue-700"
    default:
      return "text-gray-700"
  }
}

function formatTime(timestamp: string): string {
  const now = new Date()
  const time = new Date(timestamp)
  const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60))

  if (diffInMinutes < 1) {
    return "Agora"
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes}m atrás`
  } else if (diffInMinutes < 1440) {
    const hours = Math.floor(diffInMinutes / 60)
    return `${hours}h atrás`
  } else {
    return time.toLocaleDateString("pt-BR")
  }
}