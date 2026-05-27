import { useEffect, useState } from 'react';
import AppContext from './AppContextInternal';

const safeFetch = async (url, options = {}) => {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.error || response.statusText || 'API error');
  }
  return response.json();
};

export function AppProvider({ children }) {
  const [inventory, setInventory] = useState([]);
  const [harvests, setHarvests] = useState([]);
  const [sales, setSales] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [issues, setIssues] = useState([]);
  const [users, setUsers] = useState([]);
  const [fruits, setFruits] = useState([]);
  const [orchardBlocks, setOrchardBlocks] = useState([]);
  const [currentUser, setCurrentUserState] = useState(() => {
    if (typeof window === 'undefined') return null;
    const stored = window.localStorage.getItem('agronest-current-user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  const setCurrentUser = (user) => {
    setCurrentUserState(user);
    if (typeof window !== 'undefined') {
      if (user) {
        window.localStorage.setItem('agronest-current-user', JSON.stringify(user));
      } else {
        window.localStorage.removeItem('agronest-current-user');
      }
    }
  };

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const data = await safeFetch('/api/init');
      setInventory(data.inventory || []);
      setHarvests(data.harvests || []);
      setSales(data.sales || []);
      setExpenses(data.expenses || []);
      setIssues(data.issues || []);
      setUsers(data.users || []);
      
      const fruitsData = await safeFetch('/api/fruits');
      setFruits(fruitsData || []);
      
      const blocksData = await safeFetch('/api/orchardBlocks');
      setOrchardBlocks(blocksData || []);
    } catch (error) {
      console.error('Failed to load initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await loadInitialData();
    };
    void fetchData();
  }, []);

  const addHarvest = async (harvest) => {
    const newHarvest = await safeFetch('/api/harvests', {
      method: 'POST',
      body: JSON.stringify(harvest),
    });
    setHarvests((prev) => [newHarvest, ...prev]);
    return newHarvest;
  };

  const updateHarvest = async (id, updated) => {
    const saved = await safeFetch(`/api/harvests/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updated),
    });
    setHarvests((prev) => prev.map((h) => (h.id === id ? saved : h)));
    return saved;
  };

  const deleteHarvest = async (id) => {
    await safeFetch(`/api/harvests/${id}`, { method: 'DELETE' });
    setHarvests((prev) => prev.filter((h) => h.id !== id));
  };

  const approveHarvest = async (id, adminNote = '') => {
    const result = await safeFetch(`/api/harvests/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ adminNote }),
    });
    setHarvests((prev) => prev.map((h) => (h.id === result.harvest.id ? result.harvest : h)));
    if (result.inventory) {
      setInventory((prev) => {
        const exists = prev.some((item) => item.id === result.inventory.id);
        return exists ? prev.map((item) => (item.id === result.inventory.id ? result.inventory : item)) : [result.inventory, ...prev];
      });
    }
    return result.harvest;
  };

  const reverseApprovedHarvest = async (id, adminNote = '') => {
    const result = await safeFetch(`/api/harvests/${id}/reverse`, {
      method: 'POST',
      body: JSON.stringify({ adminNote }),
    });
    setHarvests((prev) => prev.map((h) => (h.id === result.harvest.id ? result.harvest : h)));
    if (result.inventory) {
      setInventory((prev) => prev.map((item) => (item.id === result.inventory.id ? result.inventory : item)));
    }
    return result.harvest;
  };

  const rejectHarvest = async (id, adminNote = '') => {
    const updated = await safeFetch(`/api/harvests/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ adminNote }),
    });
    setHarvests((prev) => prev.map((h) => (h.id === updated.id ? updated : h)));
    return updated;
  };

  const addSale = async (sale) => {
    const created = await safeFetch('/api/sales', {
      method: 'POST',
      body: JSON.stringify(sale),
    });
    setSales((prev) => [created, ...prev]);
    if (created.inventoryUpdate) {
      setInventory((prev) => prev.map((item) => (item.id === created.inventoryUpdate.id ? created.inventoryUpdate : item)));
    }
    return created;
  };

  const addExpense = async (expense) => {
    const created = await safeFetch('/api/expenses', {
      method: 'POST',
      body: JSON.stringify(expense),
    });
    setExpenses((prev) => [created, ...prev]);
    return created;
  };

  const addIssue = async (issue) => {
    const created = await safeFetch('/api/issues', {
      method: 'POST',
      body: JSON.stringify(issue),
    });
    setIssues((prev) => [created, ...prev]);
    return created;
  };

  const updateIssue = async (id, updated) => {
    const saved = await safeFetch(`/api/issues/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updated),
    });
    setIssues((prev) => prev.map((i) => (i.id === id ? saved : i)));
    return saved;
  };

  const deleteIssue = async (id) => {
    await safeFetch(`/api/issues/${id}`, { method: 'DELETE' });
    setIssues((prev) => prev.filter((i) => i.id !== id));
  };

  const updateIssueStatus = async (id, status, adminResponse) => {
    const updated = await safeFetch(`/api/issues/${id}/status`, {
      method: 'POST',
      body: JSON.stringify({ status, adminResponse }),
    });
    setIssues((prev) => prev.map((i) => (i.id === id ? updated : i)));
    return updated;
  };

  const addInventoryItem = async (item) => {
    const created = await safeFetch('/api/inventory', {
      method: 'POST',
      body: JSON.stringify(item),
    });
    setInventory((prev) => [created, ...prev]);
    return created;
  };

  const updateInventoryItem = async (id, updated) => {
    const saved = await safeFetch(`/api/inventory/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updated),
    });
    setInventory((prev) => prev.map((i) => (i.id === id ? saved : i)));
    return saved;
  };

  const deleteInventoryItem = async (id) => {
    await safeFetch(`/api/inventory/${id}`, { method: 'DELETE' });
    setInventory((prev) => prev.filter((i) => i.id !== id));
  };

  const addUser = async (user) => {
    const created = await safeFetch('/api/users', {
      method: 'POST',
      body: JSON.stringify(user),
    });
    setUsers((prev) => [created, ...prev]);
    return created;
  };

  const updateUser = async (id, updated) => {
    const saved = await safeFetch(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updated),
    });
    setUsers((prev) => prev.map((u) => (u.id === id ? saved : u)));
    return saved;
  };

  const deleteUser = async (id) => {
    await safeFetch(`/api/users/${id}`, { method: 'DELETE' });
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  const addFruit = async (fruit) => {
    const result = await safeFetch('/api/fruits', {
      method: 'POST',
      body: JSON.stringify(fruit),
    });
    setFruits((prev) => [result.fruit, ...prev]);
    if (result.inventory) {
      setInventory((prev) => {
        const exists = prev.some((item) => item.id === result.inventory.id);
        return exists ? prev.map((item) => (item.id === result.inventory.id ? result.inventory : item)) : [result.inventory, ...prev];
      });
    }
    return result.fruit;
  };

  const updateFruit = async (id, updated) => {
    const result = await safeFetch(`/api/fruits/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updated),
    });
    setFruits((prev) => prev.map((f) => (f.id === id ? result.fruit : f)));
    if (result.inventory) {
      setInventory((prev) => {
        const exists = prev.some((item) => item.id === result.inventory.id);
        return exists ? prev.map((item) => (item.id === result.inventory.id ? result.inventory : item)) : [result.inventory, ...prev];
      });
    }
    return result.fruit;
  };

  const deleteFruit = async (id) => {
    await safeFetch(`/api/fruits/${id}`, { method: 'DELETE' });
    setFruits((prev) => prev.filter((f) => f.id !== id));
  };

  const addOrchardBlock = async (block) => {
    const created = await safeFetch('/api/orchardBlocks', {
      method: 'POST',
      body: JSON.stringify(block),
    });
    setOrchardBlocks((prev) => [created, ...prev]);
    return created;
  };

  const updateOrchardBlock = async (id, updated) => {
    const saved = await safeFetch(`/api/orchardBlocks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updated),
    });
    setOrchardBlocks((prev) => prev.map((b) => (b.id === id ? saved : b)));
    return saved;
  };

  const deleteOrchardBlock = async (id) => {
    await safeFetch(`/api/orchardBlocks/${id}`, { method: 'DELETE' });
    setOrchardBlocks((prev) => prev.filter((b) => b.id !== id));
  };

  return (
    <AppContext.Provider
      value={{
        inventory,
        harvests,
        sales,
        expenses,
        issues,
        users,
        fruits,
        orchardBlocks,
        currentUser,
        setCurrentUser,
        loading,
        addHarvest,
        updateHarvest,
        deleteHarvest,
        approveHarvest,
        rejectHarvest,
        reverseApprovedHarvest,
        addSale,
        addExpense,
        addIssue,
        updateIssue,
        deleteIssue,
        updateIssueStatus,
        addInventoryItem,
        updateInventoryItem,
        deleteInventoryItem,
        addUser,
        updateUser,
        deleteUser,
        addFruit,
        updateFruit,
        deleteFruit,
        addOrchardBlock,
        updateOrchardBlock,
        deleteOrchardBlock,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
