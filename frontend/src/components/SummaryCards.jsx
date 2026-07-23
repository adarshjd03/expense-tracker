import React from 'react';

const SummaryCards = ({ summary }) => {
  const { totalIncome = 0, totalExpense = 0, balance = 0 } = summary || {};

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(val);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Total Balance */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg hover:border-slate-600 transition-all">
        <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">Total Balance</p>
        <p className={`text-3xl font-bold mt-2 ${balance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
          {formatCurrency(balance)}
        </p>
      </div>

      {/* Income */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg hover:border-slate-600 transition-all">
        <div className="flex items-center justify-between">
          <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">Total Income</p>
          <span className="inline-flex items-center justify-center p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
            ↑
          </span>
        </div>
        <p className="text-3xl font-bold mt-2 text-emerald-400">
          {formatCurrency(totalIncome)}
        </p>
      </div>

      {/* Expense */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg hover:border-slate-600 transition-all">
        <div className="flex items-center justify-between">
          <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">Total Expenses</p>
          <span className="inline-flex items-center justify-center p-2 bg-rose-500/10 text-rose-400 rounded-lg">
            ↓
          </span>
        </div>
        <p className="text-3xl font-bold mt-2 text-rose-400">
          {formatCurrency(totalExpense)}
        </p>
      </div>
    </div>
  );
};

export default SummaryCards;
