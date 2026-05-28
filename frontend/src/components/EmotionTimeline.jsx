/**
 * EmotionTimeline.jsx — emotion tags over last 7 journal entries (LineChart)
 */
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import styles from './EmotionTimeline.module.css'

const EMOTION_INTENSITY = {
  rage: 5,
  sadness: 4,
  defiance: 5,
  peace: 2,
  confusion: 3,
  hope: 4,
  shame: 5,
  longing: 4,
}

export default function EmotionTimeline() {
  // Dummy data: would be replaced with real journal entries
  const data = [
    { entry: 'E1', intensity: 3 },
    { entry: 'E2', intensity: 4 },
    { entry: 'E3', intensity: 5 },
    { entry: 'E4', intensity: 4 },
    { entry: 'E5', intensity: 5 },
    { entry: 'E6', intensity: 3 },
    { entry: 'E7', intensity: 4 },
  ]

  return (
    <div className={styles.container}>
      <div className={styles.title}>Emotion Timeline</div>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(34, 221, 119, 0.1)" />
          <XAxis
            dataKey="entry"
            stroke="rgba(34, 221, 119, 0.5)"
            style={{ fontSize: '11px' }}
          />
          <YAxis
            stroke="rgba(34, 221, 119, 0.5)"
            domain={[0, 5]}
            style={{ fontSize: '11px' }}
          />
          <Tooltip
            contentStyle={{
              background: 'rgba(10, 14, 39, 0.9)',
              border: '1px solid rgba(34, 221, 119, 0.5)',
              borderRadius: '4px',
              color: '#22dd77',
              fontSize: '12px',
            }}
          />
          <Line
            type="monotone"
            dataKey="intensity"
            stroke="#22dd77"
            dot={{ fill: '#22dd77', r: 4 }}
            activeDot={{ r: 6 }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
