'use client'

import { useEffect, useRef } from 'react'
import feather from 'feather-icons'

interface FeatherIconProps {
  name: string
  size?: number
  color?: string
  strokeWidth?: number
  className?: string
}

export default function FeatherIcon({
  name,
  size = 24,
  color = 'currentColor',
  strokeWidth = 2,
  className = ''
}: FeatherIconProps) {
  const iconRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (iconRef.current) {
      const iconSvg = feather.icons[name]
      if (iconSvg) {
        iconRef.current.innerHTML = iconSvg.toSvg({
          width: size,
          height: size,
          color: color,
          'stroke-width': strokeWidth
        })
      }
    }
  }, [name, size, color, strokeWidth])

  return <span ref={iconRef} className={className} />
}
