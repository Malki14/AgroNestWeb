import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/useApp';

// Open-Meteo is free, no API key needed
// Nuwara Eliya, Sri Lanka: lat=6.9697, lon=80.7892
const WEATHER_URL =
  'https://api.open-meteo.com/v1/forecast?latitude=6.9697&longitude=80.7892' +
  '&current=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation&timezone=Asia%2FColombo';

const WMO_LABEL = (code) => {
  if (code === 0) return 'Clear';
  if (code <= 3) return 'Partly Cloudy';
  if (code <= 49) return 'Foggy';
  if (code <= 67) return 'Rainy';
  if (code <= 77) return 'Snow';
  if (code <= 99) return 'Thunderstorm';
  return 'Unknown';
};

export default function DashboardHome() {
  const { harvests, sales, expenses, issues, inventory } = useApp();
  const navigate = useNavigate();

  // ── Weather state ──────────────────────────────────────────────────
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
          label:    WMO_LABEL(c.weathercode || 0),
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
    // Auto-refresh every 10 minutes
    const id = setInterval(fetchWeather, 10 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  // ── Metrics ────────────────────────────────────────────────────────
  // Only count harvests that are Approved — Reverted/Pending/Rejected are excluded
  const approvedHarvests = harvests.filter(h => h.status === 'Approved');
  const totalHarvest   = approvedHarvests.reduce((s, h) => s + parseFloat(h.quantity || 0), 0);
  const totalSales     = sales.reduce((s, i) => s + (i.totalPrice || 0), 0);
  const totalExpenses  = expenses.reduce((s, i) => s + (i.amount || 0), 0);
  const totalStock     = inventory.reduce((s, i) => s + (i.stock || 0), 0);
  const maxCapacity    = 12500;
  const stockPercent   = Math.round((totalStock / maxCapacity) * 100);
  const pendingIssues  = issues.filter(i => i.status === 'Pending').length;
  const hasHarvests    = approvedHarvests.length > 0;

  // ── Harvest chart (real data, last 7 days) ─────────────────────────
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });

  const chartData = last7Days.map((date) => {
    // Only include Approved harvests in the chart bars
    const dayHarvests = approvedHarvests.filter(h => h.date === date);
    const qty = dayHarvests.reduce((s, h) => s + parseFloat(h.quantity || 0), 0);
    return { day: new Date(date).toLocaleDateString('en-LK', { weekday: 'short' }).toUpperCase().slice(0, 3), qty, date };
  });
  const maxQty = Math.max(...chartData.map(d => d.qty), 1);

  // ── Recent activities — only approved harvests ────────────────────
  const recentActivities = [
    ...approvedHarvests.slice(0, 2).map(h => ({ type: 'Harvest', text: `${h.worker} logged ${h.quantity}kg ${h.fruitType}`, value: `${h.quantity} kg`, time: h.date, status: 'Approved', icon: 'agriculture', color: 'primary' })),
    ...sales.slice(0, 2).map(s => ({ type: 'Sale', text: `New sale of ${s.quantity}kg ${s.fruitType} to ${s.buyerName}`, value: `Rs. ${s.totalPrice?.toLocaleString()}`, time: s.date, status: s.status, icon: 'sell', color: 'secondary' })),
    ...issues.slice(0, 2).map(i => ({ type: 'Issue', text: `${i.issueType} reported at ${i.location}`, value: 'N/A', time: i.reportedAt?.split(' ')[0] || '', status: i.status === 'Pending' ? 'Action Required' : i.status, icon: 'warning', color: 'tertiary' })),
  ].slice(0, 5);

  const statusStyle = (s) => {
    if (s === 'Verified' || s === 'Resolved' || s === 'Delivered') return 'bg-primary-fixed/30 text-primary';
    if (s === 'Pending') return 'bg-secondary-container/20 text-secondary';
    return 'bg-tertiary-container/10 text-tertiary';
  };

  // ── Weather card data ──────────────────────────────────────────────
  const envRows = weather
    ? [
        { label: 'Temperature',  value: `${weather.temp}°C`,          icon: 'thermostat' },
        { label: 'Humidity',     value: `${weather.humidity}%`,        icon: 'water_drop' },
        { label: 'Wind Speed',   value: `${weather.wind} km/h`,        icon: 'air' },
        { label: 'Rainfall',     value: `${weather.rain} mm`,          icon: 'rainy' },
        { label: 'Condition',    value: weather.label,                  icon: 'partly_cloudy_day' },
      ]
    : [];

  return (
    <div className="p-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/10">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-primary-fixed rounded-lg">
              <span className="material-symbols-outlined text-primary">agriculture</span>
            </div>
          </div>
          <p className="text-xs font-label uppercase tracking-widest text-stone-500 mb-1">Total Harvest</p>
          <h3 className="text-2xl font-manrope font-extrabold text-on-surface">{totalHarvest.toFixed(0)} <span className="text-sm font-medium text-stone-400">kg</span></h3>
        </div>

        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/10">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-secondary-fixed rounded-lg">
              <span className="material-symbols-outlined text-secondary">payments</span>
            </div>
          </div>
          <p className="text-xs font-label uppercase tracking-widest text-stone-500 mb-1">Total Sales</p>
          <h3 className="text-2xl font-manrope font-extrabold text-on-surface">Rs. {(totalSales / 1000).toFixed(0)}k</h3>
        </div>

        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/10">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-tertiary-fixed rounded-lg">
              <span className="material-symbols-outlined text-tertiary">trending_down</span>
            </div>
          </div>
          <p className="text-xs font-label uppercase tracking-widest text-stone-500 mb-1">Total Expenses</p>
          <h3 className="text-2xl font-manrope font-extrabold text-on-surface">Rs. {(totalExpenses / 1000).toFixed(0)}k</h3>
        </div>

        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/10">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-surface-container-high rounded-lg">
              <span className="material-symbols-outlined text-on-surface-variant">inventory</span>
            </div>
            {pendingIssues > 0 && (
              <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded">{pendingIssues} issues</span>
            )}
          </div>
          <p className="text-xs font-label uppercase tracking-widest text-stone-500 mb-1">Stock Levels</p>
          <h3 className="text-2xl font-manrope font-extrabold text-on-surface">{stockPercent}% <span className="text-sm font-medium text-stone-400">Capacity</span></h3>
        </div>
      </div>

      {/* Chart & Orchard Block */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">

        {/* Harvest Trend — only shown when there is real data */}
        {hasHarvests ? (
          <div className="lg:col-span-2 bg-surface-container-low p-8 rounded-xl">
            <div className="flex justify-between items-end mb-8">
              <div>
                <h4 className="text-xl font-manrope font-bold text-primary">Harvest Trends</h4>
                <p className="text-sm text-stone-500">Daily output — last 7 days</p>
              </div>
              <span className="text-xs text-stone-400">{totalHarvest.toFixed(0)} kg total</span>
            </div>

            <div className="h-48 flex items-end justify-between gap-3">
              {chartData.map((item, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1 group hover:opacity-100 transition-opacity"
                  title={`${item.day}: ${item.qty.toFixed(1)} kg`}>
                  <span className="text-[9px] text-stone-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.qty > 0 ? `${item.qty.toFixed(0)}kg` : ''}
                  </span>
                  <div className="w-full flex items-end h-36">
                    <div
                      className={`w-full rounded-t transition-all ${item.qty > 0 ? 'bg-primary' : 'bg-surface-container-highest'}`}
                      style={{ height: item.qty > 0 ? `${(item.qty / maxQty) * 100}%` : '4px' }}
                    />
                  </div>
                  <span className="text-[10px] font-label font-bold text-stone-400">{item.day}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-outline-variant/20 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-primary inline-block" />
              <span className="text-xs text-stone-500">Harvest quantity (kg) per day</span>
            </div>
          </div>
        ) : (
          /* Placeholder shown only when NO harvest data */
          <div className="lg:col-span-2 bg-surface-container-low p-8 rounded-xl flex flex-col items-center justify-center text-center min-h-[280px]">
            <span className="material-symbols-outlined text-5xl text-stone-300 mb-4">bar_chart</span>
            <h4 className="text-lg font-manrope font-bold text-stone-400 mb-2">No Harvest Data Yet</h4>
            <p className="text-sm text-stone-400 max-w-xs">The harvest trend chart will appear here once workers start recording harvests. Go to <strong>Record Harvest</strong> to add data.</p>
            <button onClick={() => navigate('/admin/record')}
              className="mt-5 px-5 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:opacity-90 transition-opacity">
              Record First Harvest
            </button>
          </div>
        )}

        {/* Orchard Block card */}
        <div className="bg-surface-container-low rounded-xl flex flex-col overflow-hidden">
          <div className="h-44 relative">
            <div className="w-full h-full bg-gradient-to-br from-green-800 to-green-600 flex items-end p-6">
              <div>
                <h5 className="text-white font-manrope font-bold">Pahala Gomuwa – Block A</h5>
                <p className="text-green-200 text-xs">Peak Harvest Condition</p>
              </div>
            </div>
          </div>
          <div className="p-6 flex-1 flex flex-col justify-between">
            <div className="space-y-4">
              {[
                { label: 'Soil Moisture', value: 72, unit: '%', color: 'bg-primary' },
                { label: 'Pest Risk',     value: 18, unit: '% Low', color: 'bg-green-500' },
              ].map(({ label, value, unit, color }) => (
                <div key={label}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-stone-500 font-label uppercase">{label}</span>
                    <span className="text-sm font-bold text-primary">{value}{unit.includes('Low') ? '' : '%'} <span className="text-stone-400 font-normal">{unit.includes('Low') ? 'Low' : ''}</span></span>
                  </div>
                  <div className="w-full bg-surface-container-highest h-1.5 rounded-full">
                    <div className={`${color} h-full rounded-full`} style={{ width: `${value}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => navigate('/admin/inventory')}
              className="mt-4 w-full py-3 bg-surface-container-highest hover:bg-surface-container-high transition-colors text-primary font-manrope text-xs font-bold rounded-lg uppercase tracking-widest">
              View Inventory
            </button>
          </div>
        </div>
      </div>

      {/* Live Weather — Nuwara Eliya */}
      <div className="bg-surface-container-low rounded-xl p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">cloud</span>
            <h4 className="text-lg font-manrope font-bold text-primary">Live Weather — Nuwara Eliya</h4>
          </div>
          {weather && (
            <span className="text-[10px] text-stone-400 flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">schedule</span>
              Updated {weather.updated}
            </span>
          )}
        </div>

        {weatherLoading && !weather && (
          <div className="flex items-center gap-3 text-stone-400 text-sm py-4">
            <span className="material-symbols-outlined animate-spin">refresh</span>
            Fetching live weather data…
          </div>
        )}

        {weatherError && !weather && (
          <div className="flex items-center gap-2 text-red-500 text-sm py-2">
            <span className="material-symbols-outlined text-base">error</span>
            {weatherError}
          </div>
        )}

        {weather && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {envRows.map(d => (
              <div key={d.label} className="flex flex-col items-center bg-surface-container-high/50 rounded-xl p-4 text-center">
                <span className="material-symbols-outlined text-stone-500 text-xl mb-1">{d.icon}</span>
                <span className="text-lg font-extrabold text-on-surface">{d.value}</span>
                <span className="text-[10px] text-stone-400 uppercase font-bold tracking-wider mt-0.5">{d.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Activities */}
      <section className="bg-surface-container-low rounded-xl overflow-hidden">
        <div className="px-8 py-5 flex justify-between items-center border-b border-outline-variant/10">
          <h4 className="text-lg font-manrope font-bold text-primary">Recent Activities</h4>
          <button className="text-primary text-sm font-bold hover:underline" onClick={() => navigate('/admin/issues')}>View All</button>
        </div>

        {recentActivities.length === 0 ? (
          <div className="py-16 text-center text-stone-400">
            <span className="material-symbols-outlined text-4xl block mb-3">history</span>
            <p className="text-sm">No activities yet. Start recording harvests, sales, or issues.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-surface-container-high/50">
                <tr>
                  {['Activity', 'Category', 'Value / Amount', 'Date', 'Status'].map(h => (
                    <th key={h} className="px-8 py-4 text-[10px] font-label font-bold uppercase tracking-widest text-stone-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {recentActivities.map((act, i) => (
                  <tr key={i} className="hover:bg-surface transition-colors">
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full bg-${act.color}-fixed flex items-center justify-center`}>
                          <span className={`material-symbols-outlined text-sm text-${act.color}`}>{act.icon}</span>
                        </div>
                        <span className="text-sm font-medium text-on-surface">{act.text}</span>
                      </div>
                    </td>
                    <td className="px-8 py-4 text-sm text-stone-500">{act.type}</td>
                    <td className="px-8 py-4 text-sm font-bold text-on-surface">{act.value}</td>
                    <td className="px-8 py-4 text-sm text-stone-400">{act.time}</td>
                    <td className="px-8 py-4">
                      <span className={`px-3 py-1 text-[10px] font-bold rounded-full uppercase ${statusStyle(act.status)}`}>{act.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
