import React, { useState } from 'react';
import { useApp } from '../context/useApp';

const FRUIT_VARIETIES = ['Valencia Orange', 'Bing Cherry', 'Granny Smith Apple', 'Blueberry', 'Alphonso Mango', 'Meyer Lemon'];
const BUYERS = ['Keells Super Colombo', 'Cargills Food City', 'Arpico Supercentre', 'Laugfs Supermarket', 'Lanka Sathosa', 'Sathosa Motors PLC', 'Other'];
const EXPENSE_CATEGORIES = ['Labor', 'Fertilizer', 'Pesticides', 'Tools & Tech', 'Transport', 'Maintenance', 'Miscellaneous'];

export default function SalesExpenses() {
  const { sales, expenses, addSale, addExpense, inventory, fruits } = useApp();
  const [activeTab, setActiveTab] = useState('sales');
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem('agroNest_expense_categories');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return EXPENSE_CATEGORIES;
  });
  const [saleForm, setSaleForm] = useState({ date: new Date().toISOString().split('T')[0], buyerName: '', fruitType: '', quantity: '', unitPrice: '', status: 'Pending' });
  const [expenseForm, setExpenseForm] = useState({ date: new Date().toISOString().split('T')[0], category: 'Labor', amount: '', notes: '', status: 'Pending' });
  const [saleSuccess, setSaleSuccess] = useState(false);
  const [expenseSuccess, setExpenseSuccess] = useState(false);
  const [searchSale, setSearchSale] = useState('');
  const [searchExpense, setSearchExpense] = useState('');
  const [filterExpense, setFilterExpense] = useState('All');

  const openSaleModal = () => {
    setSaleForm({
      date: new Date().toISOString().split('T')[0],
      buyerName: '',
      fruitType: fruits[0]?.name || '',
      quantity: '',
      unitPrice: '',
      status: 'Pending'
    });
    setShowSaleModal(true);
  };

  const totalRevenue = sales.reduce((s, i) => s + i.totalPrice, 0);
  const totalExpenses = expenses.reduce((s, i) => s + i.amount, 0);
  const netProfit = totalRevenue - totalExpenses;

  const filteredSales = sales.filter(s =>
    s.buyerName.toLowerCase().includes(searchSale.toLowerCase()) ||
    s.fruitType.toLowerCase().includes(searchSale.toLowerCase())
  );

  const filteredExpenses = expenses.filter(e =>
    (filterExpense === 'All' || e.category === filterExpense) &&
    (e.notes.toLowerCase().includes(searchExpense.toLowerCase()) || e.category.toLowerCase().includes(searchExpense.toLowerCase()))
  );

  const expenseCategoryTotals = categories.map(cat => ({
    cat, total: expenses.filter(e => e.category === cat).reduce((s, e) => s + e.amount, 0)
  })).filter(x => x.total > 0);
  const maxExpense = Math.max(...expenseCategoryTotals.map(x => x.total), 1);

  const handleAddSale = (e) => {
    e.preventDefault();
    const total = parseFloat(saleForm.quantity) * parseFloat(saleForm.unitPrice);
    addSale({ ...saleForm, quantity: parseFloat(saleForm.quantity), unitPrice: parseFloat(saleForm.unitPrice), totalPrice: total });
    setShowSaleModal(false);
    setSaleSuccess(true);
    setTimeout(() => setSaleSuccess(false), 3000);
    setSaleForm({ date: new Date().toISOString().split('T')[0], buyerName: '', fruitType: fruits[0]?.name || '', quantity: '', unitPrice: '', status: 'Pending' });
  };

  const handleAddExpense = (e) => {
    e.preventDefault();
    addExpense({ ...expenseForm, amount: parseFloat(expenseForm.amount) });

    const newCat = expenseForm.category.trim();
    if (newCat && !categories.includes(newCat)) {
      const updatedCats = [...categories, newCat];
      setCategories(updatedCats);
      localStorage.setItem('agroNest_expense_categories', JSON.stringify(updatedCats));
    }

    setShowExpenseModal(false);
    setExpenseSuccess(true);
    setTimeout(() => setExpenseSuccess(false), 3000);
    setExpenseForm({ date: new Date().toISOString().split('T')[0], category: 'Labor', amount: '', notes: '', status: 'Pending' });
  };

  const statusStyle = (s) => {
    if (s === 'Delivered' || s === 'Approved') return 'bg-green-100 text-green-700';
    if (s === 'In Transit') return 'bg-blue-100 text-blue-700';
    return 'bg-yellow-100 text-yellow-700';
  };

  const exportCSV = () => {
    const data = activeTab === 'sales' ? filteredSales : filteredExpenses;
    const keys = activeTab === 'sales' ? ['date', 'buyerName', 'fruitType', 'quantity', 'unitPrice', 'totalPrice', 'status'] : ['date', 'category', 'amount', 'notes', 'status'];
    const csv = [keys.join(','), ...data.map(r => keys.map(k => r[k]).join(','))].join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv,' + encodeURIComponent(csv);
    a.download = `agronest_${activeTab}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="p-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-[#173416] text-white p-6 rounded-xl">
          <p className="text-xs uppercase tracking-widest opacity-70 mb-2">Total Revenue</p>
          <h3 className="text-3xl font-black">Rs. {(totalRevenue/1000).toFixed(1)}k</h3>
          <p className="text-xs mt-2 opacity-70">+12.4% from last quarter</p>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10 shadow-sm">
          <p className="text-xs uppercase tracking-widest text-stone-500 mb-2">Total Expenses</p>
          <h3 className="text-3xl font-black text-red-500">Rs. {(totalExpenses/1000).toFixed(1)}k</h3>
          <p className="text-xs mt-2 text-stone-400">{Math.round((totalExpenses / (totalRevenue || 1)) * 100)}% of monthly budget</p>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10 shadow-sm">
          <p className="text-xs uppercase tracking-widest text-stone-500 mb-2">Net Profit</p>
          <h3 className={`text-3xl font-black ${netProfit >= 0 ? 'text-green-600' : 'text-red-500'}`}>Rs. {(netProfit/1000).toFixed(1)}k</h3>
          <p className="text-xs mt-2 text-stone-400">Sales minus all expenses</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-surface-container-high p-1 rounded-xl w-fit mb-6">
        <button onClick={() => setActiveTab('sales')} className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all ${activeTab === 'sales' ? 'bg-[#173416] text-white shadow-sm' : 'text-stone-600 hover:text-on-surface'}`}>
          Sales Ledger
        </button>
        <button onClick={() => setActiveTab('expenses')} className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all ${activeTab === 'expenses' ? 'bg-[#173416] text-white shadow-sm' : 'text-stone-600 hover:text-on-surface'}`}>
          Expense Tracker
        </button>
      </div>

      {saleSuccess && <div className="mb-4 p-4 bg-green-100 text-green-800 rounded-lg flex items-center gap-2 text-sm font-medium"><span className="material-symbols-outlined">check_circle</span>Sale recorded! Inventory updated automatically.</div>}
      {expenseSuccess && <div className="mb-4 p-4 bg-blue-100 text-blue-800 rounded-lg flex items-center gap-2 text-sm font-medium"><span className="material-symbols-outlined">check_circle</span>Expense recorded successfully.</div>}

      {/* SALES TAB */}
      {activeTab === 'sales' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
            <h3 className="text-xl font-manrope font-bold text-[#173416]">Detailed Sales Transactions</h3>
            <div className="flex gap-3">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm">search</span>
                <input value={searchSale} onChange={e => setSearchSale(e.target.value)} placeholder="Filter by buyer..."
                  className="pl-9 pr-4 py-2 bg-surface-container-high rounded-lg text-sm border-none outline-none w-48" />
              </div>
              <button onClick={exportCSV} className="flex items-center gap-2 border border-outline-variant/30 px-4 py-2 rounded-lg text-sm font-bold text-stone-600 hover:bg-surface-container-high transition-colors">
                <span className="material-symbols-outlined text-sm">download</span> Export CSV
              </button>
              <button onClick={openSaleModal} className="flex items-center gap-2 bg-[#173416] text-white px-4 py-2 rounded-lg text-sm font-bold hover:opacity-90">
                <span className="material-symbols-outlined text-sm">add</span> New Sale
              </button>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead className="bg-surface-container-high/50">
                <tr>
                  {['Date', 'Buyer Name', 'Fruit Type', 'Quantity', 'Unit Price', 'Total (Rs.)', 'Status'].map(h => (
                    <th key={h} className="px-6 py-4 text-[10px] font-label font-bold uppercase tracking-widest text-stone-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {filteredSales.map(s => (
                  <tr key={s.id} className="hover:bg-surface transition-colors">
                    <td className="px-6 py-4 text-sm text-stone-500">{s.date}</td>
                    <td className="px-6 py-4 text-sm font-medium text-on-surface">{s.buyerName}</td>
                    <td className="px-6 py-4 text-sm text-stone-600">{s.fruitType}</td>
                    <td className="px-6 py-4 text-sm font-bold text-on-surface">{s.quantity} kg</td>
                    <td className="px-6 py-4 text-sm text-stone-500">Rs. {s.unitPrice?.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm font-bold text-[#173416]">Rs. {s.totalPrice.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${statusStyle(s.status)}`}>{s.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-6 py-3 border-t border-outline-variant/10 text-xs text-stone-400">Showing {filteredSales.length} transactions</div>
          </div>
        </div>
      )}

      {/* EXPENSES TAB */}
      {activeTab === 'expenses' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                <h3 className="text-xl font-manrope font-bold text-[#173416]">Expense Records</h3>
                <div className="flex gap-3">
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm">search</span>
                    <input value={searchExpense} onChange={e => setSearchExpense(e.target.value)} placeholder="Search notes..."
                      className="pl-9 pr-4 py-2 bg-surface-container-high rounded-lg text-sm border-none outline-none w-44" />
                  </div>
                  <select value={filterExpense} onChange={e => setFilterExpense(e.target.value)} className="px-3 py-2 bg-surface-container-high rounded-lg text-sm border-none outline-none appearance-none">
                    <option>All</option>
                    {categories.map(c => <option key={c}>{c}</option>)}
                  </select>
                  <button onClick={exportCSV} className="flex items-center gap-2 border border-outline-variant/30 px-3 py-2 rounded-lg text-sm font-bold text-stone-600 hover:bg-surface-container-high">
                    <span className="material-symbols-outlined text-sm">download</span> CSV
                  </button>
                  <button onClick={() => setShowExpenseModal(true)} className="flex items-center gap-2 bg-[#173416] text-white px-4 py-2 rounded-lg text-sm font-bold hover:opacity-90">
                    <span className="material-symbols-outlined text-sm">add</span> New Expense
                  </button>
                </div>
              </div>

              <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 overflow-hidden shadow-sm">
                <table className="w-full text-left">
                  <thead className="bg-surface-container-high/50">
                    <tr>
                      {['Date', 'Category', 'Amount (Rs.)', 'Notes', 'Status'].map(h => (
                        <th key={h} className="px-6 py-4 text-[10px] font-label font-bold uppercase tracking-widest text-stone-500">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10">
                    {filteredExpenses.map(exp => (
                      <tr key={exp.id} className="hover:bg-surface transition-colors">
                        <td className="px-6 py-4 text-sm text-stone-500">{exp.date}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${exp.category === 'Labor' ? 'bg-orange-100 text-orange-700' : exp.category === 'Fertilizer' ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-600'}`}>{exp.category}</span>
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-[#173416]">Rs. {exp.amount.toLocaleString()}</td>
                        <td className="px-6 py-4 text-sm text-stone-500 max-w-xs truncate">{exp.notes}</td>
                        <td className="px-6 py-4">
                          <span className={`flex items-center gap-1 text-xs font-bold ${statusStyle(exp.status)}`}>
                            <span className="w-2 h-2 rounded-full inline-block" style={{ background: exp.status === 'Approved' ? '#16a34a' : '#ca8a04' }}></span>
                            {exp.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="px-6 py-3 border-t border-outline-variant/10 text-xs text-stone-400">Showing {filteredExpenses.length} of {expenses.length} entries</div>
              </div>
            </div>

            {/* Category Share */}
            <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10 shadow-sm h-fit">
              <h4 className="font-bold text-[#173416] mb-4">Category Share</h4>
              <div className="space-y-4">
                {expenseCategoryTotals.map(({ cat, total }) => (
                  <div key={cat}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-stone-500 uppercase font-bold tracking-wide">{cat}</span>
                      <span className={`text-xs font-bold ${total / totalExpenses > 0.35 ? 'text-orange-500' : 'text-on-surface'}`}>{Math.round((total / totalExpenses) * 100)}%</span>
                    </div>
                    <div className="w-full bg-surface-container-high h-2 rounded-full">
                      <div className={`h-full rounded-full ${total / totalExpenses > 0.35 ? 'bg-orange-400' : 'bg-primary'}`} style={{ width: `${(total / maxExpense) * 100}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sale Modal */}
      {showSaleModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 overflow-y-auto pt-20 pb-6 px-4 flex justify-center items-start">
          <div className="bg-[#fbf9f2] rounded-2xl shadow-2xl w-full max-w-md p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-[#173416]">Record New Sale</h3>
              <button onClick={() => setShowSaleModal(false)}><span className="material-symbols-outlined text-stone-400">close</span></button>
            </div>
            <form onSubmit={handleAddSale} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1 block">Date</label>
                  <input type="date" required value={saleForm.date} onChange={e => setSaleForm({ ...saleForm, date: e.target.value })}
                    className="w-full bg-surface-container-high px-4 py-3 rounded-lg text-sm border-none outline-none" />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1 block">Status</label>
                  <select value={saleForm.status} onChange={e => setSaleForm({ ...saleForm, status: e.target.value })}
                    className="w-full bg-surface-container-high px-4 py-3 rounded-lg text-sm border-none outline-none appearance-none">
                    <option>Pending</option><option>Delivered</option><option>In Transit</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1 block">Buyer Name</label>
                <input required value={saleForm.buyerName} onChange={e => setSaleForm({ ...saleForm, buyerName: e.target.value })} placeholder="e.g. Keells Super Colombo"
                  className="w-full bg-surface-container-high px-4 py-3 rounded-lg text-sm border-none outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1 block">Fruit Type</label>
                <select value={saleForm.fruitType} onChange={e => setSaleForm({ ...saleForm, fruitType: e.target.value })}
                  className="w-full bg-surface-container-high px-4 py-3 rounded-lg text-sm border-none outline-none appearance-none">
                  {fruits.length === 0 ? (
                    <option value="">No fruits registered</option>
                  ) : (
                    fruits.map(f => <option key={f.id} value={f.name}>{f.name}</option>)
                  )}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1 block">Quantity (kg)</label>
                  <input type="number" required min="1" value={saleForm.quantity} onChange={e => setSaleForm({ ...saleForm, quantity: e.target.value })} placeholder="0"
                    className="w-full bg-surface-container-high px-4 py-3 rounded-lg text-sm border-none outline-none" />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1 block">Unit Price (Rs./kg)</label>
                  <input type="number" required min="1" value={saleForm.unitPrice} onChange={e => setSaleForm({ ...saleForm, unitPrice: e.target.value })} placeholder="0"
                    className="w-full bg-surface-container-high px-4 py-3 rounded-lg text-sm border-none outline-none" />
                </div>
              </div>
              {saleForm.quantity && saleForm.unitPrice && (
                <div className="bg-primary-fixed p-3 rounded-lg text-center">
                  <span className="text-xs text-stone-500 uppercase font-bold">Total Amount</span>
                  <p className="text-xl font-black text-primary">Rs. {(parseFloat(saleForm.quantity) * parseFloat(saleForm.unitPrice)).toLocaleString()}</p>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowSaleModal(false)} className="flex-1 py-3 border border-outline-variant/30 rounded-lg text-sm font-bold text-stone-600">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-[#173416] text-white rounded-lg text-sm font-bold hover:opacity-90">Record Sale</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Expense Modal */}
      {showExpenseModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 overflow-y-auto pt-20 pb-6 px-4 flex justify-center items-start">
          <div className="bg-[#fbf9f2] rounded-2xl shadow-2xl w-full max-w-md p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-[#173416]">Record New Expense</h3>
              <button onClick={() => setShowExpenseModal(false)}><span className="material-symbols-outlined text-stone-400">close</span></button>
            </div>
            <form onSubmit={handleAddExpense} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1 block">Date</label>
                  <input type="date" required value={expenseForm.date} onChange={e => setExpenseForm({ ...expenseForm, date: e.target.value })}
                    className="w-full bg-surface-container-high px-4 py-3 rounded-lg text-sm border-none outline-none" />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1 block">Category</label>
                  <input
                    type="text"
                    list="expense-categories"
                    required
                    value={expenseForm.category}
                    onChange={e => setExpenseForm({ ...expenseForm, category: e.target.value })}
                    className="w-full bg-surface-container-high px-4 py-3 rounded-lg text-sm border-none outline-none"
                    placeholder="Select or type..."
                  />
                  <datalist id="expense-categories">
                    {categories.map(c => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1 block">Amount (Rs.)</label>
                <input type="number" required min="1" value={expenseForm.amount} onChange={e => setExpenseForm({ ...expenseForm, amount: e.target.value })} placeholder="0"
                  className="w-full bg-surface-container-high px-4 py-3 rounded-lg text-sm border-none outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1 block">Notes / Description</label>
                <textarea rows={3} value={expenseForm.notes} onChange={e => setExpenseForm({ ...expenseForm, notes: e.target.value })} placeholder="Describe the expense..."
                  className="w-full bg-surface-container-high px-4 py-3 rounded-lg text-sm border-none outline-none resize-none" />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1 block">Status</label>
                <select value={expenseForm.status} onChange={e => setExpenseForm({ ...expenseForm, status: e.target.value })}
                  className="w-full bg-surface-container-high px-4 py-3 rounded-lg text-sm border-none outline-none appearance-none">
                  <option>Pending</option><option>Approved</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowExpenseModal(false)} className="flex-1 py-3 border border-outline-variant/30 rounded-lg text-sm font-bold text-stone-600">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-[#173416] text-white rounded-lg text-sm font-bold hover:opacity-90">Record Expense</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
