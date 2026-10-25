import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Edit, Trash2, Shield, BookOpen, Check, X, Layers
} from 'lucide-react';
import { guidesAPI, categoriesAPI } from '../api';
import { useAuth } from '../context/AuthContext';

export default function Admin() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [guides, setGuides] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingGuide, setEditingGuide] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    title_hi: '',
    title_mr: '',
    description: '',
    description_hi: '',
    description_mr: '',
    category_id: '',
    difficulty: 'Easy',
    tags: '',
    steps_json: '[\n  {"step_number": 1, "title": "Step 1", "instruction": "Do this action."}\n]',
    safety_tips_json: '[]'
  });

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      alert("Access restricted: Administrator rights required.");
      navigate('/');
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);
        const [guidesData, catsData] = await Promise.all([
          guidesAPI.getGuides(),
          categoriesAPI.getCategories()
        ]);
        setGuides(guidesData);
        setCategories(catsData);
        if (catsData.length > 0 && !formData.category_id) {
          setFormData((prev) => ({ ...prev, category_id: catsData[0].id }));
        }
      } catch (err) {
        console.warn('Admin load error:', err.message);
      } finally {
        setLoading(false);
      }
    };

    if (isAdmin) {
      loadData();
    }
  }, [isAdmin, authLoading, navigate]);

  const handleOpenAdd = () => {
    setEditingGuide(null);
    setFormData({
      title: '',
      title_hi: '',
      title_mr: '',
      description: '',
      description_hi: '',
      description_mr: '',
      category_id: categories[0]?.id || '',
      difficulty: 'Easy',
      tags: '',
      steps_json: '[\n  {"step_number": 1, "title": "Step 1", "instruction": "Open the application."}\n]',
      safety_tips_json: '[]'
    });
    setShowModal(true);
  };

  const handleOpenEdit = (guide) => {
    setEditingGuide(guide);
    setFormData({
      title: guide.title,
      title_hi: guide.title_hi || '',
      title_mr: guide.title_mr || '',
      description: guide.description,
      description_hi: guide.description_hi || '',
      description_mr: guide.description_mr || '',
      category_id: guide.category_id,
      difficulty: guide.difficulty || 'Easy',
      tags: guide.tags || '',
      steps_json: typeof guide.steps_json === 'string' ? guide.steps_json : JSON.stringify(guide.steps_json, null, 2),
      safety_tips_json: typeof guide.safety_tips_json === 'string' ? guide.safety_tips_json : JSON.stringify(guide.safety_tips_json, null, 2)
    });
    setShowModal(true);
  };

  const handleDelete = async (guideId) => {
    if (!window.confirm("Are you sure you want to delete this guide?")) return;
    try {
      await guidesAPI.deleteGuide(guideId);
      setGuides((prev) => prev.filter((g) => g.id !== guideId));
    } catch (err) {
      alert("Delete failed: " + err.message);
    }
  };

  const handleSaveGuide = async (e) => {
    e.preventDefault();
    try {
      // Validate JSON
      JSON.parse(formData.steps_json);
      if (formData.safety_tips_json) JSON.parse(formData.safety_tips_json);

      const payload = {
        ...formData,
        category_id: Number(formData.category_id)
      };

      if (editingGuide) {
        const updated = await guidesAPI.updateGuide(editingGuide.id, payload);
        setGuides((prev) => prev.map((g) => g.id === editingGuide.id ? updated : g));
      } else {
        const created = await guidesAPI.createGuide(payload);
        setGuides((prev) => [created, ...prev]);
      }
      setShowModal(false);
    } catch (err) {
      alert("Error saving guide: " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-3">
        <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="font-semibold text-slate-600 dark:text-slate-400">Loading admin portal...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-bold mb-2">
            <Shield className="w-4 h-4" />
            <span>Administrator Control Center</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            Manage Technology Guides
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Add, update, or remove guides and categories across English, Hindi, and Marathi.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-sm shadow-md transition"
        >
          <Plus className="w-5 h-5" />
          <span>Add New Guide</span>
        </button>
      </div>

      {/* Guides Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                <th className="py-4 px-6">ID</th>
                <th className="py-4 px-6">Title (English)</th>
                <th className="py-4 px-6">Hindi Title</th>
                <th className="py-4 px-6">Category</th>
                <th className="py-4 px-6">Difficulty</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              {guides.map((g) => (
                <tr key={g.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td className="py-4 px-6 font-mono text-xs text-slate-400">{g.id}</td>
                  <td className="py-4 px-6 font-bold text-slate-900 dark:text-white">{g.title}</td>
                  <td className="py-4 px-6 text-slate-600 dark:text-slate-400">{g.title_hi || "—"}</td>
                  <td className="py-4 px-6">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300">
                      {g.category?.name || "General"}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {g.difficulty || "Easy"}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right space-x-2 whitespace-nowrap">
                    <button
                      onClick={() => handleOpenEdit(g)}
                      className="p-2 text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950 rounded-xl transition"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(g.id)}
                      className="p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-xl transition"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Guide Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {editingGuide ? 'Edit Guide' : 'Create New Technology Guide'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSaveGuide} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                    Title (English) *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                    Title (Hindi)
                  </label>
                  <input
                    type="text"
                    value={formData.title_hi}
                    onChange={(e) => setFormData({ ...formData, title_hi: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                  Title (Marathi)
                </label>
                <input
                  type="text"
                  value={formData.title_mr}
                  onChange={(e) => setFormData({ ...formData, title_mr: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                    Difficulty
                  </label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                  Steps (Valid JSON Array) *
                </label>
                <textarea
                  value={formData.steps_json}
                  onChange={(e) => setFormData({ ...formData, steps_json: e.target.value })}
                  rows={4}
                  required
                  className="w-full font-mono text-xs px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow transition"
                >
                  Save Guide
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
