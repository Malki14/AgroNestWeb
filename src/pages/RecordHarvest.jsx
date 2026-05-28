import { useState, useEffect } from 'react';
import { useApp } from '../context/useApp';

export default function RecordHarvest() {
  const { harvests, fruits, orchardBlocks, addHarvest, updateHarvest, deleteHarvest, currentUser } = useApp();
  const [form, setForm] = useState({ date: new Date().toISOString().split('T')[0], fruitType: '', quantity: '', orchardBlock: '', notes: '', worker: currentUser?.name || 'Worker User' });
  const [submitted, setSubmitted] = useState(false);
  const [editingHarvest, setEditingHarvest] = useState(null);
  const [editHarvestForm, setEditHarvestForm] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (currentUser?.name) {
      setForm(prev => ({ ...prev, worker: currentUser.name }));
    }
  }, [currentUser?.name]);

  useEffect(() => {
    if (fruits.length > 0 && !form.fruitType) {
      setForm(prev => ({ ...prev, fruitType: fruits[0].name }));
    }
  }, [fruits]);

  useEffect(() => {
    if (orchardBlocks.length > 0 && !form.orchardBlock) {
      setForm(prev => ({ ...prev, orchardBlock: orchardBlocks[0].name }));
    }
  }, [orchardBlocks]);

  const myHarvests = harvests.filter(h => h.worker === (currentUser?.name || 'Worker User'));
  const todayHarvests = harvests.filter(h => h.date === new Date().toISOString().split('T')[0]);
  const dailyTotal = todayHarvests.reduce((sum, h) => sum + parseFloat(h.quantity), 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    addHarvest(form);
    setSubmitted(true);
    setForm({ ...form, quantity: '', notes: '' });
    setTimeout(() => setSubmitted(false), 3000);
  };

  const openHarvestEdit = (harvest) => {
    setEditingHarvest(harvest);
    setEditHarvestForm({ ...harvest });
  };

  const saveHarvestEdit = () => {
    if (!editHarvestForm) return;
    updateHarvest(editingHarvest.id, {
      date: editHarvestForm.date,
      fruitType: editHarvestForm.fruitType,
      quantity: editHarvestForm.quantity,
      orchardBlock: editHarvestForm.orchardBlock,
      notes: editHarvestForm.notes,
    });
    setEditingHarvest(null);
    setEditHarvestForm(null);
  };

  const confirmDeleteHarvest = (id) => {
    setDeletingId(id);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteHarvest(deletingId);
      setDeletingId(null);
    } catch (err) {
      console.error(err);
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 pt-6 pb-12">
      <header className="mb-6">
        <h2 className="text-xl font-bold text-[#173416] font-manrope">Record Harvest</h2>
        <p className="text-sm text-stone-500">Log harvest batches directly from the field.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form */}
        <section className="lg:col-span-7 space-y-6">
          <div className="bg-surface-container-lowest p-6 md:p-10 rounded-xl shadow-sm border border-outline-variant/10">
            <div className="mb-8">
              <h3 className="text-2xl font-extrabold text-primary mb-2">New Batch Entry</h3>
              <p className="text-on-surface-variant text-sm">Capture harvest details directly from the field location.</p>
            </div>

            {submitted && (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg flex items-center gap-3 font-medium text-sm">
                <span className="material-symbols-outlined">hourglass_top</span>
                Harvest batch submitted! It is now <strong>pending admin approval</strong>. Inventory will update once approved.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="uppercase tracking-wider text-xs font-bold text-on-surface-variant flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">calendar_today</span> Harvest Date
                  </label>
                  <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
                    className="w-full bg-surface-container-high border-none rounded-lg px-4 py-4 text-base focus:ring-2 focus:ring-primary/20 outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="uppercase tracking-wider text-xs font-bold text-on-surface-variant flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">nutrition</span> Fruit Type / Variety
                  </label>
                  <select value={form.fruitType} onChange={e => setForm({ ...form, fruitType: e.target.value })}
                    className="w-full bg-surface-container-high border-none rounded-lg px-4 py-4 text-base focus:ring-2 focus:ring-primary/20 outline-none appearance-none">
                    <option value="">Select a fruit...</option>
                    {fruits.map(f => <option key={f.id} value={f.name}>{f.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="uppercase tracking-wider text-xs font-bold text-on-surface-variant flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">weight</span> Quantity (kg)
                  </label>
                  <div className="relative">
                    <input type="number" min="0" step="0.1" required value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })}
                      placeholder="0.00"
                      className="w-full bg-surface-container-high border-none rounded-lg px-4 py-4 text-2xl font-bold focus:ring-2 focus:ring-primary/20 outline-none" />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-outline text-sm">KG</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="uppercase tracking-wider text-xs font-bold text-on-surface-variant flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">map</span> Orchard Block
                  </label>
                  <select value={form.orchardBlock} onChange={e => setForm({ ...form, orchardBlock: e.target.value })}
                    className="w-full bg-surface-container-high border-none rounded-lg px-4 py-4 text-base focus:ring-2 focus:ring-primary/20 outline-none appearance-none">
                    <option value="">Select an orchard block...</option>
                    {orchardBlocks.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="uppercase tracking-wider text-xs font-bold text-on-surface-variant flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">notes</span> Notes (Optional)
                </label>
                <textarea rows={3} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Quality grade, weather conditions, crew size..."
                  className="w-full bg-surface-container-high border-none rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-primary/20 outline-none resize-none" />
              </div>

              <button type="submit" className="w-full bg-primary text-on-primary py-5 rounded-lg text-lg font-bold flex items-center justify-center gap-3 hover:bg-primary-container active:scale-[0.98] transition-all shadow-lg">
                <span className="material-symbols-outlined">check_circle</span> Log Harvest Batch
              </button>
            </form>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-primary-fixed p-6 rounded-xl relative overflow-hidden group">
              <div className="relative z-10">
                <span className="material-symbols-outlined text-primary text-3xl mb-4 block">eco</span>
                <h4 className="text-primary font-bold text-lg leading-tight mb-1">Quality Check</h4>
                <p className="text-on-primary-fixed-variant text-sm">Sort fruit by ripeness grade before logging weights for accurate reporting.</p>
              </div>
              <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                <span className="material-symbols-outlined text-9xl">inventory</span>
              </div>
            </div>
            <div className="bg-secondary-fixed p-6 rounded-xl relative overflow-hidden group">
              <div className="relative z-10">
                <span className="material-symbols-outlined text-secondary text-3xl mb-4 block">device_thermostat</span>
                <h4 className="text-secondary font-bold text-lg leading-tight mb-1">Current Field Temp</h4>
                <p className="text-on-secondary-fixed-variant text-sm">32°C – Typical tropical conditions. Ensure hydration for crew in all blocks.</p>
              </div>
              <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                <span className="material-symbols-outlined text-9xl">wb_sunny</span>
              </div>
            </div>
          </div>
        </section>

        {/* History */}
        <aside className="lg:col-span-5 space-y-6">
          <div className="bg-surface-container-low p-6 rounded-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-extrabold text-primary">Today's Harvest Logs</h3>
              <span className="bg-primary-fixed text-on-primary-fixed-variant px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">Live Updates</span>
            </div>
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {todayHarvests.length === 0 ? (
                <div className="text-center py-8 text-stone-400 text-sm">
                  <span className="material-symbols-outlined text-3xl block mb-2">agriculture</span>
                  No harvests logged today yet.
                </div>
              ) : (
                todayHarvests.map(h => (
                  <div key={h.id} className="bg-surface-container-lowest p-4 rounded-lg hover:shadow-sm transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary-fixed flex items-center justify-center">
                          <span className="material-symbols-outlined text-primary text-base">nutrition</span>
                        </div>
                        <div>
                          <p className="font-bold text-primary text-sm">{h.fruitType}</p>
                          <p className="text-xs text-on-surface-variant uppercase font-medium">{h.orchardBlock}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-black text-primary leading-none">{parseFloat(h.quantity).toFixed(1)}</p>
                        <p className="text-[10px] font-bold text-on-surface-variant">KG</p>
                      </div>
                    </div>
                    <div className="mt-2 flex justify-end">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                        h.status === 'Approved' ? 'bg-green-100 text-green-700' :
                        h.status === 'Rejected' ? 'bg-red-100 text-red-600' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>{h.status || 'Pending'}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="mt-6 pt-6 border-t border-outline-variant/10">
              <div className="flex justify-between items-end">
                <div>
                  <p className="uppercase tracking-widest text-[10px] font-bold text-on-surface-variant">Daily Total</p>
                  <h4 className="text-3xl font-black text-primary">{dailyTotal.toFixed(1)} <span className="text-sm font-medium">KG</span></h4>
                </div>
              </div>
            </div>
          </div>

          {/* All Harvest History */}
          <div className="bg-surface-container-low p-6 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-primary">My Submissions</h3>
              <span className="text-[10px] uppercase font-bold text-stone-500">{currentUser?.name || 'Field Worker'}</span>
            </div>
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {myHarvests.length === 0 ? (
                <div className="text-center py-8 text-stone-400 text-sm">
                  <span className="material-symbols-outlined text-3xl block mb-2">agriculture</span>
                  No harvest batches submitted yet.
                </div>
              ) : myHarvests.slice(0, 5).map(h => (
                <div key={h.id} className="bg-surface-container-lowest p-4 rounded-lg hover:shadow-sm transition-shadow">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-primary">{h.fruitType}</p>
                      <p className="text-xs text-stone-400">{h.date} • {h.orchardBlock}</p>
                      <p className="text-xs text-stone-500 mt-2 line-clamp-2">{h.notes || 'No notes provided'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-black text-primary">{parseFloat(h.quantity).toFixed(1)} kg</p>
                      <p className="text-[10px] uppercase font-bold text-stone-500">{h.status || 'Pending'}</p>
                    </div>
                  </div>
                  {h.status === 'Pending' && (
                    <div className="mt-4 flex gap-2">
                      <button onClick={() => openHarvestEdit(h)} className="flex-1 py-2 px-3 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors">
                        Edit
                      </button>
                      <button onClick={() => confirmDeleteHarvest(h.id)} className="flex-1 py-2 px-3 bg-red-100 text-red-600 rounded-lg text-xs font-bold hover:bg-red-200 transition-colors">
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-surface-container-low p-6 rounded-xl">
            <h3 className="text-base font-bold text-primary mb-4">Recent Harvest History</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {harvests.slice(0, 10).map(h => (
                <div key={h.id} className="flex items-center justify-between py-2 border-b border-outline-variant/10 last:border-none">
                  <div>
                    <p className="text-sm font-medium text-on-surface">{h.fruitType}</p>
                    <p className="text-xs text-stone-400">{h.date} • {h.orchardBlock}</p>
                  </div>
                  <span className="font-bold text-sm text-primary">{parseFloat(h.quantity).toFixed(1)} kg</span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {editingHarvest && editHarvestForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 overflow-y-auto pt-20 pb-6 px-4 flex justify-center items-start">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl p-8 overflow-y-auto max-h-[90vh]">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h3 className="text-xl font-bold text-[#173416]">Edit Harvest Batch</h3>
                <p className="text-sm text-stone-500 mt-1">Change the batch details before admin approval.</p>
              </div>
              <button onClick={() => { setEditingHarvest(null); setEditHarvestForm(null); }} className="text-stone-400 hover:text-stone-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-500">Harvest Date</label>
                <input type="date" value={editHarvestForm.date} onChange={e => setEditHarvestForm({ ...editHarvestForm, date: e.target.value })}
                  className="w-full bg-surface-container-high border-none rounded-lg px-4 py-4 text-base focus:ring-2 focus:ring-primary/20 outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-500">Fruit Type</label>
                <select value={editHarvestForm.fruitType} onChange={e => setEditHarvestForm({ ...editHarvestForm, fruitType: e.target.value })}
                  className="w-full bg-surface-container-high border-none rounded-lg px-4 py-4 text-base focus:ring-2 focus:ring-primary/20 outline-none appearance-none">
                  {fruits.map(f => <option key={f.id} value={f.name}>{f.name}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-500">Quantity (kg)</label>
                <input type="number" min="0" step="0.1" value={editHarvestForm.quantity} onChange={e => setEditHarvestForm({ ...editHarvestForm, quantity: e.target.value })}
                  className="w-full bg-surface-container-high border-none rounded-lg px-4 py-4 text-base focus:ring-2 focus:ring-primary/20 outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-500">Orchard Block</label>
                <select value={editHarvestForm.orchardBlock} onChange={e => setEditHarvestForm({ ...editHarvestForm, orchardBlock: e.target.value })}
                  className="w-full bg-surface-container-high border-none rounded-lg px-4 py-4 text-base focus:ring-2 focus:ring-primary/20 outline-none appearance-none">
                  {orchardBlocks.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-2 mb-6">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-500">Notes</label>
              <textarea rows={3} value={editHarvestForm.notes} onChange={e => setEditHarvestForm({ ...editHarvestForm, notes: e.target.value })}
                className="w-full bg-surface-container-high border-none rounded-lg px-4 py-4 text-base focus:ring-2 focus:ring-primary/20 outline-none resize-none" />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <button onClick={() => { setEditingHarvest(null); setEditHarvestForm(null); }}
                className="flex-1 py-4 rounded-lg border border-outline-variant text-sm font-bold text-stone-600 hover:bg-surface-container-high transition-colors">
                Cancel
              </button>
              <button onClick={saveHarvestEdit}
                className="flex-1 py-4 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary-container transition-colors">
                Save Changes
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
            <p className="text-gray-500 mb-6">Are you sure you want to delete this harvest batch? This action cannot be undone.</p>
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
  );
}
