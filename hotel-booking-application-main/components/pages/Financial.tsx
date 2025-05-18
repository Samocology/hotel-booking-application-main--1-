'use client'
import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts'

export default function Financials() {
  const [loading, setLoading] = useState(true)
  const [financialData, setFinancialData] = useState<any>(null)

  const fetchData = async () => {
    try {
      const res = await fetch('/api/financials')
      const data = await res.json()
      setFinancialData(data)
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch financial data', error)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 30000) // poll every 30s
    return () => clearInterval(interval)
  }, [])

  if (loading) return <div className="p-4 text-center">Loading financial data...</div>

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold">Financial Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <h2 className="text-lg font-semibold">Total Revenue</h2>
            <p className="text-xl font-bold">₦{financialData.totalRevenue.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <h2 className="text-lg font-semibold">Total Expenses</h2>
            <p className="text-xl font-bold">₦{financialData.totalExpenses.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <h2 className="text-lg font-semibold">Net Profit</h2>
            <p className="text-xl font-bold text-green-600">₦{financialData.netProfit.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      {/* Sales Over Time */}
      <div className="bg-white p-4 rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-2">Sales Over Time</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={financialData.salesOverTime}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="sales" stroke="#8884d8" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Revenue Breakdown */}
      <div className="bg-white p-4 rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-2">Revenue Breakdown</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={financialData.revenueBreakdown}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="source" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="amount" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
