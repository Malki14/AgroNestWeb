import { useState, useEffect } from 'react';
import { useApp } from '../context/useApp';

const FRUIT_VARIETIES = ['Valencia Orange', 'Bing Cherry', 'Granny Smith Apple', 'Blueberry', 'Alphonso Mango', 'Meyer Lemon'];
const ORCHARD_BLOCKS = ['Pahala Gomuwa - Block A', 'Pahala Gomuwa - Block B', 'Uda Gomuwa - Block 4', 'Ela Pitiya - Block 2', 'Kiri Oya - Legacy Block'];

const STATUS_STYLE = {
  Pending:  { badge: 'bg-yellow-100 text-yellow-700 border border-yellow-200', dot: 'bg-yellow-400' },
  Approved: { badge: 'bg-green-100 text-green-700 border border-green-200',   dot: 'bg-green-500' },
  Rejected: { badge: 'bg-red-100 text-red-600 border border-red-200',         dot: 'bg-red-500'   },
  Reverted: { badge: 'bg-orange-100 text-orange-700 border border-orange-200', dot: 'bg-orange-500' },
};

export default function AdminHarvestRecords() {
  const { harvests, approveHarvest, rejectHarvest, reverseApprovedHarvest, addHarvest, fruits, orchardBlocks } = useApp();

  const [filterStatus, setFilterStatus] = useState('All');
  const [search, setSearch] = useState('');

  // Action modal (approve / reject)
  const [actionModal, setActionModal] = useState(null); // { type: 'approve'|'reject', harvest }
  const [adminNote, setAdminNote]   = useState('');

  // Admin direct-add form
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({
    date: new Date().toISOString().split('T')[0],
    fruitType: '',
    quantity: '',
    orchardBlock: '',
    notes: '',
    worker: 'Ruwan Jayasinghe (Admin)',
  });
  const [addSuccess, setAddSuccess] = useState(false);

  useEffect(() => {
    if (fruits.length > 0 && !addForm.fruitType) {
      setAddForm(prev => ({ ...prev, fruitType: fruits[0].name }));
    }
  }, [fruits]);

  useEffect(() => {
    if (orchardBlocks.length > 0 && !addForm.orchardBlock) {
      setAddForm(prev => ({ ...prev, orchardBlock: orchardBlocks[0].name }));
    }
  }, [orchardBlocks]);

  /* ── derived stats ── */
  const pending  = harvests.filter(h => h.status === 'Pending').length;
  const approved = harvests.filter(h => h.status === 'Approved').length;
  const rejected = harvests.filter(h => h.status === 'Rejected').length;
  const totalApprovedKg = harvests
    .filter(h => h.status === 'Approved')
    .reduce((s, h) => s + parseFloat(h.quantity), 0);

  /* ── filtered list ── */
  const filtered = harvests.filter(h => {
    const matchStatus = filterStatus === 'All' || h.status === filterStatus;
    const matchSearch =
      h.fruitType.toLowerCase().includes(search.toLowerCase()) ||
      h.worker.toLowerCase().includes(search.toLowerCase()) ||
      h.orchardBlock.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  /* ── handlers ── */
  const openAction = (type, harvest) => {
    setActionModal({ type, harvest });
    setAdminNote('');
  };

  const confirmAction = () => {
    if (!actionModal) return;
    if (actionModal.type === 'approve') approveHarvest(actionModal.harvest.id, adminNote);
    else if (actionModal.type === 'reject') rejectHarvest(actionModal.harvest.id, adminNote);
    else if (actionModal.type === 'reverse') reverseApprovedHarvest(actionModal.harvest.id, adminNote || 'Reversed accepted harvest due to error');
    setActionModal(null);
  };

  const handleDirectAdd = (e) => {
    e.preventDefault();
    // Admin-added records are auto-approved and update inventory immediately
    const id = Date.now();
    addHarvest({ ...addForm, worker: 'Ruwan Jayasinghe (Admin)' });
    // Immediately approve the record we just added (next tick so state is updated)
    setTimeout(() => approveHarvest(id, 'Direct admin entry – auto approved'), 50);
    setAddSuccess(true);
    setShowAddForm(false);
    setAddForm({ ...addForm, quantity: '', notes: '' });
    setTimeout(() => setAddSuccess(false), 3500);
  };

  return (
    <div className="p-8">

      {/* ── Stats row ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Pending Review', value: pending,  color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-200', icon: 'hourglass_top' },
          { label: 'Approved',       value: approved, color: 'text-green-700',  bg: 'bg-green-50 border-green-200',   icon: 'check_circle' },
          { label: 'Rejected',       value: rejected, color: 'text-red-600',    bg: 'bg-red-50 border-red-200',       icon: 'cancel' },
          { label: 'Total Approved', value: `${totalApprovedKg.toFixed(1)} kg`, color: 'text-[#173416]', bg: 'bg-surface-container-lowest border-outline-variant/10', icon: 'agriculture' },
        ].map(({ label, value, color, bg, icon }) => (
          <div key={label} className={`p-6 rounded-xl border shadow-sm ${bg}`}>
            <div className="flex items-center gap-2 mb-3">
              <span className={`material-symbols-outlined text-base ${color}`}>{icon}</span>
              <p className="text-xs font-label uppercase tracking-widest text-stone-500">{label}</p>
            </div>
            <h3 className={`text-2xl font-manrope font-extrabold ${color}`}>{value}</h3>
          </div>
        ))}
      </div>

      {/* ── Toolbar ── */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-6">
        <div>
          <h2 className="text-2xl font-manrope font-bold text-[#173416]">Harvest Records</h2>
          <p className="text-sm text-stone-500">Review and approve harvest batches submitted by field workers.</p>
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          {/* Search */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm">search</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search records..."
              className="pl-9 pr-4 py-2 bg-surface-container-high rounded-lg text-sm border-none outline-none focus:ring-2 focus:ring-primary/20 w-52" />
          </div>
          {/* Status filter */}
          <div className="flex gap-1 bg-surface-container-high p-1 rounded-lg">
            {['All', 'Pending', 'Approved', 'Rejected'].map(s => (
              <button key={s} onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${filterStatus === s ? 'bg-[#173416] text-white shadow-sm' : 'text-stone-500 hover:text-on-surface'}`}>
                {s}
              </button>
            ))}
          </div>
          {/* Admin direct-add */}
          <button onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 bg-[#173416] text-white px-4 py-2 rounded-lg font-bold text-sm hover:opacity-90 transition-opacity">
            <span className="material-symbols-outlined text-sm">add</span> Add Record
          </button>
        </div>
      </div>

      {addSuccess && (
        <div className="mb-5 p-4 bg-green-100 text-green-800 rounded-xl flex items-center gap-3 text-sm font-medium">
          <span className="material-symbols-outlined">check_circle</span>
          Harvest record added and inventory updated automatically.
        </div>
      )}

      {/* ── Records table ── */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-container-high/50">
              <tr>
                {['Worker', 'Date', 'Fruit Type', 'Quantity', 'Orchard Block', 'Submitted At', 'Notes', 'Status', 'Action'].map(h => (
                  <th key={h} className="px-5 py-4 text-[10px] font-label font-bold uppercase tracking-widest text-stone-500 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-14 text-stone-400">
                    <span className="material-symbols-outlined text-4xl block mb-2">agriculture</span>
                    No harvest records found.
                  </td>
                </tr>
              ) : filtered.map(h => (
                <tr key={h.id} className="hover:bg-surface transition-colors">
                  {/* Worker */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-bold text-xs">
                        {h.worker.split(' ').map(n => n[0]).join('').slice(0,2)}
                      </div>
                      <span className="text-sm font-medium text-on-surface whitespace-nowrap">{h.worker}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-stone-500 whitespace-nowrap">{h.date}</td>
                  <td className="px-5 py-4 text-sm font-medium text-on-surface">{h.fruitType}</td>
                  <td className="px-5 py-4 text-sm font-bold text-[#173416]">{parseFloat(h.quantity).toFixed(1)} kg</td>
                  <td className="px-5 py-4 text-sm text-stone-500 whitespace-nowrap">{h.orchardBlock}</td>
                  <td className="px-5 py-4 text-xs text-stone-400 whitespace-nowrap">{h.submittedAt}</td>
                  <td className="px-5 py-4 text-xs text-stone-400 max-w-[140px] truncate" title={h.notes || '—'}>{h.notes || '—'}</td>
                  {/* Status badge */}
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase ${STATUS_STYLE[h.status]?.badge}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${STATUS_STYLE[h.status]?.dot}`}></span>
                      {h.status}
                    </span>
                    {h.adminNote && (
                      <p className="text-[10px] text-stone-400 mt-1 max-w-[120px] truncate" title={h.adminNote}>↳ {h.adminNote}</p>
                    )}
                  </td>
                  {/* Action buttons */}
                  <td className="px-5 py-4">
                    {h.status === 'Pending' ? (
                      <div className="flex gap-2">
                        <button onClick={() => openAction('approve', h)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700 transition-colors">
                          <span className="material-symbols-outlined text-xs">check</span> Approve
                        </button>
                        <button onClick={() => openAction('reject', h)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-600 border border-red-200 rounded-lg text-xs font-bold hover:bg-red-200 transition-colors">
                          <span className="material-symbols-outlined text-xs">close</span> Reject
                        </button>
                      </div>
                    ) : h.status === 'Approved' ? (
                      <div className="flex gap-2">
                        <button onClick={() => openAction('reverse', h)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-orange-100 text-orange-700 border border-orange-200 rounded-lg text-xs font-bold hover:bg-orange-200 transition-colors">
                          <span className="material-symbols-outlined text-xs">undo</span> Reverse
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-stone-400 italic">{h.approvedAt ? h.approvedAt.split(' ')[0] : '—'}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-3 border-t border-outline-variant/10 text-xs text-stone-400">
          Showing {filtered.length} of {harvests.length} records
        </div>
      </div>

      {/* ── Approve / Reject confirmation modal ── */}
      {actionModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 overflow-y-auto pt-20 pb-6 px-4 flex justify-center items-start">
          <div className="bg-[#fbf9f2] rounded-2xl shadow-2xl w-full max-w-md p-8">
            {/* Header */}
            <div className="flex items-start gap-4 mb-6">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${actionModal.type === 'approve' ? 'bg-green-100' : actionModal.type === 'reject' ? 'bg-red-100' : 'bg-orange-100'}`}>
                <span className={`material-symbols-outlined text-xl ${actionModal.type === 'approve' ? 'text-green-600' : actionModal.type === 'reject' ? 'text-red-500' : 'text-orange-700'}`}>
                  {actionModal.type === 'approve' ? 'check_circle' : actionModal.type === 'reject' ? 'cancel' : 'undo'}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-manrope font-bold text-[#173416]">
                  {actionModal.type === 'approve' ? 'Approve Harvest Record' : actionModal.type === 'reject' ? 'Reject Harvest Record' : 'Reverse Approved Harvest'}
                </h3>
                <p className="text-sm text-stone-500 mt-0.5">
                  {actionModal.type === 'approve'
                    ? 'This will add the quantity to the inventory.'
                    : actionModal.type === 'reject'
                      ? 'The inventory will NOT be updated.'
                      : 'This will subtract the accepted quantity from inventory and mark the record as reversed.'}
                </p>
              </div>
            </div>

            {/* Record summary */}
            <div className="bg-surface-container-high rounded-xl p-4 mb-5 space-y-2">
              {[
                { l: 'Worker',       v: actionModal.harvest.worker },
                { l: 'Fruit Type',   v: actionModal.harvest.fruitType },
                { l: 'Quantity',     v: `${parseFloat(actionModal.harvest.quantity).toFixed(1)} kg` },
                { l: 'Orchard Block', v: actionModal.harvest.orchardBlock },
                { l: 'Date',         v: actionModal.harvest.date },
              ].map(({ l, v }) => (
                <div key={l} className="flex justify-between text-sm">
                  <span className="text-stone-400">{l}</span>
                  <span className="font-medium text-on-surface">{v}</span>
                </div>
              ))}
            </div>

            {/* Admin note */}
            <div className="mb-5">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5 block">
                Note for Worker <span className="text-stone-300 font-normal">(optional)</span>
              </label>
              <textarea rows={3} value={adminNote} onChange={e => setAdminNote(e.target.value)}
                placeholder={actionModal.type === 'approve' ? 'e.g. Quality verified – good batch.' : 'e.g. Quantity mismatch. Please re-submit.'}
                className="w-full bg-surface-container-high px-4 py-3 rounded-lg text-sm border-none outline-none resize-none focus:ring-2 focus:ring-primary/20" />
            </div>

            <div className="flex gap-3">
              <button onClick={() => setActionModal(null)}
                className="flex-1 py-3 border border-outline-variant/30 rounded-lg text-sm font-bold text-stone-600 hover:bg-surface-container-high transition-colors">
                Cancel
              </button>
              <button onClick={confirmAction}
                className={`flex-1 py-3 rounded-lg text-sm font-bold text-white transition-colors ${actionModal.type === 'approve' ? 'bg-green-600 hover:bg-green-700' : actionModal.type === 'reject' ? 'bg-red-500 hover:bg-red-600' : 'bg-orange-600 hover:bg-orange-700'}`}>
                {actionModal.type === 'approve' ? 'Approve & Update Inventory' : actionModal.type === 'reject' ? 'Reject Record' : 'Reverse Acceptance'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Admin Direct-Add Modal ── */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 overflow-y-auto pt-20 pb-6 px-4 flex justify-center items-start">
          <div className="bg-[#fbf9f2] rounded-2xl shadow-2xl w-full max-w-md p-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-manrope font-bold text-[#173416]">Add Harvest Record</h3>
                <p className="text-xs text-stone-400 mt-0.5">Admin entries are auto-approved and update inventory immediately.</p>
              </div>
              <button onClick={() => setShowAddForm(false)} className="text-stone-400 hover:text-stone-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleDirectAdd} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1 block">Harvest Date</label>
                  <input type="date" required value={addForm.date} onChange={e => setAddForm({ ...addForm, date: e.target.value })}
                    className="w-full bg-surface-container-high px-4 py-3 rounded-lg text-sm border-none outline-none" />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1 block">Quantity (kg)</label>
                  <input type="number" min="0.1" step="0.1" required value={addForm.quantity} onChange={e => setAddForm({ ...addForm, quantity: e.target.value })} placeholder="0.00"
                    className="w-full bg-surface-container-high px-4 py-3 rounded-lg text-sm border-none outline-none" />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1 block">Fruit Type</label>
                <select value={addForm.fruitType} onChange={e => setAddForm({ ...addForm, fruitType: e.target.value })}
                  className="w-full bg-surface-container-high px-4 py-3 rounded-lg text-sm border-none outline-none appearance-none">
                  {fruits.map(f => <option key={f.id} value={f.name}>{f.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1 block">Orchard Block</label>
                <select value={addForm.orchardBlock} onChange={e => setAddForm({ ...addForm, orchardBlock: e.target.value })}
                  className="w-full bg-surface-container-high px-4 py-3 rounded-lg text-sm border-none outline-none appearance-none">
                  {orchardBlocks.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1 block">Notes (optional)</label>
                <textarea rows={2} value={addForm.notes} onChange={e => setAddForm({ ...addForm, notes: e.target.value })} placeholder="Quality grade, weather conditions..."
                  className="w-full bg-surface-container-high px-4 py-3 rounded-lg text-sm border-none outline-none resize-none" />
              </div>
              <div className="bg-green-50 border border-green-200 p-3 rounded-lg text-xs text-green-700 flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">info</span>
                This record will be <strong>auto-approved</strong> and inventory will update immediately.
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowAddForm(false)}
                  className="flex-1 py-3 border border-outline-variant/30 rounded-lg text-sm font-bold text-stone-600 hover:bg-surface-container-high">Cancel</button>
                <button type="submit"
                  className="flex-1 py-3 bg-[#173416] text-white rounded-lg text-sm font-bold hover:opacity-90">Add & Approve</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
