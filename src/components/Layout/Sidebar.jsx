import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Package, Tags, RefreshCw, ClipboardList,
  Truck, ArrowLeftRight, ClipboardCheck, History, Settings,
  Warehouse, User, LogOut, ChevronDown, ChevronRight, Box
} from 'lucide-react';
import { useState } from 'react';
import './Sidebar.css';

export default function Sidebar({ collapsed, onToggle, isOpen, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [openMenus, setOpenMenus] = useState({ products: true, operations: true });

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
        <div className="brand-icon"><Box size={22} /></div>
        {!collapsed && <span className="brand-text">Core<span className="brand-accent">Inventory</span></span>}
      </div>

      <nav className="sidebar-nav" onClick={handleNavClick}>
        <NavLink to="/dashboard" className="nav-item">
          <LayoutDashboard size={18} />
          {!collapsed && <span>Dashboard</span>}
        </NavLink>

        {/* Products Group */}
        <div className="nav-group">
          <button className="nav-group-toggle" onClick={() => toggleMenu('products')}>
            <Package size={18} />
            {!collapsed && (
              <>
                <span>Products</span>
                {openMenus.products ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </>
            )}
          </button>
          {openMenus.products && !collapsed && (
            <div className="nav-group-items">
              <NavLink to="/products" end className="nav-item sub">
                <Package size={15} /> <span>All Products</span>
              </NavLink>
              <NavLink to="/products/categories" className="nav-item sub">
                <Tags size={15} /> <span>Categories</span>
              </NavLink>
              <NavLink to="/products/reorder-rules" className="nav-item sub">
                <RefreshCw size={15} /> <span>Reorder Rules</span>
              </NavLink>
            </div>
          )}
        </div>

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
                <ClipboardCheck size={15} /> <span>Receipts</span>
              </NavLink>
              <NavLink to="/operations/deliveries" className="nav-item sub">
                <Truck size={15} /> <span>Deliveries</span>
              </NavLink>
              <NavLink to="/operations/transfers" className="nav-item sub">
                <ArrowLeftRight size={15} /> <span>Transfers</span>
              </NavLink>
              <NavLink to="/operations/adjustments" className="nav-item sub">
                <ClipboardList size={15} /> <span>Adjustments</span>
              </NavLink>
              <NavLink to="/operations/move-history" className="nav-item sub">
                <History size={15} /> <span>Move History</span>
              </NavLink>
            </div>
          )}
        </div>

        <div className="nav-divider" />

        <NavLink to="/settings/warehouses" className="nav-item">
          <Warehouse size={18} />
          {!collapsed && <span>Warehouses</span>}
        </NavLink>
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
            <div className="user-avatar">{user.name?.charAt(0).toUpperCase()}</div>
            <div className="user-info">
              <span className="user-name">{user.name}</span>
              <span className="user-role">{user.role}</span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
