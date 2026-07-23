import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import TransactionForm from '../components/TransactionForm';
import TransactionList from '../components/TransactionList';
import { Receipt } from 'lucide-react';

const Transactions = () => {
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  const [filters, setFilters] = useState({
    type: '',
    category_id: '',
    from: '',
    to: '',
  });

  const fetchData = useCallback(async () => {
    try {
      setError('');

      const queryParams = new URLSearchParams();
      if (filters.type) queryParams.append('type', filters.type);
      if (filters.category_id) queryParams.append('category_id', filters.category_id);
      if (filters.from) queryParams.append('from', filters.from);
      if (filters.to) queryParams.append('to', filters.to);

      const [categoriesRes, transactionsRes] = await Promise.all([
        api.get('/categories'),
        api.get(`/transactions?${queryParams.toString()}`),
      ]);

      setCategories(categoriesRes.data);
      setTransactions(transactionsRes.data);
    } catch (err) {
      console.error('Failed to load transactions', err);
      setError('Failed to load transactions. Please refresh.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddTransaction = async (formData) => {
    try {
      await api.post('/transactions', formData);
      setShowAddForm(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to add transaction.');
    }
  };

  const handleUpdateTransaction = async (formData) => {
    if (!editingTransaction) return;
    try {
      await api.put(`/transactions/${editingTransaction.id}`, formData);
      setEditingTransaction(null);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update transaction.');
    }
  };

  const handleDeleteTransaction = async (id) => {
    try {
      await api.delete(`/transactions/${id}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete transaction.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-100">Transactions</h2>
          <p className="text-sm text-slate-400 mt-1">Manage your income and expenses</p>
        </div>
        {!showAddForm && !editingTransaction && (
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold transition-all shadow-md hover:shadow-indigo-500/25 flex items-center gap-1.5"
          >
            <span>+</span> Add Transaction
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Add Form */}
      {showAddForm && (
        <TransactionForm
          categories={categories}
          onSubmit={handleAddTransaction}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {/* Edit Form */}
      {editingTransaction && (
        <TransactionForm
          categories={categories}
          initialData={editingTransaction}
          onSubmit={handleUpdateTransaction}
          onCancel={() => setEditingTransaction(null)}
        />
      )}

      {/* Transaction List */}
      {transactions.length === 0 && !showAddForm && !editingTransaction ? (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-12 text-center">
          <Receipt className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-300 mb-2">No Transactions Yet</h3>
          <p className="text-sm text-slate-400 mb-4">Start tracking your finances by adding your first transaction</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold transition-all"
          >
            Add Transaction
          </button>
        </div>
      ) : (
        <TransactionList
          transactions={transactions}
          categories={categories}
          filters={filters}
          onFilterChange={setFilters}
          onEdit={(tx) => {
            setShowAddForm(false);
            setEditingTransaction(tx);
          }}
          onDelete={handleDeleteTransaction}
        />
      )}
    </div>
  );
};

export default Transactions;
