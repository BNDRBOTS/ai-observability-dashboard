'use client'

import { get, set, del, entries } from 'idb-keyval'
import type { UsageRecord, HealthCheckResult } from './types'

const USAGE_KEY_PREFIX = 'usage_'
const HEALTH_KEY_PREFIX = 'health_'
const COST_CONFIG_KEY = 'cost_config'

export async function saveUsageRecord(record: UsageRecord): Promise<void> {
  const key = `${USAGE_KEY_PREFIX}${record.id}`
  await set(key, record)
}

export async function getAllUsageRecords(): Promise<UsageRecord[]> {
  const allEntries = await entries()
  const usageEntries = allEntries.filter(([key]) => 
    typeof key === 'string' && key.startsWith(USAGE_KEY_PREFIX)
  )
  return usageEntries.map(([_, value]) => value as UsageRecord)
}

export async function getUsageRecordsByDateRange(
  startDate: number,
  endDate: number
): Promise<UsageRecord[]> {
  const allRecords = await getAllUsageRecords()
  return allRecords.filter(
    record => record.timestamp >= startDate && record.timestamp <= endDate
  )
}

export async function getUsageRecordsByProvider(
  provider: string
): Promise<UsageRecord[]> {
  const allRecords = await getAllUsageRecords()
  return allRecords.filter(record => record.provider === provider)
}

export async function clearAllUsageRecords(): Promise<void> {
  const allEntries = await entries()
  const usageKeys = allEntries
    .filter(([key]) => typeof key === 'string' && key.startsWith(USAGE_KEY_PREFIX))
    .map(([key]) => key)
  
  await Promise.all(usageKeys.map(key => del(key)))
}

export async function saveHealthCheckResult(result: HealthCheckResult): Promise<void> {
  const key = `${HEALTH_KEY_PREFIX}${result.provider}`
  await set(key, result)
}

export async function getAllHealthCheckResults(): Promise<HealthCheckResult[]> {
  const allEntries = await entries()
  const healthEntries = allEntries.filter(([key]) =>
    typeof key === 'string' && key.startsWith(HEALTH_KEY_PREFIX)
  )
  return healthEntries.map(([_, value]) => value as HealthCheckResult)
}

export async function getHealthCheckResult(
  provider: string
): Promise<HealthCheckResult | null> {
  const key = `${HEALTH_KEY_PREFIX}${provider}`
  const result = await get(key)
  return result || null
}

export async function saveCostConfig(config: any): Promise<void> {
  await set(COST_CONFIG_KEY, config)
}

export async function getCostConfig(): Promise<any> {
  const config = await get(COST_CONFIG_KEY)
  if (!config) {
    const defaultConfig = {
      openai: {
        'gpt-4': { input: 30, output: 60 },
        'gpt-4-turbo': { input: 10, output: 30 },
        'gpt-3.5-turbo': { input: 0.5, output: 1.5 },
      },
      anthropic: {
        'claude-3-opus': { input: 15, output: 75 },
        'claude-3-sonnet': { input: 3, output: 15 },
        'claude-3-haiku': { input: 0.25, output: 1.25 },
      },
      google: {
        'gemini-pro': { input: 0.5, output: 1.5 },
        'gemini-ultra': { input: 10, output: 30 },
      },
      xai: {
        'grok-1': { input: 5, output: 15 },
      },
      deepseek: {
        'deepseek-chat': { input: 0.14, output: 0.28 },
      },
    }
    await saveCostConfig(defaultConfig)
    return defaultConfig
  }
  return config
}