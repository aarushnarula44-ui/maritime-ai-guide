'use client'

import { useState, useEffect, useCallback } from 'react'

export interface Notification {
  id: string
  user_id: string
  type: 'cet_reminder' | 'eligibility_update' | 'sponsorship_open' | 'system' | 'fraud_alert'
  title: string
  body: string | null
  is_read: boolean
  created_at: string
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications?page=1')
      if (!res.ok) return
      const json = await res.json()
      const data: Notification[] = json.data ?? []
      setNotifications(data)
      setUnreadCount(data.filter((n) => !n.is_read).length)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 60_000)
    return () => clearInterval(interval)
  }, [fetchNotifications])

  const markRead = useCallback(async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    )
    setUnreadCount((prev) => Math.max(0, prev - 1))
    await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' })
  }, [])

  const markAllRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
    setUnreadCount(0)
    await fetch('/api/notifications/read-all', { method: 'PATCH' })
  }, [])

  return { notifications, unreadCount, loading, markRead, markAllRead, refetch: fetchNotifications }
}
