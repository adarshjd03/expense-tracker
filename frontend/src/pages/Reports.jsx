import React, { useState } from 'react';
import api from '../api/axios';
import { FileText, Download, TrendingUp, TrendingDown, Calendar } from 'lucide-react';

const Reports = () => {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [filters, setFilters] = useState({
    from: '',
    to: '',
    type: '',
    category_id: '',
  });
  const [categories, setCategories] = useState([]);

  useState(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        setCategories(res.data);
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    };
    fetchCategories();
  }, []);

  const handleGenerateReport = async (e) => {
    e.preventDefault();
    if (!filters.from || !filters.to) {
      alert('Please select both start and end dates.');
      return;
    }
    
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('from', filters.from);
      params.append('to', filters.to);
      if (filters.type) params.append('type', filters.type);
      if (filters.category_id) params.append('category_id', filters.category_id);

      const res = await api.get(`/reports?${params.toString()}`);
      setReport(res.data);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to generate report.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!report || !report.transactions) return;

    const headers = ['Date', 'Type', 'Category', 'Amount', 'Note'];
    const rows = report.transactions.map((t) => [
      t.date,
      t.type,
      t.category_name,
      t.amount,
      t.note || '',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expense-report-${filters.from}-to-${filters.to}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const setQuickRange = (range) => {
    const today = new Date();
    let from, to;

    switch (range) {
      case 'this-month':
        from = new Date(today.getFullYear(), today.getMonth(), 1);
        to = today;
        break;
      case 'last-month':
        from = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        to = new Date(today.getFullYear(), today.getMonth(), 0);
        break;
      case 'last-3-months':
        from = new Date(today.getFullYear(), today.getMonth() - 3, 1);
        to = today;
        break;
      case 'this-year':
        from = new Date(today.getFullYear(), 0, 1);
        to = today;
        break;
      default:
        return;
    }

    setFilters({
      ...filters,
      from: from.toISOString().slice(0, 10),
      to: to.toISOString().slice(0, 10),
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-100">Expense Reports</h2>
        <p className="text-sm text-slate-400 mt-1">Generate detailed financial reports with custom filters</p>
      </div>

      {/* Filter Form */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <form onSubmit={handleGenerateReport} className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setQuickRange('this-month')}
              className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-xs font-medium transition-all"
            >
              This Month
            </button>
            <button
              type="button"
              onClick={() => setQuickRange('last-month')}
              className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-xs font-medium transition-all"
            >
              Last Month
            </button>
            <button
              type="button"
              onClick={() => setQuickRange('last-3-months')}
              className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-xs font-medium transition-all"
            >
              Last 3 Months
            </button>
            <button
              type="button"
              onClick={() => setQuickRange('this-year')}
              className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-xs font-medium transition-all"
            >
              This Year
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">From Date</label>
              <input
                type="date"
                value={filters.from}
                onChange={(e) => setFilters({ ...filters, from: e.target.value })}
                required
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">To Date</label>
              <input
                type="date"
                value={filters.to}
                onChange={(e) => setFilters({ ...filters, to: e.target.value })}
                required
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Type</label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Types</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Category</label>
              <select
                value={filters.category_id}
                onChange={(e) => setFilters({ ...filters, category_id: e.target.value })}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name} ({cat.type})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white rounded-lg text-sm font-semibold transition-all flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Generating...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  Generate Report
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Report Results */}
      {report && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label: 'Total Income', value: `₹${report.summary.totalIncome}`, color: 'text-emerald-400' },
              { label: 'Total Expense', value: `₹${report.summary.totalExpense}`, color: 'text-rose-400' },
              {
                label: 'Net',
                value: `₹${report.summary.net}`,
                color: report.summary.net >= 0 ? 'text-emerald-400' : 'text-rose-400',
              },
              { label: 'Transactions', value: report.summary.transactionCount, color: 'text-slate-100' },
              { label: 'Savings Rate', value: `${report.summary.savingsRate}%`, color: 'text-indigo-400' },
            ].map((s) => (
              <div key={s.label} className="bg-slate-800 border border-slate-700 rounded-xl p-4 text-center">
                <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-slate-400 mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Export Button */}
          <div className="flex justify-end">
            <button
              onClick={handleExportCSV}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-sm font-semibold transition-all flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>

          {/* Category Breakdown */}
          {report.byCategory.length > 0 && (
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-slate-100 mb-4">Spending by Category</h3>
              <div className="space-y-3">
                {report.byCategory.map((cat) => (
                  <div key={cat.category}>
                    <div className="flex items-center justify-between text-sm mb-1.5">
                      <span className="text-slate-300 font-medium">{cat.category}</span>
                      <span className="text-slate-100 font-semibold">₹{cat.total}</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-indigo-500 h-2 rounded-full transition-all"
                        style={{ width: `${cat.percentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{cat.percentage}% of total expenses</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Monthly Breakdown */}
          {report.byMonth.length > 0 && (
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-slate-100 mb-4">Monthly Breakdown</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left px-4 py-2 text-sm font-semibold text-slate-300">Month</th>
                      <th className="text-right px-4 py-2 text-sm font-semibold text-slate-300">Income</th>
                      <th className="text-right px-4 py-2 text-sm font-semibold text-slate-300">Expense</th>
                      <th className="text-right px-4 py-2 text-sm font-semibold text-slate-300">Net</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {report.byMonth.map((m) => {
                      const net = m.income - m.expense;
                      return (
                        <tr key={m.month} className="hover:bg-slate-700/30 transition-colors">
                          <td className="px-4 py-2 text-slate-200">{m.month}</td>
                          <td className="px-4 py-2 text-right text-emerald-400 font-mono">
                            ₹{m.income.toFixed(2)}
                          </td>
                          <td className="px-4 py-2 text-right text-rose-400 font-mono">
                            ₹{m.expense.toFixed(2)}
                          </td>
                          <td className={`px-4 py-2 text-right font-mono font-semibold ${net >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {net >= 0 ? '+' : ''}₹{net.toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Top Expenses */}
          {report.topExpenses.length > 0 && (
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-slate-100 mb-4">Top 5 Expenses</h3>
              <div className="space-y-3">
                {report.topExpenses.map((tx, idx) => (
                  <div key={tx.id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center justify-center w-7 h-7 bg-slate-600 text-slate-300 rounded-full text-xs font-bold">
                        {idx + 1}
                      </span>
                      <div>
                        <p className="text-slate-100 font-medium">{tx.category_name}</p>
                        <p className="text-xs text-slate-400">{tx.date} {tx.note && `• ${tx.note}`}</p>
                      </div>
                    </div>
                    <p className="text-rose-400 font-bold font-mono">₹{tx.amount.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All Transactions */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-slate-100 mb-4">
              All Transactions ({report.transactions.length})
            </h3>
            <div className="max-h-96 overflow-y-auto">
              <table className="w-full">
                <thead className="sticky top-0 bg-slate-800">
                  <tr className="border-b border-slate-700">
                    <th className="text-left px-4 py-2 text-xs font-semibold text-slate-300">Date</th>
                    <th className="text-left px-4 py-2 text-xs font-semibold text-slate-300">Category</th>
                    <th className="text-left px-4 py-2 text-xs font-semibold text-slate-300">Note</th>
                    <th className="text-right px-4 py-2 text-xs font-semibold text-slate-300">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {report.transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-700/30 transition-colors">
                      <td className="px-4 py-2 text-sm text-slate-300">{tx.date}</td>
                      <td className="px-4 py-2 text-sm text-slate-200">{tx.category_name}</td>
                      <td className="px-4 py-2 text-sm text-slate-400 truncate max-w-xs">{tx.note || '—'}</td>
                      <td
                        className={`px-4 py-2 text-sm text-right font-mono font-semibold ${tx.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}
                      >
                        {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!report && !loading && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-12 text-center">
          <Calendar className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-300 mb-2">No Report Generated Yet</h3>
          <p className="text-sm text-slate-400">
            Select a date range and filters above to generate your expense report
          </p>
        </div>
      )}
    </div>
  );
};

export default Reports;
