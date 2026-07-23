import React, { useState } from 'react';

const TransactionList = ({
  transactions,
  categories,
  filters,
  onFilterChange,
  onEdit,
  onDelete,
}) => {
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(val);
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h3 className="text-lg font-semibold text-slate-200">Transaction History</h3>

        {/* Filters */}
        <div className="grid grid-cols-2 md:flex items-center gap-2">
          {/* Type filter */}
          <select
            value={filters.type}
            onChange={(e) => onFilterChange({ ...filters, type: e.target.value })}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>

          {/* Category filter */}
          <select
            value={filters.category_id}
            onChange={(e) => onFilterChange({ ...filters, category_id: e.target.value })}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* From date */}
          <input
            type="date"
            value={filters.from}
            onChange={(e) => onFilterChange({ ...filters, from: e.target.value })}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            placeholder="From"
          />

          {/* To date */}
          <input
            type="date"
            value={filters.to}
            onChange={(e) => onFilterChange({ ...filters, to: e.target.value })}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            placeholder="To"
          />

          {(filters.type || filters.category_id || filters.from || filters.to) && (
            <button
              onClick={() => onFilterChange({ type: '', category_id: '', from: '', to: '' })}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium px-2"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {transactions.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-slate-700 rounded-lg">
          <p className="text-slate-400 font-medium">No transactions found</p>
          <p className="text-slate-500 text-xs mt-1">Add your first transaction above or clear your filters.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/50 text-slate-400 uppercase text-xs tracking-wider border-b border-slate-700">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Note</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-700/30 transition-all">
                  <td className="py-3 px-4 whitespace-nowrap text-slate-400 text-xs font-mono">{tx.date}</td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-700 text-slate-200">
                      {tx.category_name || 'Uncategorized'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-300 max-w-xs truncate">{tx.note || '—'}</td>
                  <td className={`py-3 px-4 text-right font-semibold whitespace-nowrap ${tx.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </td>
                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    {deleteConfirmId === tx.id ? (
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-xs text-rose-400">Confirm?</span>
                        <button
                          onClick={() => {
                            onDelete(tx.id);
                            setDeleteConfirmId(null);
                          }}
                          className="px-2 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded text-xs"
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-2 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded text-xs"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => onEdit(tx)}
                          className="text-slate-400 hover:text-indigo-400 text-xs font-medium transition-all"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(tx.id)}
                          className="text-slate-400 hover:text-rose-400 text-xs font-medium transition-all"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TransactionList;
