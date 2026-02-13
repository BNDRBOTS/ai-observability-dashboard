export interface UsageRecord {
  id: string
  timestamp: number
  provider: 'openai' | 'anthropic' | 'google' | 'xai' | 'deepseek' | 'unknown'
  model: string
  requestTokens: number
  responseTokens: number
  totalTokens: number
  endpoint: string
  statusCode: number
}

export interface HealthCheckResult {
  provider: 'openai' | 'anthropic' | 'google' | 'xai'
  status: 'operational' | 'degraded' | 'unreachable'
  responseTime: number
  timestamp: number
  error?: string
}

export interface StockData {
  symbol: string
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface LitigationData {
  date: string
  count: number
  provider: string
}

export interface SECFiling {
  filingDate: string
  companyName: string
  formType: string
  filingUrl: string
  mentionCount: number
  mentions: string[]
}

export interface HashManifest {
  [filename: string]: {
    hash: string
    timestamp: number
    size: number
  }
}

export interface CostConfig {
  openai: {
    [model: string]: {
      input: number
      output: number
    }
  }
  anthropic: {
    [model: string]: {
      input: number
      output: number
    }
  }
  google: {
    [model: string]: {
      input: number
      output: number
    }
  }
  xai: {
    [model: string]: {
      input: number
      output: number
    }
  }
  deepseek: {
    [model: string]: {
      input: number
      output: number
    }
  }
}