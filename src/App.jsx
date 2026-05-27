import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import DashboardHome from './pages/DashboardHome';
import AdminHarvestRecords from './pages/AdminHarvestRecords';
import RecordHarvest from './pages/RecordHarvest';
import ReportIssues from './pages/ReportIssues';
import WorkerDashboard from './pages/WorkerDashboard';
import WorkerHome from './pages/WorkerHome';
import UserManagement from './pages/UserManagement';
import InventoryManagement from './pages/InventoryManagement';
import SalesExpenses from './pages/SalesExpenses';
import IssueTracker from './pages/IssueTracker';
import ViewInventory from './pages/ViewInventory';
import FruitsManagement from './pages/FruitsManagement';
import OrchardBlocksManagement from './pages/OrchardBlocksManagement';
import { AppProvider } from './context/AppContext';

function App() {
  return (
    <AppProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<AdminDashboard />}>
          <Route index element={<DashboardHome />} />
          <Route path="record" element={<AdminHarvestRecords />} />
          <Route path="inventory" element={<InventoryManagement />} />
          <Route path="sales" element={<SalesExpenses />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="issues" element={<IssueTracker />} />
          <Route path="fruits" element={<FruitsManagement />} />
          <Route path="orchardBlocks" element={<OrchardBlocksManagement />} />
        </Route>
        <Route path="/worker" element={<WorkerDashboard />}>
          <Route index element={<WorkerHome />} />
          <Route path="inventory" element={<ViewInventory />} />
          <Route path="issues" element={<ReportIssues />} />
          <Route path="harvest" element={<RecordHarvest />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AppProvider>
  );
}

export default App;
