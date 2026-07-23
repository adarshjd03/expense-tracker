import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { TrendingUp, TrendingDown, Plus, X, Edit2 } from 'lucide-react';

const emptyForm = {
  name: '',
  type: '',
  amount: '',
  current_value: '',
  purchase_date: '',
  notes: '',
};

const Investments = () => {
  const [data, setData] = useState({ investments: [], summary: {} });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [filterType, setFilterType] = useState('');

  const fetchInvestments = async () => {
    try {
      const params = filterType ? `?type=${filterType}` : '';
      const res = await api.get(`/investments${params}`);
      setData(res.data);
    } catch (err) {
      console.error('Failed to load investments', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvestments();
  }, [filterType]);

  const openAddForm = () => {
    setEditingInvestment(null);
    setFormData(emptyForm);
    setShowForm(true);
  };

  const openEditForm = (investment) => {
    setEditingInvestment(investment);
    setFormData({
      name: investment.name,
      type: investment.type,
      amount: investment.amount,
      current_value: investment.current_value,
      purchase_date: investment.purchase_date,
      notes: investment.notes || '',
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingInvestment) {
        await api.put(`/investments/${editingInvestment.id}`, formData);
      } else {
        await api.post('/investments', formData);
      }
      setShowForm(false);
      setEditingInvestment(null);
      setFormData(emptyForm);
      fetchInvestments();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save investment.');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this investment?')) return;
    try {
      await api.delete(`/investments/${id}`);
      fetchInvestments();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete investment.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const { investments, summary } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-100">Investments</h2>
          <p className="text-sm text-slate-400 mt-1">Track your investment portfolio</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Types</option>
            <option value="Stocks">Stocks</option>
            <option value="Bonds">Bonds</option>
            <option value="Crypto">Crypto</option>
            <option value="Real Estate">Real Estate</option>
            <option value="Mutual Funds">Mutual Funds</option>
            <option value="ETF">ETF</option>
            <option value="Other">Other</option>
          </select>
          {!showForm && (
            <button
              onClick={openAddForm}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Investment
            </button>
          )}
        </div>
      </div>

      {/* Portfolio Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Invested', value: `₹${summary.totalInvested?.toFixed(2) || '0.00'}`, color: 'text-slate-100' },
          { label: 'Current Value', value: `₹${summary.totalCurrentValue?.toFixed(2) || '0.00'}`, color: 'text-indigo-400' },
          {
            label: 'Total Gain/Loss',
            value: `₹${summary.totalGain?.toFixed(2) || '0.00'}`,
            color: (summary.totalGain || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400',
          },
          {
            label: 'Total ROI',
            value: `${summary.totalRoi?.toFixed(2) || '0.00'}%`,
            color: (summary.totalRoi || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400',
          },
        ].map((s) => (
          <div key={s.label} className="bg-slate-800 border border-slate-700 rounded-xl p-4 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Add / Edit Form */}
      {showForm && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-100">
              {editingInvestment ? 'Edit Investment' : 'Add Investment'}
            </h3>
            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-200">
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Investment Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g. Apple Stock, Bitcoin"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                required
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select Type</option>
                <option value="Stocks">Stocks</option>
                <option value="Bonds">Bonds</option>
                <option value="Crypto">Crypto</option>
                <option value="Real Estate">Real Estate</option>
                <option value="Mutual Funds">Mutual Funds</option>
                <option value="ETF">ETF</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Initial Investment (₹)</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Current Value (₹)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.current_value}
                onChange={(e) => setFormData({ ...formData, current_value: e.target.value })}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Purchase Date</label>
              <input
                type="date"
                value={formData.purchase_date}
                onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                required
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Notes (optional)</label>
              <input
                type="text"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Additional details"
              />
            </div>
            <div className="md:col-span-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-sm font-semibold transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold transition-all"
              >
                {editingInvestment ? 'Update' : 'Add Investment'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Investments Table */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
        {investments.length === 0 ? (
          <div className="p-8 text-center">
            <TrendingUp className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No investments recorded yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-700/50 border-b border-slate-700">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Invested
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Current Value
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Gain/Loss
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    ROI
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {investments.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-slate-100">{inv.name}</p>
                        {inv.notes && <p className="text-xs text-slate-400 mt-0.5">{inv.notes}</p>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-300 text-sm">{inv.type}</td>
                    <td className="px-4 py-3 text-right text-slate-300 text-sm font-mono">
                      ₹{inv.amount.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-100 text-sm font-mono font-semibold">
                      ₹{inv.current_value.toFixed(2)}
                    </td>
                    <td className={`px-4 py-3 text-right text-sm font-mono font-semibold ${inv.gain >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {inv.gain >= 0 ? '+' : ''}₹{inv.gain.toFixed(2)}
                    </td>
                    <td className={`px-4 py-3 text-right text-sm font-bold flex items-center justify-end gap-1 ${inv.roi >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {inv.roi >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      {inv.roi >= 0 ? '+' : ''}{inv.roi}%
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEditForm(inv)}
                          className="px-2 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded transition-all"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(inv.id)}
                          className="px-2 py-1 bg-slate-700 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded transition-all"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Investments;
