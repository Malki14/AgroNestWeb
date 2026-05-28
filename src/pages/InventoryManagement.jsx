import React, { useState } from 'react';
import { useApp } from '../context/useApp';

const FRUIT_VARIETIES = ['Valencia Orange', 'Bing Cherry', 'Granny Smith Apple', 'Blueberry', 'Alphonso Mango', 'Meyer Lemon'];
const ORCHARD_BLOCKS = ['Pahala Gomuwa - Block A', 'Pahala Gomuwa - Block B', 'Uda Gomuwa - Block 4', 'Ela Pitiya - Block 2', 'Kiri Oya - Legacy Block'];

export default function InventoryManagement() {
  const { inventory, addInventoryItem, updateInventoryItem, deleteInventoryItem, fruits } = useApp();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [form, setForm] = useState({ fruitType: '', variety: '', stock: '', unitPrice: '', minStock: '' });

  const fruitTypes = ['All', ...new Set(inventory.map(i => i.fruitType))];
  const filtered = inventory.filter(i =>
    (filterType === 'All' || i.fruitType === filterType) &&
    (i.variety.toLowerCase().includes(search.toLowerCase()) || i.fruitType.toLowerCase().includes(search.toLowerCase()))
  );

  const totalStock = inventory.reduce((sum, i) => sum + i.stock, 0);
  const totalValue = inventory.reduce((sum, i) => sum + i.stock * i.unitPrice, 0);
  const lowStockCount = inventory.filter(i => i.status === 'Low Stock').length;
  const activeVarieties = inventory.length;

  const openAdd = () => {
    setEditingItem(null);
    setForm({ fruitType: fruits[0]?.name || '', variety: '', stock: '', unitPrice: '', minStock: '300' });
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setForm({ fruitType: item.fruitType, variety: item.variety, stock: item.stock, unitPrice: item.unitPrice, minStock: item.minStock });
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = { ...form, stock: parseFloat(form.stock), unitPrice: parseFloat(form.unitPrice), minStock: parseFloat(form.minStock) };
    data.status = data.stock <= data.minStock ? 'Low Stock' : 'In Stock';
    if (editingItem) updateInventoryItem(editingItem.id, data);
    else addInventoryItem(data);
    setShowModal(false);
  };

  const statusColor = (s) => s === 'In Stock' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700';

  return (
    <div className="p-8">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10 shadow-sm">
          <p className="text-xs font-label uppercase tracking-widest text-stone-500 mb-2">Total Stock</p>
          <h3 className="text-2xl font-manrope font-extrabold text-on-surface">{totalStock.toLocaleString()} <span className="text-sm font-medium text-stone-400">kg</span></h3>
          <p className="text-xs text-green-600 mt-1 font-medium">↑ +12% from last week</p>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10 shadow-sm">
          <p className="text-xs font-label uppercase tracking-widest text-stone-500 mb-2">Active Varieties</p>
          <h3 className="text-2xl font-manrope font-extrabold text-on-surface">{activeVarieties}</h3>
          <p className="text-xs text-stone-400 mt-1">Across {new Set(inventory.map(i=>i.fruitType)).size} fruit categories</p>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10 shadow-sm">
          <p className="text-xs font-label uppercase tracking-widest text-stone-500 mb-2">Low Stock Alerts</p>
          <h3 className={`text-2xl font-manrope font-extrabold ${lowStockCount > 0 ? 'text-orange-500' : 'text-green-600'}`}>{lowStockCount}</h3>
          <p className="text-xs text-orange-500 mt-1 font-medium">{lowStockCount > 0 ? 'Action required soon' : 'All levels healthy'}</p>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10 shadow-sm">
          <p className="text-xs font-label uppercase tracking-widest text-stone-500 mb-2">Inventory Value</p>
          <h3 className="text-2xl font-manrope font-extrabold text-on-surface">Rs. {(totalValue/1000).toFixed(1)}k</h3>
          <p className="text-xs text-stone-400 mt-1">Market rate average</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-6">
        <h2 className="text-2xl font-manrope font-bold text-[#173416]">Inventory Management</h2>
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm">search</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search inventory..."
              className="pl-9 pr-4 py-2 bg-surface-container-high rounded-lg text-sm border-none outline-none focus:ring-2 focus:ring-primary/20 w-52" />
          </div>
          <select value={filterType} onChange={e => setFilterType(e.target.value)}
            className="px-4 py-2 bg-surface-container-high rounded-lg text-sm border-none outline-none appearance-none focus:ring-2 focus:ring-primary/20">
            {fruitTypes.map(t => <option key={t}>{t}</option>)}
          </select>
          <button onClick={openAdd} className="flex items-center gap-2 bg-[#173416] text-white px-4 py-2 rounded-lg font-bold text-sm hover:opacity-90 transition-opacity">
            <span className="material-symbols-outlined text-sm">add_circle</span> Add New Item
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-container-high/50">
              <tr>
                {['Fruit Type', 'Variety', 'Current Stock', 'Unit Price (Rs.)', 'Status', 'Last Updated', 'Actions'].map(h => (
                  <th key={h} className="px-6 py-4 text-[10px] font-label font-bold uppercase tracking-widest text-stone-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {filtered.map(item => (
                <tr key={item.id} className="hover:bg-surface transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-on-surface">{item.fruitType}</td>
                  <td className="px-6 py-4 text-sm text-stone-600">{item.variety}</td>
                  <td className="px-6 py-4">
                    <div>
                      <span className={`font-bold text-sm ${item.status === 'Low Stock' ? 'text-orange-500' : 'text-on-surface'}`}>{item.stock.toLocaleString()} kg</span>
                      <div className="w-32 bg-surface-container-high h-1 rounded-full mt-1">
                        <div className={`h-full rounded-full ${item.status === 'Low Stock' ? 'bg-orange-400' : 'bg-primary'}`} style={{ width: `${Math.min(100, (item.stock / 5000) * 100)}%` }}></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-on-surface">Rs. {item.unitPrice.toLocaleString()}/kg</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${statusColor(item.status)}`}>{item.status}</span>
                  </td>
                  <td className="px-6 py-4 text-xs text-stone-400">{item.lastUpdated}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(item)} className="p-1.5 text-stone-400 hover:text-primary hover:bg-primary-fixed rounded-lg transition-colors">
                        <span className="material-symbols-outlined text-base">edit</span>
                      </button>
                      <button onClick={() => setConfirmDelete(item)} className="p-1.5 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
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
          Showing {filtered.length} of {inventory.length} inventory items
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 overflow-y-auto pt-20 pb-6 px-4 flex justify-center items-start">
          <div className="bg-[#fbf9f2] rounded-2xl shadow-2xl w-full max-w-md p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-manrope font-bold text-[#173416]">{editingItem ? 'Edit Item' : 'Add New Item'}</h3>
              <button onClick={() => setShowModal(false)}><span className="material-symbols-outlined text-stone-400">close</span></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1 block">Fruit Type</label>
                  <select required value={form.fruitType} onChange={e => setForm({ ...form, fruitType: e.target.value })}
                    className="w-full bg-surface-container-high px-4 py-3 rounded-lg text-sm border-none outline-none appearance-none">
                    <option value="">Select Fruit...</option>
                    {fruits.map(f => <option key={f.id} value={f.name}>{f.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1 block">Variety</label>
                  <input required value={form.variety} onChange={e => setForm({ ...form, variety: e.target.value })} placeholder="e.g. Valencia Orange"
                    className="w-full bg-surface-container-high px-4 py-3 rounded-lg text-sm border-none outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1 block">Stock (kg)</label>
                  <input required type="number" min="0" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} placeholder="0"
                    className="w-full bg-surface-container-high px-4 py-3 rounded-lg text-sm border-none outline-none" />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1 block">Unit Price (Rs.)</label>
                  <input required type="number" min="0" value={form.unitPrice} onChange={e => setForm({ ...form, unitPrice: e.target.value })} placeholder="0"
                    className="w-full bg-surface-container-high px-4 py-3 rounded-lg text-sm border-none outline-none" />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1 block">Min Stock (kg)</label>
                  <input required type="number" min="0" value={form.minStock} onChange={e => setForm({ ...form, minStock: e.target.value })} placeholder="300"
                    className="w-full bg-surface-container-high px-4 py-3 rounded-lg text-sm border-none outline-none" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 border border-outline-variant/30 rounded-lg text-sm font-bold text-stone-600 hover:bg-surface-container-high">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-[#173416] text-white rounded-lg text-sm font-bold hover:opacity-90">{editingItem ? 'Update' : 'Add Item'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 overflow-y-auto pt-20 pb-6 px-4 flex justify-center items-start">
          <div className="bg-[#fbf9f2] rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-red-500 text-2xl">delete_forever</span>
            </div>
            <h3 className="text-lg font-bold text-on-surface mb-2">Remove Item?</h3>
            <p className="text-sm text-stone-500 mb-6">Delete <strong>{confirmDelete.variety}</strong> from inventory?</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 py-3 border border-outline-variant/30 rounded-lg text-sm font-bold text-stone-600 hover:bg-surface-container-high">Cancel</button>
              <button onClick={() => { deleteInventoryItem(confirmDelete.id); setConfirmDelete(null); }} className="flex-1 py-3 bg-red-500 text-white rounded-lg text-sm font-bold hover:bg-red-600">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
