import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { useState } from 'react';
import './AppLayout.css';

const TITLES = {
  '/dashboard': 'Dashboard',
  '/operations/receipts': 'Receipts',
  '/operations/deliveries': 'Delivery',
  '/operations/adjustments': 'Adjustment',
  '/stock': 'Stock',
  '/move-history': 'Move History',
  '/settings/warehouses': 'Warehouse',
  '/settings/locations': 'Locations',
  '/profile': 'My Profile',
};

export default function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const basePath = '/' + location.pathname.split('/').slice(1, 3).join('/');
  const title = TITLES[location.pathname] || TITLES[basePath] || 'CoreInventory';

  return (
    <div className="app-layout">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(c => !c)}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}
      <div className={`app-main ${sidebarCollapsed ? 'main-expanded' : ''}`}>
        <TopBar
          title={title}
          onMenuToggle={() => setSidebarOpen(o => !o)}
        />
        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
