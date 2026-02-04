'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { OfflineQueue, type QueuedChange } from '@/lib/google/offline-queue'

export function useOfflineQueue() {
  const queueRef = useRef<OfflineQueue>(new OfflineQueue())
  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  )
  const [queueLength, setQueueLength] = useState(0)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const enqueue = useCallback((change: Omit<QueuedChange, 'timestamp'>) => {
    queueRef.current.enqueue(change)
    setQueueLength(queueRef.current.length)
  }, [])

  const drain = useCallback(() => {
    const items = queueRef.current.drain()
    setQueueLength(0)
    return items
  }, [])

  return { isOnline, queueLength, enqueue, drain }
}
