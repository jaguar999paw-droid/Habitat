/**
 * IdentityRadar.jsx — Hexagonal identity output visualization
 *
 * Plots 6 identity dimensions on a SVG radar chart.
 * Dimensions map to the 6-angle identity framework:
 *   Past Actual · Past Alternative · Present Actual
 *   Present Alternative · Future Projected · Future Alternative
 *
 * Props:
 *   values  — { pastActual, pastAlt, presentActual, presentAlt, futureProjected, futureAlt }
 *             each 0–100 (defaults to 50)
 *   label   — string shown in centre (e.g. dominant emotion)
 *   size    — svg width/height px (default 280)
 *   animate — animate polygon on mount (default true)
 *
 * v1.1: dot hover tooltip showing axis name + value
 */
import { useRef, useEffect, useState } from 'react'
import styles from './IdentityRadar.module.css'

const AXES = [
  { key: 'pastActual',       label: 'Past · Real',     angle: 90  },
  { key: 'pastAlt',          label: 'Past · Shadow',   angle: 30  },
  { key: 'presentActual',    label: 'Now · Real',      angle: 330 },
  { key: 'futureProjected',  label: 'Future · Vision', angle: 270 },
  { key: 'futureAlt',        label: 'Future · Fear',   angle: 210 },
  { key: 'presentAlt',       label: 'Now · Shadow',    angle: 150 },
]

const DEG = Math.PI / 180
const polar = (cx, cy, r, angleDeg) => ({
  x: cx + r * Math.cos((angleDeg - 90) * DEG),
  y: cy + r * Math.sin((angleDeg - 90) * DEG),
})

function hexPath(cx, cy, r) {
  return AXES
    .map(a => polar(cx, cy, r, a.angle))
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(2)},${p.y.toFixed(2)}`)
    .join(' ') + ' Z'
}

function dataPath(cx, cy, maxR, values) {
  return AXES
    .map(a => {
      const v = Math.max(0, Math.min(100, values[a.key] ?? 50))
      return polar(cx, cy, (v / 100) * maxR, a.angle)
    })
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(2)},${p.y.toFixed(2)}`)
    .join(' ') + ' Z'
}

