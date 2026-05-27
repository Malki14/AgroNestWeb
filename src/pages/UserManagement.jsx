import React, { useState } from 'react';
import { useApp } from '../context/useApp';

// Sri Lankan phone: 07X XXXXXXX (10 digits starting with 07)
// Also accepts +947X XXXXXXX (international format)
const SL_PHONE_REGEX = /^(?:\+94|0)7[0-9]{8}$/;

const validatePhone = (phone) => {
  if (!phone) return null; // optional field
  const cleaned = phone.replace(/[\s\-()]/g, '');
  return SL_PHONE_REGEX.test(cleaned)
    ? null
    : 'Enter a valid Sri Lankan number (e.g. 0771234567 or +94771234567)';
};

const EMPTY_FORM = { name: '', email: '', role: 'Worker', phone: '', nic: '', password: '', status: 'Active' };

export default function UserManagement() {
  const { users, addUser, updateUser, deleteUser } = useApp();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [phoneError, setPhoneError] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [formError, setFormError] = useState('');

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setEditingUser(null);
    setForm(EMPTY_FORM);
    setPhoneError('');
    setFormError('');
    setShowPass(false);
    setShowModal(true);
  };

  const openEdit = (user) => {
    setEditingUser(user);
    setForm({
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone || '',
      nic: user.nic || '',
      password: user.password || '',
      status: user.status,
    });
    setPhoneError('');
    setFormError('');
    setShowPass(false);
    setShowModal(true);
  };

  const handlePhoneChange = (val) => {
    setForm(f => ({ ...f, phone: val }));
    setPhoneError(validatePhone(val) || '');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const phoneErr = validatePhone(form.phone);
    if (phoneErr) { setPhoneError(phoneErr); return; }
    if (!editingUser && !form.password.trim()) {
      setFormError('Password is required when creating a new user.');
      return;
    }
    setFormError('');
    if (editingUser) updateUser(editingUser.id, form);
    else addUser(form);
    setShowModal(false);
  };

  const totalAdmins = users.filter(u => u.role === 'Admin').length;
  const totalWorkers = users.filter(u => u.role === 'Worker').length;
  const activeUsers = users.filter(u => u.status === 'Active').length;

  return (
    <div className="p-8">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Total Users', value: users.length, icon: 'group', color: 'primary' },
          { label: 'Active Admins', value: totalAdmins, icon: 'admin_panel_settings', color: 'secondary' },
          { label: 'Field Workers', value: totalWorkers, icon: 'agriculture', color: 'tertiary' },
          { label: 'Active Accounts', value: activeUsers, icon: 'verified_user', color: 'primary' },
        ].map((stat, i) => (
          <div key={i} className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 bg-${stat.color}-fixed rounded-lg`}>
                <span className={`material-symbols-outlined text-${stat.color}`}>{stat.icon}</span>
              </div>
              <p className="text-xs font-label uppercase tracking-widest text-stone-500">{stat.label}</p>
            </div>
            <h3 className="text-3xl font-manrope font-extrabold text-on-surface">{stat.value}</h3>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-6">
        <div>
          <h2 className="text-2xl font-manrope font-bold text-[#173416]">Active Personnel</h2>
          <p className="text-sm text-stone-500">Manage administrative permissions and worker assignments.</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm">search</span>
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search personnel..."
              className="pl-9 pr-4 py-2 bg-surface-container-high rounded-lg text-sm border-none outline-none focus:ring-2 focus:ring-primary/20 w-56"
            />
          </div>
          <button onClick={openAdd} className="flex items-center gap-2 bg-[#173416] text-white px-4 py-2 rounded-lg font-bold text-sm hover:opacity-90 transition-opacity">
            <span className="material-symbols-outlined text-sm">person_add</span> Add New User
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-container-high/50">
              <tr>
                {['Name', 'Email', 'NIC', 'Phone', 'Role', 'Date Joined', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-6 py-4 text-[10px] font-label font-bold uppercase tracking-widest text-stone-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {filtered.map(user => (
                <tr key={user.id} className="hover:bg-surface transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-bold text-sm font-manrope">
                        {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <span className="font-medium text-on-surface text-sm">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-stone-600">{user.email}</td>
                  <td className="px-6 py-4 text-sm text-stone-500">{user.nic || '—'}</td>
                  <td className="px-6 py-4 text-sm text-stone-500">{user.phone || '—'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${user.role === 'Admin' ? 'bg-secondary-fixed text-secondary' : 'bg-surface-container-high text-stone-600'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-stone-500">{user.dateJoined}</td>
                  <td className="px-6 py-4">
                    <span className={`flex items-center gap-1 text-xs font-bold ${user.status === 'Active' ? 'text-green-600' : 'text-stone-400'}`}>
                      <span className={`w-2 h-2 rounded-full ${user.status === 'Active' ? 'bg-green-500' : 'bg-stone-400'}`}></span>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(user)} className="p-1.5 text-stone-400 hover:text-primary hover:bg-primary-fixed rounded-lg transition-colors">
                        <span className="material-symbols-outlined text-base">edit</span>
                      </button>
                      <button onClick={() => setConfirmDelete(user)} className="p-1.5 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <span className="material-symbols-outlined text-base">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-outline-variant/10 text-xs text-stone-400">
          Showing {filtered.length} of {users.length} users
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 overflow-y-auto pt-20 pb-6 px-4 flex justify-center items-start">
          <div className="bg-[#fbf9f2] rounded-2xl shadow-2xl w-full max-w-md p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-manrope font-bold text-[#173416]">{editingUser ? 'Edit User' : 'Add New User'}</h3>
              <button onClick={() => setShowModal(false)} className="text-stone-400 hover:text-stone-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {formError && (
              <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{formError}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1 block">Full Name *</label>
                <input type="text" required value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Kamal Perera"
                  className="w-full bg-surface-container-high px-4 py-3 rounded-lg text-sm border-none outline-none focus:ring-2 focus:ring-primary/20" />
              </div>

              {/* Email */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1 block">Email Address *</label>
                <input type="email" required value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="kamal@agronest.farm"
                  className="w-full bg-surface-container-high px-4 py-3 rounded-lg text-sm border-none outline-none focus:ring-2 focus:ring-primary/20" />
              </div>

              {/* NIC */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1 block">NIC Number</label>
                <input type="text" value={form.nic}
                  onChange={e => setForm({ ...form, nic: e.target.value })}
                  placeholder="e.g. 199012345678 or 900123456V"
                  className="w-full bg-surface-container-high px-4 py-3 rounded-lg text-sm border-none outline-none focus:ring-2 focus:ring-primary/20" />
              </div>

              {/* Phone — SL validation */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1 block">Phone Number</label>
                <input type="text" value={form.phone}
                  onChange={e => handlePhoneChange(e.target.value)}
                  placeholder="e.g. 0771234567 or +94771234567"
                  className={`w-full bg-surface-container-high px-4 py-3 rounded-lg text-sm border outline-none focus:ring-2 focus:ring-primary/20 ${phoneError ? 'border-red-400 bg-red-50' : 'border-transparent'}`} />
                {phoneError && (
                  <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">error</span>{phoneError}
                  </p>
                )}
                {form.phone && !phoneError && (
                  <p className="text-green-600 text-xs mt-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">check_circle</span>Valid Sri Lankan number
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1 block">
                  Password {!editingUser && <span className="text-red-500">*</span>}
                  {editingUser && <span className="text-stone-400 font-normal normal-case ml-1">(leave blank to keep existing)</span>}
                </label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    placeholder={editingUser ? '••••••••' : 'Set a password'}
                    className="w-full bg-surface-container-high px-4 py-3 pr-12 rounded-lg text-sm border-none outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <button type="button" onClick={() => setShowPass(p => !p)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-600">
                    <span className="material-symbols-outlined text-base">{showPass ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
              </div>

              {/* Role + Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1 block">Role</label>
                  <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}
                    className="w-full bg-surface-container-high px-4 py-3 rounded-lg text-sm border-none outline-none focus:ring-2 focus:ring-primary/20 appearance-none">
                    <option>Admin</option><option>Worker</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1 block">Status</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                    className="w-full bg-surface-container-high px-4 py-3 rounded-lg text-sm border-none outline-none focus:ring-2 focus:ring-primary/20 appearance-none">
                    <option>Active</option><option>Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 py-3 border border-outline-variant/30 rounded-lg text-sm font-bold text-stone-600 hover:bg-surface-container-high transition-colors">Cancel</button>
                <button type="submit"
                  className="flex-1 py-3 bg-[#173416] text-white rounded-lg text-sm font-bold hover:opacity-90 transition-opacity">
                  {editingUser ? 'Update User' : 'Add User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 overflow-y-auto pt-20 pb-6 px-4 flex justify-center items-start">
          <div className="bg-[#fbf9f2] rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-red-500 text-2xl">delete_forever</span>
            </div>
            <h3 className="text-lg font-bold text-on-surface mb-2">Delete User?</h3>
            <p className="text-sm text-stone-500 mb-6">Are you sure you want to delete <strong>{confirmDelete.name}</strong>? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 py-3 border border-outline-variant/30 rounded-lg text-sm font-bold text-stone-600 hover:bg-surface-container-high transition-colors">Cancel</button>
              <button onClick={() => { deleteUser(confirmDelete.id); setConfirmDelete(null); }} className="flex-1 py-3 bg-red-500 text-white rounded-lg text-sm font-bold hover:bg-red-600 transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
