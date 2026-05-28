import { useState } from 'react';
import { useApp } from '../context/useApp';
import { Trash2, Plus, Edit2, X, Eye, Leaf } from 'lucide-react';

const CATEGORIES = ['Tropical', 'Temperate', 'Citrus', 'Berries', 'Stone Fruit', 'Other'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const EMPTY_FORM = {
  name: '',
  category: '',
  seasonStart: '',
  seasonEnd: '',
  description: '',
  unitPrice: '',
  minStock: '',
};

export default function FruitsManagement() {
  const { fruits, addFruit, updateFruit, deleteFruit } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedFruit, setSelectedFruit] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const handleChange = (field) => (e) =>
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.name.trim()) {
      setError('Fruit name is required.');
      return;
    }
    setLoading(true);
    try {
      if (editingId) {
        await updateFruit(editingId, formData);
      } else {
        await addFruit(formData);
      }
      setFormData(EMPTY_FORM);
      setEditingId(null);
      setShowForm(false);
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (fruit) => {
    setFormData({
      name: fruit.name || '',
      category: fruit.category || '',
      seasonStart: fruit.seasonStart || '',
      seasonEnd: fruit.seasonEnd || '',
      description: fruit.description || '',
      unitPrice: fruit.unitPrice !== undefined ? fruit.unitPrice : '',
      minStock: fruit.minStock !== undefined ? fruit.minStock : '',
    });
    setEditingId(fruit.id);
    setShowForm(true);
    setError('');
    setSelectedFruit(null);
  };

  const handleDeleteClick = (id) => {
    setDeletingId(id);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteFruit(deletingId);
      if (selectedFruit?.id === deletingId) setSelectedFruit(null);
      setDeletingId(null);
    } catch (err) {
      setError(err.message || 'Delete failed.');
      setDeletingId(null);
    }
  };

  const handleCancel = () => {
    setFormData(EMPTY_FORM);
    setEditingId(null);
    setShowForm(false);
    setError('');
  };

  const categoryColor = (cat) => {
    const map = {
      Tropical: 'bg-yellow-100 text-yellow-800',
      Temperate: 'bg-blue-100 text-blue-800',
      Citrus: 'bg-orange-100 text-orange-800',
      Berries: 'bg-pink-100 text-pink-800',
      'Stone Fruit': 'bg-purple-100 text-purple-800',
      Other: 'bg-gray-100 text-gray-700',
    };
    return map[cat] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="p-6 bg-gradient-to-b from-green-50 to-white min-h-screen">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800">Fruits Management</h1>
            <p className="text-gray-500 mt-1">{fruits.length} fruit{fruits.length !== 1 ? 's' : ''} registered</p>
          </div>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition"
            >
              <Plus size={20} />
              Add Fruit
            </button>
          )}
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-8 border-l-4 border-green-600">
            <h2 className="text-2xl font-bold mb-5 text-gray-800">
              {editingId ? '✏️ Edit Fruit' : '🌿 Add New Fruit'}
            </h2>

            {error && (
              <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Fruit Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Fruit Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={handleChange('name')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., Mango, Apple, Banana"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={handleChange('category')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select Category</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Season Start / End */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Season Start
                  </label>
                  <select
                    value={formData.seasonStart}
                    onChange={handleChange('seasonStart')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select Month</option>
                    {MONTHS.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Season End
                  </label>
                  <select
                    value={formData.seasonEnd}
                    onChange={handleChange('seasonEnd')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select Month</option>
                    {MONTHS.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Price and Min Stock */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Default Unit Price (LKR/kg)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.unitPrice}
                    onChange={handleChange('unitPrice')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="e.g., 250"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Minimum Stock (kg)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.minStock}
                    onChange={handleChange('minStock')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="e.g., 50"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={handleChange('description')}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Optional: growing tips, characteristics, notes…"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white px-6 py-2 rounded-lg font-semibold transition"
                >
                  {loading ? 'Saving…' : editingId ? 'Update Fruit' : 'Add Fruit'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-2 rounded-lg font-semibold transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Cards */}
        {fruits.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-16 text-center">
            <Leaf size={48} className="mx-auto text-green-300 mb-4" />
            <p className="text-gray-500 text-lg">No fruits added yet. Click "Add Fruit" to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {fruits.map((fruit) => (
              <div
                key={fruit.id}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition p-6 border-t-4 border-green-500"
              >
                {/* Card Header */}
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-bold text-gray-800">{fruit.name}</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedFruit(fruit)}
                      className="text-green-600 hover:text-green-700 transition"
                      title="View Details"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={() => handleEdit(fruit)}
                      className="text-blue-600 hover:text-blue-700 transition"
                      title="Edit"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(fruit.id)}
                      className="text-red-500 hover:text-red-700 transition"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {/* Category badge */}
                {fruit.category && (
                  <span className={`inline-block text-xs font-semibold px-2 py-1 rounded-full mb-3 ${categoryColor(fruit.category)}`}>
                    {fruit.category}
                  </span>
                )}

                {/* Season */}
                {(fruit.seasonStart || fruit.seasonEnd) && (
                  <p className="text-sm text-gray-600 mb-2">
                    <span className="font-semibold">Season:</span>{' '}
                    {fruit.seasonStart || '?'} – {fruit.seasonEnd || '?'}
                  </p>
                )}

                {/* Description */}
                {fruit.description && (
                  <p className="text-gray-500 text-sm line-clamp-2 mb-3">{fruit.description}</p>
                )}

                <p className="text-xs text-gray-400 mt-auto">
                  Added: {new Date(fruit.createdAt).toLocaleDateString('en-LK')}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Detail Modal */}
        {selectedFruit && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto pt-20 pb-6 px-4 flex justify-center items-start">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-2xl font-bold text-gray-800">{selectedFruit.name}</h2>
                <button
                  onClick={() => setSelectedFruit(null)}
                  className="text-gray-400 hover:text-gray-700 transition"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                {selectedFruit.category && (
                  <div>
                    <p className="text-xs text-gray-400 uppercase font-semibold tracking-wide">Category</p>
                    <span className={`inline-block text-sm font-semibold px-3 py-1 rounded-full mt-1 ${categoryColor(selectedFruit.category)}`}>
                      {selectedFruit.category}
                    </span>
                  </div>
                )}

                {(selectedFruit.seasonStart || selectedFruit.seasonEnd) && (
                  <div>
                    <p className="text-xs text-gray-400 uppercase font-semibold tracking-wide">Season</p>
                    <p className="text-gray-700 mt-1">
                      {selectedFruit.seasonStart || 'N/A'} – {selectedFruit.seasonEnd || 'N/A'}
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-xs text-gray-400 uppercase font-semibold tracking-wide">Default Unit Price</p>
                  <p className="text-gray-700 mt-1">LKR {selectedFruit.unitPrice !== undefined ? selectedFruit.unitPrice.toLocaleString('en-LK') : '0.00'} / kg</p>
                </div>

                <div>
                  <p className="text-xs text-gray-400 uppercase font-semibold tracking-wide">Minimum Stock Alert Level</p>
                  <p className="text-gray-700 mt-1">{selectedFruit.minStock !== undefined ? selectedFruit.minStock : 0} kg</p>
                </div>

                {selectedFruit.description && (
                  <div>
                    <p className="text-xs text-gray-400 uppercase font-semibold tracking-wide">Description</p>
                    <p className="text-gray-700 mt-1">{selectedFruit.description}</p>
                  </div>
                )}

                <div>
                  <p className="text-xs text-gray-400 uppercase font-semibold tracking-wide">Added On</p>
                  <p className="text-gray-700 mt-1">
                    {new Date(selectedFruit.createdAt).toLocaleDateString('en-LK', {
                      year: 'numeric', month: 'long', day: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => { handleEdit(selectedFruit); setSelectedFruit(null); }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition"
                >
                  Edit
                </button>
                <button
                  onClick={() => setSelectedFruit(null)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deletingId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto pt-20 pb-6 px-4 flex justify-center items-start">
            <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 text-center">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Confirm Delete</h3>
              <p className="text-gray-500 mb-6">Are you sure you want to delete this fruit? This action cannot be undone.</p>
              <div className="flex gap-3">
                <button
                  onClick={handleConfirmDelete}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition"
                >
                  Yes, Delete
                </button>
                <button
                  onClick={() => setDeletingId(null)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
