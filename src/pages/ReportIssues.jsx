import { useState, useEffect } from 'react';
import { useApp } from '../context/useApp';

const FRUIT_VARIETIES = ['Valencia Orange', 'Bing Cherry', 'Granny Smith Apple', 'Blueberry', 'Alphonso Mango', 'Meyer Lemon'];
const ISSUE_TYPES = ['Plant Disease', 'Pest Infestation', 'Irrigation Problem', 'Equipment Failure', 'Soil Issue', 'Other'];
const STATUS_COLORS = { Pending: 'bg-yellow-100 text-yellow-700', 'In Progress': 'bg-blue-100 text-blue-700', Resolved: 'bg-green-100 text-green-700' };

const toBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = reject;
  reader.readAsDataURL(file);
});

export default function ReportIssues() {
  const { issues, addIssue, updateIssue, deleteIssue, currentUser, fruits, orchardBlocks } = useApp();
  const [form, setForm] = useState({ fruitType: '', issueType: ISSUE_TYPES[0], urgency: 'Medium', description: '', location: '', reportedBy: currentUser?.name || 'Worker User', photo: '' });
  const [photoPreview, setPhotoPreview] = useState('');
  const [photoError, setPhotoError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [editingIssue, setEditingIssue] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [editPhotoPreview, setEditPhotoPreview] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  // Update reportedBy when the user context becomes available
  useEffect(() => {
    if (currentUser?.name) {
      setForm(prev => ({ ...prev, reportedBy: currentUser.name }));
    }
  }, [currentUser?.name]);

  // Sync initial fruitType and auto-fill location block when fruits/orchardBlocks load
  useEffect(() => {
    if (fruits.length > 0 && !form.fruitType) {
      const initialFruit = fruits[0].name;
      const matchingBlock = orchardBlocks.find(b => b.assignedFruit === initialFruit);
      setForm(prev => ({
        ...prev,
        fruitType: initialFruit,
        location: matchingBlock ? matchingBlock.name : prev.location || 'Pahala Gomuwa - Block A'
      }));
    }
  }, [fruits, orchardBlocks]);

  const handleFruitTypeChange = (val, isEdit = false) => {
    const matchingBlock = orchardBlocks.find(b => b.assignedFruit === val);
    const locationVal = matchingBlock ? matchingBlock.name : '';
    if (isEdit) {
      setEditForm(prev => ({ ...prev, fruitType: val, location: locationVal || prev.location }));
    } else {
      setForm(prev => ({ ...prev, fruitType: val, location: locationVal || prev.location }));
    }
  };

  const myIssues = issues.filter(i => i.reportedBy === (currentUser?.name || 'Worker User'));

  const handlePhotoChange = async (e, isEdit = false) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setPhotoError('File too large. Maximum 10MB allowed.');
      return;
    }
    setPhotoError('');
    try {
      const base64 = await toBase64(file);
      if (isEdit) {
        setEditForm(prev => ({ ...prev, photo: base64 }));
        setEditPhotoPreview(base64);
      } else {
        setForm(prev => ({ ...prev, photo: base64 }));
        setPhotoPreview(base64);
      }
    } catch {
      setPhotoError('Failed to read image. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addIssue(form);
      setSubmitted(true);
      setForm({ ...form, description: '', photo: '' });
      setPhotoPreview('');
      setTimeout(() => setSubmitted(false), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  const openIssueEdit = (issue) => {
    setEditingIssue(issue);
    setEditForm({ ...issue });
    setEditPhotoPreview(issue.photo || '');
  };

  const saveIssueEdit = () => {
    if (!editForm) return;
    updateIssue(editingIssue.id, {
      fruitType: editForm.fruitType,
      issueType: editForm.issueType,
      urgency: editForm.urgency,
      location: editForm.location,
      description: editForm.description,
      photo: editForm.photo,
    });
    setEditingIssue(null);
    setEditForm(null);
  };

  const confirmDeleteIssue = (issueId) => {
    setDeletingId(issueId);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteIssue(deletingId);
      setDeletingId(null);
    } catch (err) {
      console.error(err);
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 pt-6 pb-12">
      <header className="mb-6">
        <h2 className="text-xl font-bold text-[#173416] font-manrope">Report Issue</h2>
        <p className="text-sm text-stone-500">Submit field issues to the management team immediately.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form */}
        <section className="lg:col-span-7">
          <div className="bg-surface-container-lowest p-6 md:p-10 rounded-xl shadow-sm border border-outline-variant/10">
            <div className="mb-8">
              <h3 className="text-2xl font-extrabold text-primary mb-2">New Incident Report</h3>
              <p className="text-on-surface-variant text-sm">Provide detailed information to help agronomists and maintenance teams respond effectively.</p>
            </div>

            {submitted && (
              <div className="mb-6 p-4 bg-green-100 text-green-800 rounded-lg flex items-center gap-3 font-medium text-sm">
                <span className="material-symbols-outlined">check_circle</span>
                Report submitted! The admin team will review and respond shortly. You'll see updates in "My Reports".
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                  <label className="uppercase tracking-wider text-xs font-bold text-on-surface-variant">Fruit Type / Variety</label>
                  <select value={form.fruitType} onChange={e => handleFruitTypeChange(e.target.value, false)}
                    className="w-full bg-surface-container-high border-none rounded-lg px-4 py-4 text-base focus:ring-2 focus:ring-primary/20 outline-none appearance-none">
                    {fruits.length === 0 ? (
                      <option value="">No fruits registered</option>
                    ) : (
                      fruits.map(f => <option key={f.id} value={f.name}>{f.name}</option>)
                    )}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="uppercase tracking-wider text-xs font-bold text-on-surface-variant">Issue Type / Category</label>
                  <select value={form.issueType} onChange={e => setForm({ ...form, issueType: e.target.value })}
                    className="w-full bg-surface-container-high border-none rounded-lg px-4 py-4 text-base focus:ring-2 focus:ring-primary/20 outline-none appearance-none">
                    {ISSUE_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="uppercase tracking-wider text-xs font-bold text-on-surface-variant">Urgency Level</label>
                <div className="flex gap-3">
                  {['Low', 'Medium', 'High'].map(u => (
                    <button key={u} type="button" onClick={() => setForm({ ...form, urgency: u })}
                      className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all ${form.urgency === u ? (u === 'High' ? 'bg-red-500 text-white' : u === 'Medium' ? 'bg-yellow-500 text-white' : 'bg-green-500 text-white') : 'bg-surface-container-high text-stone-600 hover:bg-surface-container-highest'}`}>
                      {u}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="uppercase tracking-wider text-xs font-bold text-on-surface-variant">Location / Block</label>
                <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="e.g. Pahala Gomuwa - Block B-12"
                  className="w-full bg-surface-container-high border-none rounded-lg px-4 py-4 text-base focus:ring-2 focus:ring-primary/20 outline-none" />
              </div>

              <div className="space-y-2">
                <label className="uppercase tracking-wider text-xs font-bold text-on-surface-variant">Detailed Description</label>
                <textarea rows={5} required value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe the signs of disease, specific pests seen, or equipment malfunction symptoms..."
                  className="w-full bg-surface-container-high border-none rounded-lg px-4 py-4 text-base focus:ring-2 focus:ring-primary/20 outline-none resize-none" />
              </div>

              <div className="space-y-2">
                <label className="uppercase tracking-wider text-xs font-bold text-on-surface-variant">Photo Evidence (Optional)</label>
                <label className="block border-2 border-dashed border-outline-variant/30 rounded-xl p-6 text-center hover:border-primary/40 transition-colors cursor-pointer">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => handlePhotoChange(e, false)}
                  />
                  {photoPreview ? (
                    <div className="space-y-2">
                      <img src={photoPreview} alt="Preview" className="max-h-40 mx-auto rounded-lg object-cover" />
                      <p className="text-xs text-green-600 font-semibold flex items-center justify-center gap-1">
                        <span className="material-symbols-outlined text-sm">check_circle</span>Photo attached
                      </p>
                    </div>
                  ) : (
                    <div>
                      <span className="material-symbols-outlined text-3xl text-stone-400 block mb-2">add_a_photo</span>
                      <p className="text-sm text-stone-500">Click to capture or upload photo</p>
                      <p className="text-xs text-stone-400 mt-1">Max 10MB · JPG, PNG, WebP</p>
                    </div>
                  )}
                </label>
                {photoError && <p className="text-red-600 text-xs">{photoError}</p>}
              </div>

              <button type="submit" className="w-full bg-primary text-on-primary py-5 rounded-lg text-lg font-bold flex items-center justify-center gap-3 hover:bg-primary-container active:scale-[0.98] transition-all shadow-lg">
                <span className="material-symbols-outlined">send</span> Submit Report
              </button>
            </form>
          </div>
        </section>

        {/* My Reports Sidebar */}
        <aside className="lg:col-span-5 space-y-6">
          <div className="bg-surface-container-low p-6 rounded-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-extrabold text-primary">My Recent Reports</h3>
              <span className="text-xs font-bold text-primary">View All</span>
            </div>
            <div className="space-y-3">
              {myIssues.length === 0 ? (
                <div className="text-center py-8 text-stone-400 text-sm">
                  <span className="material-symbols-outlined text-3xl block mb-2">inbox</span>
                  No reports submitted yet.
                </div>
              ) : myIssues.slice(0, 5).map(issue => (
                <div key={issue.id} className="bg-surface-container-lowest p-4 rounded-lg hover:shadow-sm transition-shadow">
                  <div className="flex items-start gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-red-500 text-base">bug_report</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-bold text-sm text-primary truncate">{issue.issueType}</p>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase flex-shrink-0 ${STATUS_COLORS[issue.status]}`}>{issue.status}</span>
                      </div>
                      <p className="text-xs text-stone-400 mt-0.5">{issue.location} • {issue.reportedAt}</p>
                    </div>
                  </div>
                  <p className="text-xs text-stone-500 line-clamp-2">{issue.description}</p>
                  {issue.adminResponse && (
                    <div className="mt-3 p-3 bg-green-50 rounded-lg border-l-2 border-green-500">
                      <p className="text-[10px] font-bold text-green-700 uppercase mb-1">Admin Response:</p>
                      <p className="text-xs text-green-800">{issue.adminResponse}</p>
                    </div>
                  )}
                  {issue.status === 'Pending' && (
                    <div className="mt-4 flex gap-2">
                      <button onClick={() => openIssueEdit(issue)} className="flex-1 py-2 px-3 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors">
                        Edit
                      </button>
                      <button onClick={() => confirmDeleteIssue(issue.id)} className="flex-1 py-2 px-3 bg-red-100 text-red-600 rounded-lg text-xs font-bold hover:bg-red-200 transition-colors">
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Identification Guide */}
          <div className="bg-[#173416] text-white p-6 rounded-xl relative overflow-hidden">
            <div className="relative z-10">
              <h4 className="font-bold text-lg mb-2">Identification Guide</h4>
              <p className="text-sm opacity-80 mb-4">Not sure what you're seeing? Browse the disease atlas to identify common orchard pests and pathogens.</p>
              <button className="bg-white text-[#173416] px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-primary-fixed transition-colors">
                <span className="material-symbols-outlined text-sm">menu_book</span>
                Open Atlas
              </button>
            </div>
            <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-9xl opacity-10">eco</span>
          </div>
        </aside>
      </div>

      {editingIssue && editForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 overflow-y-auto pt-20 pb-6 px-4 flex justify-center items-start">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl p-8 overflow-y-auto max-h-[90vh]">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h3 className="text-xl font-bold text-[#173416]">Edit Issue Report</h3>
                <p className="text-sm text-stone-500 mt-1">Update the details before the admin reviews it.</p>
              </div>
              <button onClick={() => { setEditingIssue(null); setEditForm(null); }} className="text-stone-400 hover:text-stone-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-500">Fruit Type / Variety</label>
                <select value={editForm.fruitType} onChange={e => handleFruitTypeChange(e.target.value, true)}
                  className="w-full bg-surface-container-high border-none rounded-lg px-4 py-4 text-base focus:ring-2 focus:ring-primary/20 outline-none appearance-none">
                  {fruits.length === 0 ? (
                    <option value="">No fruits registered</option>
                  ) : (
                    fruits.map(f => <option key={f.id} value={f.name}>{f.name}</option>)
                  )}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-500">Issue Type</label>
                <select value={editForm.issueType} onChange={e => setEditForm({ ...editForm, issueType: e.target.value })}
                  className="w-full bg-surface-container-high border-none rounded-lg px-4 py-4 text-base focus:ring-2 focus:ring-primary/20 outline-none appearance-none">
                  {ISSUE_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-500">Urgency</label>
                <select value={editForm.urgency} onChange={e => setEditForm({ ...editForm, urgency: e.target.value })}
                  className="w-full bg-surface-container-high border-none rounded-lg px-4 py-4 text-base focus:ring-2 focus:ring-primary/20 outline-none appearance-none">
                  {['Low', 'Medium', 'High'].map(u => <option key={u}>{u}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-500">Location / Block</label>
                <input value={editForm.location} onChange={e => setEditForm({ ...editForm, location: e.target.value })}
                  className="w-full bg-surface-container-high border-none rounded-lg px-4 py-4 text-base focus:ring-2 focus:ring-primary/20 outline-none" />
              </div>
            </div>

            <div className="space-y-2 mb-6">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-500">Description</label>
              <textarea rows={5} value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                className="w-full bg-surface-container-high border-none rounded-lg px-4 py-4 text-base focus:ring-2 focus:ring-primary/20 outline-none resize-none" />
            </div>

            <div className="space-y-2 mb-6">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-500">Update Photo (Optional)</label>
              <label className="block border-2 border-dashed border-outline-variant/30 rounded-xl p-6 text-center hover:border-primary/40 transition-colors cursor-pointer">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => handlePhotoChange(e, true)}
                />
                {editPhotoPreview ? (
                  <div className="space-y-2">
                    <img src={editPhotoPreview} alt="Preview" className="max-h-36 mx-auto rounded-lg object-cover" />
                    <p className="text-xs text-green-600 font-semibold">Photo attached — click to change</p>
                  </div>
                ) : (
                  <div>
                    <span className="material-symbols-outlined text-3xl text-stone-400 block mb-2">add_a_photo</span>
                    <p className="text-sm text-stone-500">Click to upload a photo</p>
                  </div>
                )}
              </label>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <button onClick={() => { setEditingIssue(null); setEditForm(null); }}
                className="flex-1 py-4 rounded-lg border border-outline-variant text-sm font-bold text-stone-600 hover:bg-surface-container-high transition-colors">
                Cancel
              </button>
              <button onClick={saveIssueEdit}
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
            <p className="text-gray-500 mb-6">Are you sure you want to delete this issue report? This action cannot be undone.</p>
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

