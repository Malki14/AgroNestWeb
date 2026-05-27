import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/useApp';

export default function WorkerHome() {
  const navigate = useNavigate();
  const { harvests, issues, inventory, currentUser } = useApp();

  const today = new Date().toISOString().split('T')[0];
  const todayHarvests = harvests.filter(h => h.date === today);
  const dailyTotal = todayHarvests.reduce((s, h) => s + parseFloat(h.quantity), 0);
  const myIssues = issues.filter(i => i.reportedBy === (currentUser?.name || 'Worker User'));
  const pendingIssues = myIssues.filter(i => i.status === 'Pending').length;
  const totalStock = inventory.reduce((s, i) => s + i.stock, 0);

  const quickActions = [
    { label: 'Record Harvest', icon: 'agriculture', color: 'primary', path: '/worker/harvest' },
    { label: 'View Inventory', icon: 'inventory_2', color: 'secondary', path: '/worker/inventory' },
    { label: 'Report Issue', icon: 'report_problem', color: 'tertiary', path: '/worker/issues' },
  ];

  return (
    <div className="p-8 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-[#173416] text-white p-8 rounded-2xl relative overflow-hidden">
        <div className="relative z-10">
          <p className="text-green-300 text-sm font-medium mb-1">Good {new Date().getHours() < 12 ? 'Morning' : 'Afternoon'} 🌿</p>
          <h3 className="font-manrope font-extrabold text-2xl mb-2">Welcome, {currentUser?.name || 'Worker'}!</h3>
          <p className="text-green-200 text-sm opacity-90 leading-relaxed mb-4">Today's priority is the <strong>Pahala Gomuwa - Block A</strong> harvest. Stay hydrated and safe!</p>
          <button onClick={() => navigate('/worker/harvest')} className="bg-white text-[#173416] py-2.5 px-5 rounded-xl font-bold text-sm flex items-center gap-2 hover:scale-[1.02] transition-transform w-fit">
            <span className="material-symbols-outlined text-base">agriculture</span>
            Start Harvest Run
          </button>
        </div>
        <span className="material-symbols-outlined absolute -bottom-4 -right-4 text-[160px] text-white opacity-5 rotate-12">psychiatry</span>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10 shadow-sm text-center">
          <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center mx-auto mb-3">
            <span className="material-symbols-outlined text-primary">agriculture</span>
          </div>
          <p className="text-2xl font-black text-primary">{dailyTotal.toFixed(1)} <span className="text-xs font-medium text-stone-400">kg</span></p>
          <p className="text-xs font-label uppercase tracking-wide text-stone-400 mt-1">Harvested Today</p>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10 shadow-sm text-center">
          <div className="w-12 h-12 rounded-full bg-secondary-fixed flex items-center justify-center mx-auto mb-3">
            <span className="material-symbols-outlined text-secondary">inventory_2</span>
          </div>
          <p className="text-2xl font-black text-secondary">{totalStock.toLocaleString()} <span className="text-xs font-medium text-stone-400">kg</span></p>
          <p className="text-xs font-label uppercase tracking-wide text-stone-400 mt-1">Total In Stock</p>
        </div>
        <div className={`p-6 rounded-xl border shadow-sm text-center ${pendingIssues > 0 ? 'bg-red-50 border-red-200' : 'bg-surface-container-lowest border-outline-variant/10'}`}>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${pendingIssues > 0 ? 'bg-red-100' : 'bg-tertiary-fixed'}`}>
            <span className={`material-symbols-outlined ${pendingIssues > 0 ? 'text-red-500' : 'text-tertiary'}`}>report_problem</span>
          </div>
          <p className={`text-2xl font-black ${pendingIssues > 0 ? 'text-red-600' : 'text-tertiary'}`}>{pendingIssues}</p>
          <p className="text-xs font-label uppercase tracking-wide text-stone-400 mt-1">Pending Issues</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-manrope font-bold text-[#173416] mb-4">Quick Actions</h3>
        <div className="grid grid-cols-3 gap-4">
          {quickActions.map(({ label, icon, color, path }) => (
            <button key={label} onClick={() => navigate(path)}
              className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/10 text-center hover:bg-surface-container-high transition-colors hover:shadow-md group">
              <div className={`w-12 h-12 rounded-full bg-${color}-fixed flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                <span className={`material-symbols-outlined text-${color}`}>{icon}</span>
              </div>
              <p className="font-bold text-sm text-on-surface">{label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* My Recent Issues */}
      {myIssues.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-manrope font-bold text-[#173416]">My Recent Issue Reports</h3>
            <button onClick={() => navigate('/worker/issues')} className="text-primary text-sm font-bold hover:underline">View All</button>
          </div>
          <div className="space-y-3">
            {myIssues.slice(0, 3).map(issue => (
              <div key={issue.id} className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/10 flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-red-500 text-base">bug_report</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="font-bold text-sm text-on-surface">{issue.issueType}</p>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${issue.status === 'Resolved' ? 'bg-green-100 text-green-700' : issue.status === 'In Progress' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>{issue.status}</span>
                  </div>
                  <p className="text-xs text-stone-400">{issue.location}</p>
                  {issue.adminResponse && (
                    <div className="mt-2 p-2 bg-green-50 rounded border-l-2 border-green-500">
                      <p className="text-xs text-green-700"><strong>Admin:</strong> {issue.adminResponse}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Field Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-secondary-fixed p-6 rounded-xl relative overflow-hidden group">
          <div className="relative z-10">
            <span className="material-symbols-outlined text-secondary text-3xl mb-3 block">device_thermostat</span>
            <h4 className="text-secondary font-bold text-lg mb-1">Current Field Temp</h4>
            <p className="text-on-secondary-fixed-variant text-sm">32°C – Tropical conditions. Ensure crew hydration especially in Block 4 and River Block.</p>
          </div>
          <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
            <span className="material-symbols-outlined text-9xl">wb_sunny</span>
          </div>
        </div>
        <div className="bg-primary-fixed p-6 rounded-xl relative overflow-hidden group">
          <div className="relative z-10">
            <span className="material-symbols-outlined text-primary text-3xl mb-3 block">water_drop</span>
            <h4 className="text-primary font-bold text-lg mb-1">Monsoon Alert</h4>
            <p className="text-on-primary-fixed-variant text-sm">South-west monsoon expected in the next 48 hours. Secure loose equipment in all blocks.</p>
          </div>
          <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
            <span className="material-symbols-outlined text-9xl">thunderstorm</span>
          </div>
        </div>
      </div>
    </div>
  );
}
