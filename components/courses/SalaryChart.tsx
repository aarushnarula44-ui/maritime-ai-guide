'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface CareerStep {
  rank: string
  code: string
  yearsMin: number
  yearsMax: number
  salaryMin: number
  salaryMax: number
  cocRequired: string | null
}

interface SalaryChartProps {
  career: CareerStep[]
}

export function SalaryChart({ career }: SalaryChartProps) {
  const data = career.map((step) => ({
    name: step.code,
    min: step.salaryMin,
    max: step.salaryMax,
  }))

  return (
    <div>
      <p className="text-sm text-text-secondary mb-4">Monthly salary in USD across career progression</p>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748B' }} />
            <YAxis tick={{ fontSize: 11, fill: '#64748B' }} tickFormatter={(v) => `$${v.toLocaleString()}`} />
            <Tooltip
              formatter={(value) => [`$${Number(value).toLocaleString()}`, '']}
              labelFormatter={(label) => {
                const step = career.find((s) => s.code === label)
                return step ? step.rank : label
              }}
            />
            <Bar dataKey="min" name="Min Salary" fill="#1E3A5F" radius={[4, 4, 0, 0]} />
            <Bar dataKey="max" name="Max Salary" fill="#00D4FF" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center gap-4 mt-3">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-primary" />
          <span className="text-xs text-text-muted">Min salary</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-accent" />
          <span className="text-xs text-text-muted">Max salary</span>
        </div>
      </div>
    </div>
  )
}
