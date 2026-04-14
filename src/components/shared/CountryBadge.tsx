import { Badge } from '@/components/ui/badge'
import { COUNTRY_COLORS } from '@/lib/types'

interface CountryBadgeProps {
  country: string
  className?: string
}

export function CountryBadge({ country, className }: CountryBadgeProps) {
  const colorClass = COUNTRY_COLORS[country] ?? 'bg-gray-100 text-gray-700 border-gray-200'
  return (
    <Badge
      variant="outline"
      className={`text-[10px] font-semibold border px-1.5 py-0.5 ${colorClass} ${className ?? ''}`}
    >
      {country}
    </Badge>
  )
}
