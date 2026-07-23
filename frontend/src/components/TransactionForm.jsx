import React, { useState, useEffect } from 'react';

const TransactionForm = ({ categories, onSubmit, initialData = null, onCancel = null }) => {
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [categoryId, setCategoryId] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setAmount(initialData.amount);
      setType(initialData.type);
      setCategoryId(initialData.category_id || '');
      setNote(initialData.note || '');
      setDate(initialData.date);
    }
  }, [initialData]);

  const filteredCategories = categories.filter((c) => c.type === type);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid positive amount.');
      return;
    }
    if (!date) {
      setError('Please select a date.');
      return;
    }

    onSubmit({
      amount: parsedAmount,
      type,
      category_id: categoryId ? parseInt(categoryId, 10) : null,
      note,
      date,
    });

    if (!initialData) {
      setAmount('');
      setNote('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg mb-8">
      <h3 className="text-lg font-semibold text-slate-200 mb-4">
        {initialData ? 'Edit Transaction' : 'Add New Transaction'}
      </h3>

      {error && (
        <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Type */}
        <div>
          <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
            Type
          </label>
          <select
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              setCategoryId('');
            }}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500 text-sm"
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </div>

        {/* Amount */}
        <div>
          <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
            Amount ($)
          </label>
          <input
            type="number"
            step="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500 text-sm"
            required
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
            Category
          </label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500 text-sm"
          >
            <option value="">Select Category</option>
            {filteredCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Date */}
        <div>
          <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
            Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500 text-sm"
            required
          />
        </div>

        {/* Note */}
        <div className="md:col-span-2 lg:col-span-1">
          <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
            Note / Description
          </label>
          <input
            type="text"
            placeholder="e.g. Groceries, Rent..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500 text-sm"
          />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-end gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-sm font-medium transition-all"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold transition-all shadow-md hover:shadow-indigo-500/25"
        >
          {initialData ? 'Save Changes' : 'Add Transaction'}
        </button>
      </div>
    </form>
  );
};

export default TransactionForm;
