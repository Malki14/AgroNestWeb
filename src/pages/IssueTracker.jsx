import React, { useState, useEffect } from 'react';
import { useApp } from '../context/useApp';

const FRUIT_VARIETIES = ['Valencia Orange', 'Bing Cherry', 'Granny Smith Apple', 'Blueberry', 'Alphonso Mango', 'Meyer Lemon'];
const ISSUE_TYPES = ['Plant Disease', 'Pest Infestation', 'Irrigation Problem', 'Equipment Failure', 'Soil Issue', 'Other'];
const URGENCY_COLORS = { Low: 'bg-green-100 text-green-700', Medium: 'bg-yellow-100 text-yellow-700', High: 'bg-red-100 text-red-700' };
const STATUS_COLORS = { Pending: 'bg-yellow-100 text-yellow-700', 'In Progress': 'bg-blue-100 text-blue-700', Resolved: 'bg-green-100 text-green-700' };

// Admin version of IssueTracker
export default function IssueTracker() {
  const { issues, updateIssueStatus } = useApp();
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [response, setResponse] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [search, setSearch] = useState('');

  const active = issues.filter(i => i.status !== 'Resolved').length;
  const critical = issues.filter(i => i.urgency === 'High' && i.status !== 'Resolved').length;
  const resolved = issues.filter(i => i.status === 'Resolved').length;

  const filtered = issues.filter(i =>
    (filterStatus === 'All' || i.status === filterStatus) &&
    (i.issueType.toLowerCase().includes(search.toLowerCase()) || i.fruitType.toLowerCase().includes(search.toLowerCase()) || i.reportedBy.toLowerCase().includes(search.toLowerCase()))
  );

  const openIssue = (issue) => {
    setSelectedIssue(issue);
    setResponse(issue.adminResponse || '');
    setNewStatus(issue.status);
  };

  const handleRespond = (e) => {
    e.preventDefault();
    updateIssueStatus(selectedIssue.id, newStatus, response);
    setSelectedIssue(null);
  };

  const WEATHER_URL =
    'https://api.open-meteo.com/v1/forecast?latitude=6.9697&longitude=80.7892' +
    '&current=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation&timezone=Asia%2FColombo';

  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [weatherError, setWeatherError] = useState('');

  useEffect(() => {
    const fetchWeather = async () => {
      setWeatherLoading(true);
      try {
        const res = await fetch(WEATHER_URL);
        if (!res.ok) throw new Error('Network error');
        const data = await res.json();
        const c = data.current;
        setWeather({
          temp:     c.temperature_2m,
          humidity: c.relative_humidity_2m,
          wind:     c.wind_speed_10m,
          rain:     c.precipitation,
          updated:  new Date().toLocaleTimeString('en-LK', { hour: '2-digit', minute: '2-digit' }),
        });
        setWeatherError('');
      } catch {
        setWeatherError('Unable to fetch live weather.');
      } finally {
        setWeatherLoading(false);
      }
    };
    fetchWeather();
    const id = setInterval(fetchWeather, 10 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  const envData = weather
    ? [
        { label: 'Temperature', value: `${weather.temp}°C`,     icon: 'thermostat' },
        { label: 'Humidity',    value: `${weather.humidity}%`,   icon: 'water_drop' },
        { label: 'Wind Speed',  value: `${weather.wind} km/h`,   icon: 'air' },
        { label: 'Rainfall',    value: `${weather.rain} mm`,      icon: 'rainy' },
      ]
    : [];

  return (
    <div className="p-8">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10 shadow-sm">
          <p className="text-xs font-label uppercase tracking-widest text-stone-500 mb-2">Active Issues</p>
          <div className="flex items-end gap-2">
            <h3 className="text-3xl font-extrabold text-on-surface">{active}</h3>
            <span className="text-xs text-orange-500 font-bold mb-1">↑ {issues.length > 3 ? '4%' : '0%'}</span>
          </div>
        </div>
        <div className={`p-6 rounded-xl border shadow-sm ${critical > 0 ? 'bg-red-50 border-red-200' : 'bg-surface-container-lowest border-outline-variant/10'}`}>
          <p className={`text-xs font-label uppercase tracking-widest mb-2 ${critical > 0 ? 'text-red-600' : 'text-stone-500'}`}>Action Required</p>
          <h3 className={`text-3xl font-extrabold ${critical > 0 ? 'text-red-600' : 'text-on-surface'}`}>{String(critical).padStart(2,'0')}</h3>
          <p className="text-xs text-stone-400 mt-1">Critical focus needed</p>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10 shadow-sm">
          <p className="text-xs font-label uppercase tracking-widest text-stone-500 mb-2">Resolved Today</p>
          <h3 className="text-3xl font-extrabold text-green-600">{String(resolved).padStart(2,'0')}</h3>
          <p className="text-xs text-stone-400 mt-1">Target reached</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Toolbar */}
          <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
            <div>
              <h2 className="text-xl font-manrope font-bold text-[#173416]">Recent Disease Reports</h2>
              <p className="text-sm text-stone-500">Manage and update the status of crop issues across all sectors.</p>
            </div>
            <div className="flex gap-3">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm">search</span>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search reports..."
                  className="pl-9 pr-4 py-2 bg-surface-container-high rounded-lg text-sm border-none outline-none w-48" />
              </div>
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-4 py-2 bg-surface-container-high rounded-lg text-sm border-none outline-none appearance-none">
                <option>All</option><option>Pending</option><option>In Progress</option><option>Resolved</option>
              </select>
            </div>
          </div>

          {/* Issue List */}
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 overflow-hidden shadow-sm">
            <div className="grid grid-cols-12 px-6 py-3 bg-surface-container-high/50 text-[10px] font-label font-bold uppercase tracking-widest text-stone-500">
              <span className="col-span-5">Disease & Location</span>
              <span className="col-span-3">Reported By</span>
              <span className="col-span-2">Urgency</span>
              <span className="col-span-2 text-right">Status / Action</span>
            </div>
            <div className="divide-y divide-outline-variant/10">
              {filtered.length === 0 ? (
                <div className="text-center py-12 text-stone-400">
                  <span className="material-symbols-outlined text-4xl block mb-2">check_circle</span>
                  No issues found.
                </div>
              ) : filtered.map(issue => (
                <div key={issue.id} className="grid grid-cols-12 px-6 py-4 items-center hover:bg-surface transition-colors cursor-pointer group" onClick={() => openIssue(issue)}>
                  <div className="col-span-5 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-red-500 text-base">bug_report</span>
                    </div>
                    <div>
                      <p className="font-bold text-sm text-on-surface">{issue.issueType}</p>
                      <p className="text-xs text-stone-400">{issue.location}</p>
                    </div>
                  </div>
                  <div className="col-span-3">
                    <p className="text-sm font-medium text-on-surface">{issue.reportedBy}</p>
                    <p className="text-xs text-stone-400">{issue.reportedAt}</p>
                  </div>
                  <div className="col-span-2">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${URGENCY_COLORS[issue.urgency]}`}>{issue.urgency}</span>
                  </div>
                  <div className="col-span-2 flex justify-end">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${STATUS_COLORS[issue.status]}`}>{issue.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Advisory */}
          <div className="bg-[#173416] text-white p-6 rounded-xl">
            <div className="flex items-start gap-4">
              <span className="material-symbols-outlined text-2xl mt-0.5">health_and_safety</span>
              <div className="flex-1">
                <h4 className="font-bold mb-1">Orchard Health Advisory</h4>
                <p className="text-sm opacity-80">Conditions in sectors near Kiri Oya are currently favourable for fungal growth. Increased monitoring in affected blocks is highly recommended for the next 48 hours.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Environmental Data — Live Nuwara Eliya */}
        <div className="space-y-6">
          <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-bold text-[#173416]">Weather — Nuwara Eliya</h4>
              {weather?.updated && (
                <span className="text-[10px] text-stone-400 flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">schedule</span>
                  {weather.updated}
                </span>
              )}
            </div>
            {weatherLoading && !weather && (
              <div className="flex items-center gap-2 text-stone-400 text-sm py-3">
                <span className="material-symbols-outlined text-base" style={{animation:'spin 1s linear infinite'}}>refresh</span>
                Loading live data…
              </div>
            )}
            {weatherError && !weather && (
              <p className="text-red-500 text-xs py-2">{weatherError}</p>
            )}
            <div className="space-y-3">
              {envData.map(d => (
                <div key={d.label} className="flex items-center justify-between p-3 bg-surface-container-high/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-stone-500 text-base">{d.icon}</span>
                    <span className="text-sm text-stone-600">{d.label}</span>
                  </div>
                  <span className="font-bold text-sm text-on-surface">{d.value}</span>
                </div>
              ))}
            </div>
            {weather && (
              <p className="text-[10px] text-green-600 text-center pt-3 flex items-center justify-center gap-1">
                <span className="material-symbols-outlined text-xs">wifi</span>
                Live · auto-refreshes every 10 min
              </p>
            )}
          </div>

          <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10 shadow-sm">
            <h4 className="font-bold text-[#173416] mb-4">Quick Stats</h4>
            <div className="space-y-3">
              {[
                { label: 'Total Reports', value: issues.length, color: 'text-on-surface' },
                { label: 'Pending', value: issues.filter(i => i.status === 'Pending').length, color: 'text-yellow-600' },
                { label: 'In Progress', value: issues.filter(i => i.status === 'In Progress').length, color: 'text-blue-600' },
                { label: 'Resolved', value: issues.filter(i => i.status === 'Resolved').length, color: 'text-green-600' },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex justify-between items-center">
                  <span className="text-sm text-stone-500">{label}</span>
                  <span className={`font-bold text-lg ${color}`}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Issue Detail Modal */}
      {selectedIssue && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 overflow-y-auto pt-20 pb-6 px-4 flex justify-center items-start">
          <div className="bg-[#fbf9f2] rounded-2xl shadow-2xl w-full max-w-lg p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-[#173416]">Issue Detail & Response</h3>
              <button onClick={() => setSelectedIssue(null)}><span className="material-symbols-outlined text-stone-400">close</span></button>
            </div>
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-surface-container-high p-3 rounded-lg">
                  <p className="text-[10px] text-stone-400 uppercase font-bold mb-1">Issue Type</p>
                  <p className="text-sm font-bold text-on-surface">{selectedIssue.issueType}</p>
                </div>
                <div className="bg-surface-container-high p-3 rounded-lg">
                  <p className="text-[10px] text-stone-400 uppercase font-bold mb-1">Fruit Type</p>
                  <p className="text-sm font-bold text-on-surface">{selectedIssue.fruitType}</p>
                </div>
                <div className="bg-surface-container-high p-3 rounded-lg">
                  <p className="text-[10px] text-stone-400 uppercase font-bold mb-1">Location</p>
                  <p className="text-sm font-bold text-on-surface">{selectedIssue.location}</p>
                </div>
                <div className="bg-surface-container-high p-3 rounded-lg">
                  <p className="text-[10px] text-stone-400 uppercase font-bold mb-1">Reported By</p>
                  <p className="text-sm font-bold text-on-surface">{selectedIssue.reportedBy}</p>
                </div>
              </div>
              <div className="bg-surface-container-high p-4 rounded-lg">
                <p className="text-[10px] text-stone-400 uppercase font-bold mb-2">Description</p>
                <p className="text-sm text-on-surface">{selectedIssue.description}</p>
              </div>

              {/* Worker photo — visible to admin */}
              {selectedIssue.photo && (
                <div className="bg-surface-container-high p-4 rounded-lg">
                  <p className="text-[10px] text-stone-400 uppercase font-bold mb-2 flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">photo_camera</span>
                    Photo Evidence (submitted by worker)
                  </p>
                  <img
                    src={selectedIssue.photo}
                    alt="Issue photo"
                    className="w-full rounded-lg object-cover max-h-56 border border-outline-variant/20"
                  />
                </div>
              )}
              <div className="flex gap-2">
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${URGENCY_COLORS[selectedIssue.urgency]}`}>Urgency: {selectedIssue.urgency}</span>
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${STATUS_COLORS[selectedIssue.status]}`}>{selectedIssue.status}</span>
              </div>
            </div>
            <form onSubmit={handleRespond} className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1 block">Update Status</label>
                <select value={newStatus} onChange={e => setNewStatus(e.target.value)}
                  className="w-full bg-surface-container-high px-4 py-3 rounded-lg text-sm border-none outline-none appearance-none">
                  <option>Pending</option><option>In Progress</option><option>Resolved</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1 block">Admin Response (visible to worker)</label>
                <textarea rows={4} value={response} onChange={e => setResponse(e.target.value)} placeholder="Describe the recommended action or resolution..."
                  className="w-full bg-surface-container-high px-4 py-3 rounded-lg text-sm border-none outline-none resize-none" />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setSelectedIssue(null)} className="flex-1 py-3 border border-outline-variant/30 rounded-lg text-sm font-bold text-stone-600">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-[#173416] text-white rounded-lg text-sm font-bold hover:opacity-90">Update Issue</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
