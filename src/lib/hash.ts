export async function computeSHA256(data: string): Promise<string> {
  const encoder = new TextEncoder()
  const dataBuffer = encoder.encode(data)
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  return hashHex
}

export async function verifyHash(data: string, expectedHash: string): Promise<boolean> {
  const actualHash = await computeSHA256(data)
  return actualHash === expectedHash
}

export async function computeFileHash(file: File): Promise<string> {
  const text = await file.text()
  return computeSHA256(text)
}