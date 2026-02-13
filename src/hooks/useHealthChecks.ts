'use client'

import { useState, useEffect } from 'react'
import { getAllHealthCheckResults } from '@/lib/db'
import type { HealthCheckResult } from '@/lib/types'

export function useHealthChecks() {
  const [results, setResults] = useState<HealthCheckResult[]>([])
  const [loading, setLoading] = useState(true)
  
  const loadResults = async () => {
    setLoading(true)
    try {
      const data = await getAllHealthCheckResults()
      setResults(data.sort((a, b) => b.timestamp - a.timestamp))
    } catch (error) {
      console.error('Error loading health check results:', error)
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    loadResults()
    
    const interval = setInterval(loadResults, 30000)
    
    return () => clearInterval(interval)
  }, [])
  
  return { results, loading, refresh: loadResults }
}