export default function IdentityRadar({
  values = {},
  label = '',
  size = 280,
  animate = true,
}) {
  const svgRef  = useRef(null)
  const cx = size / 2
  const cy = size / 2
  const maxR = size * 0.36
  const rings = [0.25, 0.5, 0.75, 1.0]

  // Tooltip state: { x, y, text } | null
  const [tooltip, setTooltip] = useState(null)

  // Animate polygon on mount / value change
  useEffect(() => {
    if (!animate || !svgRef.current) return
    const poly = svgRef.current.querySelector('#radar-data')
    if (!poly) return
    poly.style.opacity = '0'
    const t = setTimeout(() => {
      poly.style.transition = 'opacity 0.5s ease'
      poly.style.opacity = '1'
    }, 60)
    return () => clearTimeout(t)
  }, [values, animate])

  return (
    <div className={styles.wrapper}>
      <svg
        ref={svgRef}
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className={styles.svg}
        aria-label="Identity radar chart"
        onMouseLeave={() => setTooltip(null)}
      >
        {/* Grid rings */}
        {rings.map((r, i) => (
          <path
            key={i}
            d={hexPath(cx, cy, maxR * r)}
            fill="none"
            stroke="var(--radar-grid, rgba(120,180,255,0.15))"
            strokeWidth={i === rings.length - 1 ? 1.5 : 0.75}
          />
        ))}

        {/* Axis spokes */}
        {AXES.map(a => {
          const tip = polar(cx, cy, maxR, a.angle)
          return (
            <line
              key={a.key}
              x1={cx} y1={cy} x2={tip.x} y2={tip.y}
              stroke="var(--radar-spoke, rgba(120,180,255,0.12))"
              strokeWidth={0.75}
            />
          )
        })}

        {/* Data polygon */}
        <path
          id="radar-data"
          d={dataPath(cx, cy, maxR, values)}
          fill="var(--radar-fill, rgba(0,200,255,0.18))"
          stroke="var(--radar-stroke, #00c8ff)"
          strokeWidth={1.8}
          strokeLinejoin="round"
        />

        {/* Data dots — interactive */}
        {AXES.map(a => {
          const v  = Math.max(0, Math.min(100, values[a.key] ?? 50))
          const pt = polar(cx, cy, (v / 100) * maxR, a.angle)
          return (
            <circle
              key={a.key}
              cx={pt.x} cy={pt.y} r={5}
              fill="var(--radar-dot, #00c8ff)"
              stroke="var(--color-bg, #000)"
              strokeWidth={1.5}
              style={{ cursor: 'pointer' }}
              onMouseEnter={() => setTooltip({ x: pt.x, y: pt.y, label: a.label, value: v })}
              onMouseLeave={() => setTooltip(null)}
            />
          )
        })}

        {/* Axis labels */}
        {AXES.map(a => {
          const labelR = maxR + 20
          const pt     = polar(cx, cy, labelR, a.angle)
          const isLeft  = pt.x < cx - 5
          const isRight = pt.x > cx + 5
          const anchor  = isLeft ? 'end' : isRight ? 'start' : 'middle'
          return (
            <text
              key={a.key}
              x={pt.x} y={pt.y}
              textAnchor={anchor}
              dominantBaseline="middle"
              fontSize={9}
              fontFamily="var(--font-mono, monospace)"
              fill="var(--radar-label, rgba(180,210,255,0.7))"
            >
              {a.label}
            </text>
          )
        })}

        {/* Centre label */}
        {label && (
          <>
            <circle cx={cx} cy={cy} r={22} fill="var(--radar-centre-bg, rgba(0,0,0,0.5))" />
            <text
              x={cx} y={cy}
              textAnchor="middle" dominantBaseline="middle"
              fontSize={8.5}
              fontFamily="var(--font-mono, monospace)"
              fill="var(--radar-label, rgba(180,210,255,0.9))"
              fontWeight="bold"
            >
              {label.toUpperCase()}
            </text>
          </>
        )}

        {/* Hover tooltip — rendered inside SVG for crisp positioning */}
        {tooltip && (() => {
          // Keep tooltip within SVG bounds
          const tipW = 110
          const tipH = 30
          const pad  = 6
          const rawX = tooltip.x + 10
          const rawY = tooltip.y - 36
          const tx   = Math.min(Math.max(rawX, pad), size - tipW - pad)
          const ty   = Math.min(Math.max(rawY, pad), size - tipH - pad)
          return (
            <g style={{ pointerEvents: 'none' }}>
              <rect
                x={tx} y={ty} width={tipW} height={tipH}
                rx={4}
                fill="rgba(10,20,40,0.92)"
                stroke="rgba(0,200,255,0.5)"
                strokeWidth={0.75}
              />
              <text
                x={tx + 8} y={ty + 11}
                fontSize={9} fontFamily="var(--font-mono, monospace)"
                fill="rgba(180,210,255,0.7)"
              >
                {tooltip.label}
              </text>
              <text
                x={tx + 8} y={ty + 22}
                fontSize={10} fontFamily="var(--font-mono, monospace)"
                fill="#00c8ff" fontWeight="bold"
              >
                {tooltip.value} / 100
              </text>
            </g>
          )
        })()}
      </svg>

      {/* Value legend */}
      <div className={styles.legend}>
        {AXES.map(a => {
          const v = Math.max(0, Math.min(100, values[a.key] ?? 50))
          return (
            <div key={a.key} className={styles.legendRow}>
              <span className={styles.legendKey}>{a.label}</span>
              <div className={styles.legendBar}>
                <div className={styles.legendFill} style={{ width: `${v}%` }} />
              </div>
              <span className={styles.legendVal}>{v}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
