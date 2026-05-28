import { useState } from 'react';
import { useApp } from '../context/useApp';
import { Trash2, Plus, Edit2, X, Eye, MapPin } from 'lucide-react';

const SOIL_TYPES = ['Clay', 'Sandy', 'Loam', 'Laterite', 'Mixed', 'Other'];
const WATER_SOURCES = ['Well', 'Canal', 'River', 'Rainwater', 'Irrigation System', 'Other'];
const STATUS_OPTIONS = ['Active', 'Inactive', 'Under Maintenance', 'Fallow'];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 50 }, (_, i) => CURRENT_YEAR - i);

const EMPTY_FORM = {
  name: '',
  location: '',
  area: '',
  elevation: '',
  soilType: '',
  waterSource: '',
  assignedFruit: '',
  numberOfTrees: '',
  plantingYear: '',
  status: 'Active',
  notes: '',
};

const statusColor = (s) =>
  ({ Active: 'bg-green-100 text-green-800', Inactive: 'bg-gray-100 text-gray-700', 'Under Maintenance': 'bg-yellow-100 text-yellow-800', Fallow: 'bg-orange-100 text-orange-800' }[s] || 'bg-gray-100 text-gray-700');

export default function OrchardBlocksManagement() {
  const { orchardBlocks, fruits, addOrchardBlock, updateOrchardBlock, deleteOrchardBlock } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const set = (field) => (e) => setFormData((p) => ({ ...p, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.name.trim()) { setError('Block name is required.'); return; }
    setSaving(true);
    try {
      if (editingId) {
        await updateOrchardBlock(editingId, formData);
      } else {
        await addOrchardBlock(formData);
      }
      setFormData(EMPTY_FORM);
      setEditingId(null);
      setShowForm(false);
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (block) => {
    setFormData({
      name: block.name || '',
      location: block.location || '',
      area: block.area ?? '',
      elevation: block.elevation ?? '',
      soilType: block.soilType || '',
      waterSource: block.waterSource || '',
      assignedFruit: block.assignedFruit || '',
      numberOfTrees: block.numberOfTrees ?? '',
      plantingYear: block.plantingYear || '',
      status: block.status || 'Active',
      notes: block.notes || '',
    });
    setEditingId(block.id);
    setShowForm(true);
    setError('');
    setSelectedBlock(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteClick = (id) => {
    setDeletingId(id);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteOrchardBlock(deletingId);
      if (selectedBlock?.id === deletingId) setSelectedBlock(null);
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

  const filtered = orchardBlocks.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    (b.location || '').toLowerCase().includes(search.toLowerCase()) ||
    (b.assignedFruit || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 bg-gradient-to-b from-amber-50 to-white min-h-screen">
      <div className="max-w-6xl mx-auto">

        {/* ── Header ── */}
        <div className="flex flex-wrap justify-between items-start gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800">Orchard Blocks</h1>
            <p className="text-gray-500 mt-1">
              {orchardBlocks.length} block{orchardBlocks.length !== 1 ? 's' : ''} registered
            </p>
          </div>
          <div className="flex gap-3 items-center">
            {!showForm && (
              <>
                <input
                  type="text"
                  placeholder="Search blocks…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 w-52"
                />
                <button
                  onClick={() => { setShowForm(true); setError(''); }}
                  className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-5 py-2 rounded-lg font-semibold transition whitespace-nowrap"
                >
                  <Plus size={18} /> Add Block
                </button>
              </>
            )}
          </div>
        </div>

        {/* ── Stats bar ── */}
        {orchardBlocks.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Blocks', value: orchardBlocks.length },
              { label: 'Active', value: orchardBlocks.filter(b => b.status === 'Active').length },
              { label: 'Total Area (ha)', value: orchardBlocks.reduce((s, b) => s + (parseFloat(b.area) || 0), 0).toFixed(1) },
              { label: 'Total Trees', value: orchardBlocks.reduce((s, b) => s + (parseInt(b.numberOfTrees) || 0), 0).toLocaleString() },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white rounded-xl shadow-sm border border-amber-100 p-4 text-center">
                <p className="text-2xl font-bold text-amber-700">{value}</p>
                <p className="text-xs text-gray-500 mt-1">{label}</p>
              </div>
            ))}
          </div>
        )}

        {/* ── Form ── */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-8 border-l-4 border-amber-600">
            <h2 className="text-2xl font-bold mb-5 text-gray-800">
              {editingId ? '✏️ Edit Orchard Block' : '🌳 Add New Orchard Block'}
            </h2>

            {error && (
              <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Row 1 — Name + Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Block Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={set('name')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
                    placeholder="e.g., Block A, North Field, Block 1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={set('status')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
                  >
                    {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {/* Row 2 — Location */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Location / GPS Coordinates
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={set('location')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
                  placeholder="e.g., North-East corner, 7.2906° N, 80.6337° E"
                />
              </div>

              {/* Row 3 — Area + Elevation */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Area (hectares)</label>
                  <input
                    type="number" step="0.01" min="0"
                    value={formData.area}
                    onChange={set('area')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
                    placeholder="e.g., 5.5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Elevation (metres)</label>
                  <input
                    type="number" step="1" min="0"
                    value={formData.elevation}
                    onChange={set('elevation')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
                    placeholder="e.g., 500"
                  />
                </div>
              </div>

              {/* Row 4 — Soil + Water */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Soil Type</label>
                  <select
                    value={formData.soilType}
                    onChange={set('soilType')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
                  >
                    <option value="">Select Soil Type</option>
                    {SOIL_TYPES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Water Source</label>
                  <select
                    value={formData.waterSource}
                    onChange={set('waterSource')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
                  >
                    <option value="">Select Water Source</option>
                    {WATER_SOURCES.map((w) => <option key={w} value={w}>{w}</option>)}
                  </select>
                </div>
              </div>

              {/* Row 5 — Assigned Fruit + Planting Year + Number of Trees */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Assigned Fruit</label>
                  <select
                    value={formData.assignedFruit}
                    onChange={set('assignedFruit')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
                  >
                    <option value="">Select Fruit</option>
                    {fruits.map((f) => (
                      <option key={f.id} value={f.name}>{f.name}</option>
                    ))}
                    {fruits.length === 0 && (
                      <option disabled>No fruits registered yet</option>
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Planting Year</label>
                  <select
                    value={formData.plantingYear}
                    onChange={set('plantingYear')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
                  >
                    <option value="">Select Year</option>
                    {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Number of Trees</label>
                  <input
                    type="number" min="0" step="1"
                    value={formData.numberOfTrees}
                    onChange={set('numberOfTrees')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
                    placeholder="e.g., 120"
                  />
                </div>
              </div>

              {/* Row 6 — Notes */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={set('notes')}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
                  placeholder="Optional: crop history, maintenance notes, observations…"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-1">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white px-6 py-2 rounded-lg font-semibold transition"
                >
                  {saving ? 'Saving…' : editingId ? 'Update Block' : 'Add Block'}
                </button>
                <button type="button" onClick={handleCancel}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-lg font-semibold transition">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── Cards ── */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-16 text-center">
            <MapPin size={52} className="mx-auto text-amber-300 mb-4" />
            <p className="text-gray-500 text-lg">
              {search ? `No blocks match "${search}".` : 'No orchard blocks added yet. Click "Add Block" to get started.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((block) => (
              <div key={block.id}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-5 border-t-4 border-amber-500 flex flex-col">

                {/* Card header */}
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-gray-800">{block.name}</h3>
                  <div className="flex gap-2 ml-2 shrink-0">
                    <button onClick={() => setSelectedBlock(block)} className="text-amber-600 hover:text-amber-700" title="View Details"><Eye size={17} /></button>
                    <button onClick={() => handleEdit(block)} className="text-blue-600 hover:text-blue-700" title="Edit"><Edit2 size={17} /></button>
                    <button onClick={() => handleDeleteClick(block.id)} className="text-red-500 hover:text-red-700" title="Delete"><Trash2 size={17} /></button>
                  </div>
                </div>

                {/* Status + Fruit badges */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {block.status && (
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusColor(block.status)}`}>{block.status}</span>
                  )}
                  {block.assignedFruit && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-800">🍃 {block.assignedFruit}</span>
                  )}
                </div>

                {/* Key details */}
                <div className="space-y-1 text-sm text-gray-600 flex-1">
                  {block.location && <p><span className="font-semibold">📍 Location:</span> {block.location}</p>}
                  {block.area     && <p><span className="font-semibold">📐 Area:</span> {block.area} ha</p>}
                  {block.soilType && <p><span className="font-semibold">🌱 Soil:</span> {block.soilType}</p>}
                  {block.waterSource && <p><span className="font-semibold">💧 Water:</span> {block.waterSource}</p>}
                  {block.numberOfTrees && <p><span className="font-semibold">🌳 Trees:</span> {parseInt(block.numberOfTrees).toLocaleString()}</p>}
                  {block.plantingYear && <p><span className="font-semibold">📅 Planted:</span> {block.plantingYear}</p>}
                </div>

                <p className="text-xs text-gray-400 mt-3 pt-2 border-t border-gray-100">
                  Added: {new Date(block.createdAt).toLocaleDateString('en-LK')}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* ── Detail Modal ── */}
        {selectedBlock && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto pt-20 pb-6 px-4 flex justify-center items-start">
            <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-2xl font-bold text-gray-800">{selectedBlock.name}</h2>
                <button onClick={() => setSelectedBlock(null)} className="text-gray-400 hover:text-gray-700"><X size={24} /></button>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {selectedBlock.status && (
                  <span className={`text-sm font-semibold px-3 py-1 rounded-full ${statusColor(selectedBlock.status)}`}>{selectedBlock.status}</span>
                )}
                {selectedBlock.assignedFruit && (
                  <span className="text-sm font-semibold px-3 py-1 rounded-full bg-green-100 text-green-800">🍃 {selectedBlock.assignedFruit}</span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                {[
                  { label: 'Location', value: selectedBlock.location },
                  { label: 'Area', value: selectedBlock.area ? `${selectedBlock.area} hectares` : null },
                  { label: 'Elevation', value: selectedBlock.elevation ? `${selectedBlock.elevation} m` : null },
                  { label: 'Soil Type', value: selectedBlock.soilType },
                  { label: 'Water Source', value: selectedBlock.waterSource },
                  { label: 'Number of Trees', value: selectedBlock.numberOfTrees ? parseInt(selectedBlock.numberOfTrees).toLocaleString() : null },
                  { label: 'Planting Year', value: selectedBlock.plantingYear },
                  { label: 'Added On', value: new Date(selectedBlock.createdAt).toLocaleDateString('en-LK', { year: 'numeric', month: 'long', day: 'numeric' }) },
                ].filter(f => f.value).map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-xs text-gray-400 uppercase font-semibold tracking-wide">{label}</p>
                    <p className="text-gray-700 mt-0.5">{value}</p>
                  </div>
                ))}
              </div>

              {selectedBlock.notes && (
                <div className="mb-4">
                  <p className="text-xs text-gray-400 uppercase font-semibold tracking-wide">Notes</p>
                  <p className="text-gray-700 mt-1 text-sm leading-relaxed">{selectedBlock.notes}</p>
                </div>
              )}

              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => { handleEdit(selectedBlock); setSelectedBlock(null); }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition"
                >
                  Edit
                </button>
                <button
                  onClick={() => setSelectedBlock(null)}
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
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 overflow-y-auto pt-20 pb-6 px-4 flex justify-center items-start">
            <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 text-center">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Confirm Delete</h3>
              <p className="text-gray-500 mb-6">Are you sure you want to delete this orchard block? This action cannot be undone.</p>
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
