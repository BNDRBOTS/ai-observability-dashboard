'use client'

import { useState, useEffect } from 'react'
import { getAllUsageRecords } from '@/lib/db'
import type { UsageRecord } from '@/lib/types'

export function useUsageData() {
  const [records, setRecords] = useState<UsageRecord[]>([])
  const [loading, setLoading] = useState(true)
  
  const loadRecords = async () => {
    setLoading(true)
    try {
      const data = await getAllUsageRecords()
      setRecords(data.sort((a, b) => b.timestamp - a.timestamp))
    } catch (error) {
      console.error('Error loading usage records:', error)
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    loadRecords()
    
    const handleNewRecord = () => {
      loadRecords()
    }
    
    window.addEventListener('usage-record-added', handleNewRecord)
    
    return () => {
      window.removeEventListener('usage-record-added', handleNewRecord)
    }
  }, [])
  
  return { records, loading, refresh: loadRecords }
}