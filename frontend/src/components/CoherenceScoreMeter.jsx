/**
 * CoherenceScoreMeter.jsx — Coherence 0-100 RadialBarChart
 */
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts'
import styles from './CoherenceScoreMeter.module.css'

export default function CoherenceScoreMeter({ score = 72 }) {
  const data = [{ name: 'Coherence', value: score, fill: '#22dd77' }]

  return (
    <div className={styles.container}>
      <div className={styles.title}>Coherence Score</div>
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          cx="50%"
          cy="50%"
          innerRadius="60%"
          outerRadius="90%"
          data={data}
          startAngle={180}
          endAngle={0}
          margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
        >
          <PolarAngleAxis
            type="number"
            domain={[0, 100]}
            angleAxisId={0}
            tick={false}
          />
          <RadialBar
            background
            dataKey="value"
            cornerRadius={8}
            fill="#22dd77"
            angleAxisId={0}
          />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className={styles.scoreDisplay}>{score} / 100</div>
    </div>
  )
}
