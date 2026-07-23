import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import SummaryCards from '../components/SummaryCards';
import CategoryPieChart from '../components/CategoryPieChart';
import MonthlyBarChart from '../components/MonthlyBarChart';

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    try {
      setError('');
      const summaryRes = await api.get('/summary');
      setSummary(summaryRes.data);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
      setError('Failed to load financial data. Please refresh.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
          <p className="text-sm text-slate-400">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-100">Dashboard</h2>
        <p className="text-sm text-slate-400 mt-1">Overview of your financial health</p>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <SummaryCards summary={summary} />

      {/* Charts Side-by-Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryPieChart data={summary?.byCategory} />
        <MonthlyBarChart data={summary?.byMonth} />
      </div>

      {/* Budget Status */}
      {summary?.budgets && summary.budgets.length > 0 && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-slate-100 mb-4">Current Month Budget Status</h3>
          <div className="space-y-3">
            {summary.budgets.map((budget) => {
              const percentage = budget.amount_limit > 0 ? (budget.spent / budget.amount_limit) * 100 : 0;
              const getColor = (pct) => {
                if (pct >= 100) return 'bg-rose-500';
                if (pct >= 80) return 'bg-amber-500';
                return 'bg-emerald-500';
              };
              return (
                <div key={budget.id}>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="text-slate-300 font-medium">{budget.category_name}</span>
                    <span className="text-slate-100 font-semibold">
                      ₹{budget.spent.toFixed(2)} / ₹{budget.amount_limit.toFixed(2)}
                    </span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${getColor(percentage)}`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{percentage.toFixed(1)}% spent</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
