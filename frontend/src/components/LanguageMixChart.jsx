/**
 * LanguageMixChart.jsx — EN/SW/Sheng % PieChart
 */
import { PieChart, Pie, Cell, Legend, ResponsiveContainer, Tooltip } from 'recharts'
import styles from './LanguageMixChart.module.css'

const COLORS = ['#22dd77', '#ff6666', '#00d9ff']

export default function LanguageMixChart({ mix = ['en'] }) {
  // Default data
  const data = [
    { name: 'English', value: 60 },
    { name: 'Swahili', value: 30 },
    { name: 'Sheng', value: 10 },
  ]

  return (
    <div className={styles.container}>
      <div className={styles.title}>Language Mix</div>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={30}
            outerRadius={60}
            paddingAngle={2}
            dataKey="value"
            label={({ name, value }) => `${name} ${value}%`}
            labelLine={false}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: 'rgba(10, 14, 39, 0.9)',
              border: '1px solid rgba(34, 221, 119, 0.5)',
              borderRadius: '4px',
              color: '#22dd77',
              fontSize: '11px',
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
