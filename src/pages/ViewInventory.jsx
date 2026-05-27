import React, { useState } from 'react';
import { useApp } from '../context/useApp';

export default function ViewInventory() {
  const { inventory } = useApp();
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('variety');

  const totalStock = inventory.reduce((s, i) => s + i.stock, 0);
  const maxCapacity = 12500;
  const topItems = inventory.sort((a, b) => b.stock - a.stock).slice(0, 3);

  const filtered = inventory.filter(i =>
    i.variety.toLowerCase().includes(search.toLowerCase()) ||
    i.fruitType.toLowerCase().includes(search.toLowerCase())
  );

  const statusBadge = (s) => s === 'In Stock' ? 'text-green-600 bg-green-50' : s === 'Low Stock' ? 'text-orange-600 bg-orange-50' : 'text-red-600 bg-red-50';

  return (
    <div className="max-w-7xl mx-auto px-6 pt-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="relative flex-1 max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm">search</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search inventory by variety or lot..."
            className="w-full pl-10 pr-4 py-3 bg-surface-container-high rounded-xl text-sm border-none outline-none" />
        </div>
        <div className="flex items-center gap-2 ml-4">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          <span className="text-xs font-bold text-green-600 uppercase tracking-wide">System Online</span>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-3xl font-manrope font-bold text-[#173416] mb-1">Current Stock Levels</h2>
        <p className="text-sm text-stone-500">Real-time inventory overview for AgroNest Cold Storage Facility.</p>
      </div>

      {/* Top Fruit Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {topItems.map((item) => {
          const capacity = Math.min(100, (item.stock / (maxCapacity / 3)) * 100);
          const isLow = capacity < 40;
          return (
            <div key={item.id} className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-xs font-label uppercase tracking-widest text-stone-400">Fruit Type</p>
                  <h4 className="text-lg font-bold text-on-surface">{item.variety}</h4>
                </div>
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${isLow ? 'border-orange-400' : 'border-primary'}`}>
                  <span className="material-symbols-outlined text-sm text-stone-500">nutrition</span>
                </div>
              </div>
              <div className="mb-4">
                <div className="flex items-end gap-1 mb-2">
                  <span className={`text-3xl font-black ${isLow ? 'text-orange-500' : 'text-on-surface'}`}>{item.stock.toLocaleString()}</span>
                  <span className="text-sm text-stone-400 mb-1">KG</span>
                  <span className={`ml-auto text-sm font-bold ${isLow ? 'text-orange-500' : 'text-primary'}`}>{Math.round(capacity)}% Capacity</span>
                </div>
                <div className="w-full bg-surface-container-high h-2 rounded-full">
                  <div className={`h-full rounded-full transition-all ${isLow ? 'bg-orange-400' : 'bg-primary'}`} style={{ width: `${capacity}%` }}></div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-stone-400 uppercase font-bold">Status</p>
                  <span className={`font-bold flex items-center gap-1 mt-0.5 ${item.status === 'In Stock' ? 'text-green-600' : 'text-orange-500'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'In Stock' ? 'bg-green-500' : 'bg-orange-500'}`}></span>
                    {item.status}
                  </span>
                </div>
                <div>
                  <p className="text-stone-400 uppercase font-bold">Last Intake</p>
                  <p className="text-on-surface font-medium mt-0.5">{item.lastUpdated.split(' ')[0]}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Breakdown Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-[#173416]">Inventory Breakdown</h3>
            <div className="flex gap-1 bg-surface-container-high p-1 rounded-lg">
              <button onClick={() => setViewMode('lot')} className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${viewMode === 'lot' ? 'bg-white shadow-sm text-on-surface' : 'text-stone-400'}`}>BY LOT</button>
              <button onClick={() => setViewMode('variety')} className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${viewMode === 'variety' ? 'bg-[#173416] text-white shadow-sm' : 'text-stone-400'}`}>BY VARIETY</button>
            </div>
          </div>
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 overflow-hidden shadow-sm">
            <div className="divide-y divide-outline-variant/10">
              {filtered.map(item => (
                <div key={item.id} className="flex items-center gap-4 px-6 py-4 hover:bg-surface transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-primary-fixed flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-primary text-base">nutrition</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-on-surface">{item.variety}</p>
                    <p className="text-xs text-stone-400">{item.fruitType} • Updated {item.lastUpdated}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-on-surface">{item.stock.toLocaleString()} kg</p>
                    <p className="text-xs text-stone-400">Unit: Rs. {item.unitPrice}/kg</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ml-2 ${statusBadge(item.status)}`}>{item.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Facility Info */}
        <div className="space-y-6">
          <div className="bg-[#173416] text-white p-6 rounded-xl">
            <p className="text-xs uppercase tracking-widest opacity-70 mb-4">Total Facility Load</p>
            <div className="flex items-center justify-center mb-4">
              <div className="relative w-28 h-28">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="12"/>
                  <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="12"
                    strokeDasharray={`${2 * Math.PI * 50 * (totalStock / maxCapacity)} ${2 * Math.PI * 50}`}
                    strokeLinecap="round"/>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-2xl font-black">{Math.round((totalStock/maxCapacity)*100)}%</span>
                  <span className="text-[10px] opacity-70">FULL</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-center opacity-70">{totalStock.toLocaleString()} kg of {maxCapacity.toLocaleString()} kg total capacity</p>
          </div>

          <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10 shadow-sm">
            <h4 className="font-bold text-[#173416] mb-4">Facility Climate</h4>
            <div className="space-y-3">
              {[
                { label: 'Temperature', value: '4.2°C', note: 'Optimal Cold Chain', icon: 'device_thermostat' },
                { label: 'Humidity', value: '85%', icon: 'water_drop' },
                { label: 'Ethylene Level', value: 'Low', icon: 'air' },
              ].map(d => (
                <div key={d.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-stone-400 text-sm">{d.icon}</span>
                    <span className="text-sm text-stone-500">{d.label}</span>
                  </div>
                  <span className="font-bold text-sm text-on-surface">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
