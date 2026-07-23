import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = ['#f43f5e', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#64748b'];

const CategoryPieChart = ({ data = [] }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg h-80 flex flex-col items-center justify-center">
        <h3 className="text-lg font-semibold text-slate-200 mb-2">Expenses by Category</h3>
        <p className="text-slate-400 text-sm">No expense data available</p>
      </div>
    );
  }

  const chartData = data.map(item => ({
    name: item.category,
    value: item.total
  }));

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg h-96 flex flex-col">
      <h3 className="text-lg font-semibold text-slate-200 mb-4">Expenses by Category</h3>
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={5}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => `$${Number(value).toFixed(2)}`}
              contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '0.5rem', color: '#f8fafc' }}
            />
            <Legend verticalAlign="bottom" height={36} wrapperStyle={{ color: '#94a3b8', fontSize: '12px' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CategoryPieChart;
