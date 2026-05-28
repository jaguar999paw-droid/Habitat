/**
 * TraitDistribution.jsx — 4 traits RadarChart
 */
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts'
import styles from './TraitDistribution.module.css'

export default function TraitDistribution({ traits = [] }) {
  // Default 4 traits if not provided
  const data = [
    { name: 'Rawness', value: 65 },
    { name: 'Decisiveness', value: 58 },
    { name: 'Attribution', value: 72 },
    { name: 'Vulnerability', value: 61 },
  ]

  return (
    <div className={styles.container}>
      <div className={styles.title}>Trait Distribution</div>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
          <PolarGrid stroke="rgba(34, 221, 119, 0.2)" />
          <PolarAngleAxis
            dataKey="name"
            stroke="rgba(34, 221, 119, 0.6)"
            style={{ fontSize: '10px' }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            stroke="rgba(34, 221, 119, 0.3)"
            style={{ fontSize: '10px' }}
          />
          <Radar
            name="Traits"
            dataKey="value"
            stroke="#22dd77"
            fill="rgba(34, 221, 119, 0.3)"
            dot={{ fill: '#22dd77', r: 4 }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}
