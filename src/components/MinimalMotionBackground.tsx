import type { CSSProperties } from 'react'

type MinimalMotionBackgroundProps = {
  className?: string
}

type DotNode = {
  x: number
  y: number
  size: 'small' | 'large'
  delay: number
  duration: number
  dx: number
  dy: number
}

function mulberry32(seed: number) {
  return function next() {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const rand = mulberry32(20260323)

const DOTS: DotNode[] = Array.from({ length: 56 }, () => ({
  x: 4 + rand() * 92,
  y: 6 + rand() * 88,
  size: rand() > 0.75 ? 'large' : 'small',
  delay: rand() * 10,
  duration: 14 + rand() * 14,
  dx: (rand() - 0.5) * 18,
  dy: (rand() - 0.5) * 22,
}))

export function MinimalMotionBackground({ className = '' }: MinimalMotionBackgroundProps) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      {DOTS.map((dot, idx) => (
        <span
          key={`dot-${idx}`}
          className={dot.size === 'large' ? 'minimal-dot minimal-dot-large' : 'minimal-dot'}
          style={
            {
              '--x': `${dot.x}%`,
              '--y': `${dot.y}%`,
              '--dx': `${dot.dx}px`,
              '--dy': `${dot.dy}px`,
              '--delay': `${dot.delay}s`,
              '--duration': `${dot.duration}s`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  )
}
