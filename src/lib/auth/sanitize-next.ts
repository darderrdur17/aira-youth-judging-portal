/** Prevent open redirects: only allow same-origin relative paths. */
export function sanitizeNextPath(next: string | null, fallback: string): string {
  if (!next || typeof next !== 'string') return fallback
  const trimmed = next.trim()
  if (!trimmed.startsWith('/') || trimmed.startsWith('//')) return fallback
  return trimmed
}
