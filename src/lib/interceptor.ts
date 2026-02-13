'use client'

import { saveUsageRecord } from './db'
import type { UsageRecord } from './types'

let interceptorInstalled = false

function detectProvider(url: string): UsageRecord['provider'] {
  const urlLower = url.toLowerCase()
  if (urlLower.includes('api.openai.com')) return 'openai'
  if (urlLower.includes('api.anthropic.com')) return 'anthropic'
  if (urlLower.includes('generativelanguage.googleapis.com')) return 'google'
  if (urlLower.includes('api.x.ai')) return 'xai'
  if (urlLower.includes('api.deepseek.com')) return 'deepseek'
  return 'unknown'
}

function extractTokensFromResponse(
  provider: UsageRecord['provider'],
  responseBody: any
): { input: number; output: number; total: number } {
  try {
    if (provider === 'openai') {
      const usage = responseBody?.usage
      return {
        input: usage?.prompt_tokens || 0,
        output: usage?.completion_tokens || 0,
        total: usage?.total_tokens || 0,
      }
    }
    
    if (provider === 'anthropic') {
      const usage = responseBody?.usage
      return {
        input: usage?.input_tokens || 0,
        output: usage?.output_tokens || 0,
        total: (usage?.input_tokens || 0) + (usage?.output_tokens || 0),
      }
    }
    
    if (provider === 'google') {
      const usage = responseBody?.usageMetadata
      return {
        input: usage?.promptTokenCount || 0,
        output: usage?.candidatesTokenCount || 0,
        total: usage?.totalTokenCount || 0,
      }
    }
    
    if (provider === 'xai' || provider === 'deepseek') {
      const usage = responseBody?.usage
      return {
        input: usage?.prompt_tokens || 0,
        output: usage?.completion_tokens || 0,
        total: usage?.total_tokens || 0,
      }
    }
  } catch (error) {
    console.error('Error extracting tokens:', error)
  }
  
  return { input: 0, output: 0, total: 0 }
}

function extractModel(provider: UsageRecord['provider'], responseBody: any): string {
  try {
    if (provider === 'openai' || provider === 'xai' || provider === 'deepseek') {
      return responseBody?.model || 'unknown'
    }
    
    if (provider === 'anthropic') {
      return responseBody?.model || 'unknown'
    }
    
    if (provider === 'google') {
      return responseBody?.modelVersion || 'unknown'
    }
  } catch (error) {
    console.error('Error extracting model:', error)
  }
  
  return 'unknown'
}

export function installRequestInterceptor(): void {
  if (interceptorInstalled) return
  if (typeof window === 'undefined') return
  
  const originalFetch = window.fetch
  window.fetch = async function(...args: any[]) {
    const [resource, config] = args
    const url = typeof resource === 'string' ? resource : resource.url
    
    const provider = detectProvider(url)
    
    if (provider === 'unknown') {
      return originalFetch.apply(this, args)
    }
    
    const startTime = Date.now()
    
    try {
      const response = await originalFetch.apply(this, args)
      const clonedResponse = response.clone()
      
      clonedResponse.json().then(async (data) => {
        const tokens = extractTokensFromResponse(provider, data)
        const model = extractModel(provider, data)
        
        if (tokens.total > 0) {
          const record: UsageRecord = {
            id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: Date.now(),
            provider,
            model,
            requestTokens: tokens.input,
            responseTokens: tokens.output,
            totalTokens: tokens.total,
            endpoint: url,
            statusCode: response.status,
          }
          
          await saveUsageRecord(record)
          
          window.dispatchEvent(new CustomEvent('usage-record-added', { detail: record }))
        }
      }).catch(() => {})
      
      return response
    } catch (error) {
      throw error
    }
  }
  
  const originalOpen = XMLHttpRequest.prototype.open
  const originalSend = XMLHttpRequest.prototype.send
  
  XMLHttpRequest.prototype.open = function(method: string, url: string | URL, ...rest: any[]) {
    (this as any)._url = url.toString()
    return originalOpen.apply(this, [method, url, ...rest] as any)
  }
  
  XMLHttpRequest.prototype.send = function(body?: any) {
    const url = (this as any)._url
    const provider = detectProvider(url)
    
    if (provider !== 'unknown') {
      this.addEventListener('load', async function() {
        if (this.status >= 200 && this.status < 300) {
          try {
            const responseData = JSON.parse(this.responseText)
            const tokens = extractTokensFromResponse(provider, responseData)
            const model = extractModel(provider, responseData)
            
            if (tokens.total > 0) {
              const record: UsageRecord = {
                id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                timestamp: Date.now(),
                provider,
                model,
                requestTokens: tokens.input,
                responseTokens: tokens.output,
                totalTokens: tokens.total,
                endpoint: url,
                statusCode: this.status,
              }
              
              await saveUsageRecord(record)
              
              window.dispatchEvent(new CustomEvent('usage-record-added', { detail: record }))
            }
          } catch (error) {}
        }
      })
    }
    
    return originalSend.apply(this, [body] as any)
  }
  
  interceptorInstalled = true
  console.log('[Interceptor] AI API request interceptor installed')
}