import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Target, Plus, X, Edit2, Check, PlusCircle } from 'lucide-react';

const statusColors = {
  active: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30',
  completed: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30',
  cancelled: 'bg-slate-500/10 text-slate-400 border border-slate-500/30',
};

const emptyForm = {
  name: '',
  target_amount: '',
  current_amount: '',
  deadline: '',
};

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [contributeGoalId, setContributeGoalId] = useState(null);
  const [contributeAmount, setContributeAmount] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const fetchGoals = async () => {
    try {
      const params = filterStatus ? `?status=${filterStatus}` : '';
      const res = await api.get(`/goals${params}`);
      setGoals(res.data);
    } catch (err) {
      console.error('Failed to load goals', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, [filterStatus]);

  const openAddForm = () => {
    setEditingGoal(null);
    setFormData(emptyForm);
    setShowForm(true);
  };

  const openEditForm = (goal) => {
    setEditingGoal(goal);
    setFormData({
      name: goal.name,
      target_amount: goal.target_amount,
      current_amount: goal.current_amount,
      deadline: goal.deadline || '',
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingGoal) {
        await api.put(`/goals/${editingGoal.id}`, formData);
      } else {
        await api.post('/goals', formData);
      }
      setShowForm(false);
      setEditingGoal(null);
      setFormData(emptyForm);
      fetchGoals();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save goal.');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this goal?')) return;
    try {
      await api.delete(`/goals/${id}`);
      fetchGoals();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete goal.');
    }
  };

  const handleContribute = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/goals/${contributeGoalId}/contribute`, { amount: parseFloat(contributeAmount) });
      setContributeGoalId(null);
      setContributeAmount('');
      fetchGoals();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to add contribution.');
    }
  };

  const getProgressColor = (progress) => {
    if (progress >= 100) return 'bg-emerald-500';
    if (progress >= 60) return 'bg-indigo-500';
    if (progress >= 30) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  const activeGoals = goals.filter(g => g.status === 'active');
  const completedGoals = goals.filter(g => g.status === 'completed');
  const totalTargeted = goals.reduce((s, g) => s + g.target_amount, 0);
  const totalSaved = goals.reduce((s, g) => s + g.current_amount, 0);

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
          <h2 className="text-2xl font-bold text-slate-100">Goals</h2>
          <p className="text-sm text-slate-400 mt-1">Track your savings targets</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Goals</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          {!showForm && (
            <button
              onClick={openAddForm}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> New Goal
            </button>
          )}
        </div>
      </div>

      {/* Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Goals', value: goals.length, color: 'text-slate-100' },
          { label: 'Active', value: activeGoals.length, color: 'text-indigo-400' },
          { label: 'Completed', value: completedGoals.length, color: 'text-emerald-400' },
          { label: 'Total Saved', value: `₹${totalSaved.toFixed(2)}`, color: 'text-amber-400' },
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
            <h3 className="text-lg font-semibold text-slate-100">{editingGoal ? 'Edit Goal' : 'New Goal'}</h3>
            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-200">
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-2">Goal Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g. Emergency Fund, Vacation, New Laptop"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Target Amount (₹)</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={formData.target_amount}
                onChange={(e) => setFormData({ ...formData, target_amount: e.target.value })}
                required
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Current Amount (₹)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.current_amount}
                onChange={(e) => setFormData({ ...formData, current_amount: e.target.value })}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Target Date (optional)</label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            {editingGoal && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Status</label>
                <select
                  value={formData.status || editingGoal.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            )}
            <div className={`flex justify-end gap-3 ${editingGoal ? '' : 'md:col-span-2'}`}>
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
                {editingGoal ? 'Update Goal' : 'Create Goal'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Contribute Modal */}
      {contributeGoalId && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-100">Add Contribution</h3>
              <button onClick={() => setContributeGoalId(null)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleContribute} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Amount (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={contributeAmount}
                  onChange={(e) => setContributeAmount(e.target.value)}
                  required
                  autoFocus
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="0.00"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setContributeGoalId(null)}
                  className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-sm font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold transition-all"
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {goals.length === 0 ? (
          <div className="col-span-full bg-slate-800 border border-slate-700 rounded-xl p-8 text-center">
            <Target className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No goals yet. Create your first savings goal!</p>
          </div>
        ) : (
          goals.map((goal) => (
            <div key={goal.id} className="bg-slate-800 border border-slate-700 rounded-xl p-5 hover:border-slate-600 transition-all flex flex-col gap-4">
              {/* Top */}
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h4 className="text-lg font-semibold text-slate-100 truncate">{goal.name}</h4>
                  {goal.deadline && (
                    <p className="text-xs text-slate-400 mt-0.5">
                      Target: {new Date(goal.deadline).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <span className={`ml-3 text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${statusColors[goal.status]}`}>
                  {goal.status.charAt(0).toUpperCase() + goal.status.slice(1)}
                </span>
              </div>

              {/* Progress */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-300 font-medium">₹{goal.current_amount.toFixed(2)}</span>
                  <span className="text-slate-400">of ₹{goal.target_amount.toFixed(2)}</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full transition-all ${getProgressColor(goal.progress)}`}
                    style={{ width: `${Math.min(goal.progress, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1.5 text-xs text-slate-400">
                  <span>{goal.progress}% saved</span>
                  <span>₹{(goal.target_amount - goal.current_amount).toFixed(2)} to go</span>
                </div>
              </div>

              {/* Actions */}
              {goal.status === 'active' && (
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => setContributeGoalId(goal.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 rounded-lg text-xs font-semibold transition-all border border-indigo-500/30"
                  >
                    <PlusCircle className="w-3.5 h-3.5" /> Contribute
                  </button>
                  <button
                    onClick={() => openEditForm(goal)}
                    className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-all"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(goal.id)}
                    className="px-3 py-1.5 bg-slate-700 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-lg transition-all"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
              {goal.status === 'completed' && (
                <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium">
                  <Check className="w-4 h-4" />
                  <span>Goal achieved!</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Goals;
