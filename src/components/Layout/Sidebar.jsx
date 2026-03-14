import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, ClipboardList, ClipboardCheck, Truck, Package,
  History, Settings, Warehouse, MapPin, User, LogOut, ChevronDown, ChevronRight, Layers, Sliders
} from 'lucide-react';
import { useState } from 'react';
import './Sidebar.css';

export default function Sidebar({ collapsed, onToggle, isOpen, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [openMenus, setOpenMenus] = useState({ operations: true, settings: true });

  const toggleMenu = (key) => {
    setOpenMenus(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleLogout = () => {
    onClose?.();
    logout();
    navigate('/login');
  };

  const handleNavClick = (e) => {
    if (e.target.closest('a')) {
      onClose?.();
    }
  };

  return (
    <aside className={`sidebar ${collapsed ? 'sidebar-collapsed' : ''} ${isOpen ? 'sidebar-open' : ''}`}>
      <div className="sidebar-brand">
        <div className="brand-icon"><Layers size={22} /></div>
        {!collapsed && <span className="brand-text">Re<span className="brand-accent">Core</span></span>}
      </div>

      <nav className="sidebar-nav" onClick={handleNavClick}>
        <NavLink to="/dashboard" className="nav-item">
          <LayoutDashboard size={18} />
          {!collapsed && <span>Dashboard</span>}
        </NavLink>

        {/* Operations Group */}
        <div className="nav-group">
          <button className="nav-group-toggle" onClick={() => toggleMenu('operations')}>
            <ClipboardList size={18} />
            {!collapsed && (
              <>
                <span>Operations</span>
                {openMenus.operations ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </>
            )}
          </button>
          {openMenus.operations && !collapsed && (
            <div className="nav-group-items">
              <NavLink to="/operations/receipts" className="nav-item sub">
                <ClipboardCheck size={15} /> <span>Receipt</span>
              </NavLink>
              <NavLink to="/operations/deliveries" className="nav-item sub">
                <Truck size={15} /> <span>Delivery</span>
              </NavLink>
              <NavLink to="/operations/adjustments" className="nav-item sub">
                <Sliders size={15} /> <span>Adjustment</span>
              </NavLink>
            </div>
          )}
        </div>

        <NavLink to="/stock" className="nav-item">
          <Package size={18} />
          {!collapsed && <span>Stock</span>}
        </NavLink>

        <NavLink to="/move-history" className="nav-item">
          <History size={18} />
          {!collapsed && <span>Move History</span>}
        </NavLink>

        <div className="nav-divider" />

        {/* Settings Group */}
        <div className="nav-group">
          <button className="nav-group-toggle" onClick={() => toggleMenu('settings')}>
            <Settings size={18} />
            {!collapsed && (
              <>
                <span>Settings</span>
                {openMenus.settings ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </>
            )}
          </button>
          {openMenus.settings && !collapsed && (
            <div className="nav-group-items">
              <NavLink to="/settings/warehouses" className="nav-item sub">
                <Warehouse size={15} /> <span>Warehouse</span>
              </NavLink>
              <NavLink to="/settings/locations" className="nav-item sub">
                <MapPin size={15} /> <span>Locations</span>
              </NavLink>
            </div>
          )}
        </div>
      </nav>

      <div className="sidebar-footer">
        <div className="nav-divider" />
        <NavLink to="/profile" className="nav-item">
          <User size={18} />
          {!collapsed && <span>My Profile</span>}
        </NavLink>
        <button className="nav-item logout-btn" onClick={handleLogout}>
          <LogOut size={18} />
          {!collapsed && <span>Logout</span>}
        </button>
        {!collapsed && user && (
          <div className="sidebar-user">
            <div className="user-avatar">{(user.loginId || user.name || 'U').charAt(0).toUpperCase()}</div>
            <div className="user-info">
              <span className="user-name">{user.loginId || user.name}</span>
              <span className="user-role">{user.role}</span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
