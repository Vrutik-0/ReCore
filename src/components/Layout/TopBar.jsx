import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Bell, Menu, X, Package, Warehouse,
  ClipboardCheck, Truck, ClipboardList, AlertTriangle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import './TopBar.css';

export default function TopBar({ title, onMenuToggle }) {
  const { user } = useAuth();
  const {
    products, warehouses, receipts, deliveries, adjustments,
    getLowStockProducts, getOutOfStockProducts
  } = useApp();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const searchRef = useRef(null);
  const searchInputRef = useRef(null);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);

  const searchResults = useMemo(() => {
    if (!searchQuery || searchQuery.length < 2) return null;
    const q = searchQuery.toLowerCase();
    const results = {};

    const matchedProducts = products.filter(p =>
      p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)
    ).slice(0, 5);
    if (matchedProducts.length) {
      results.products = matchedProducts.map(p => ({
        id: p.id, label: p.name, sub: p.sku, path: '/stock'
      }));
    }

    const matchedWarehouses = warehouses.filter(w =>
      w.name.toLowerCase().includes(q) || w.code.toLowerCase().includes(q)
    ).slice(0, 5);
    if (matchedWarehouses.length) {
      results.warehouses = matchedWarehouses.map(w => ({
        id: w.id, label: w.name, sub: w.code, path: '/settings/warehouses'
      }));
    }

    const matchedReceipts = receipts.filter(r =>
      r.ref.toLowerCase().includes(q) || (r.contact && r.contact.toLowerCase().includes(q))
    ).slice(0, 5);
    if (matchedReceipts.length) {
      results.receipts = matchedReceipts.map(r => ({
        id: r.id, label: r.ref, sub: r.contact || '', path: '/operations/receipts'
      }));
    }

    const matchedDeliveries = deliveries.filter(d =>
      d.ref.toLowerCase().includes(q) || (d.contact && d.contact.toLowerCase().includes(q))
    ).slice(0, 5);
    if (matchedDeliveries.length) {
      results.deliveries = matchedDeliveries.map(d => ({
        id: d.id, label: d.ref, sub: d.contact || '', path: '/operations/deliveries'
      }));
    }

    const matchedAdjustments = adjustments.filter(a =>
      a.ref.toLowerCase().includes(q) || (a.productName && a.productName.toLowerCase().includes(q))
    ).slice(0, 5);
    if (matchedAdjustments.length) {
      results.adjustments = matchedAdjustments.map(a => ({
        id: a.id, label: a.ref, sub: a.productName || '', path: '/operations/adjustments'
      }));
    }

    return Object.keys(results).length > 0 ? results : null;
  }, [searchQuery, products, warehouses, receipts, deliveries, adjustments]);

  const categoryConfig = {
    products:    { label: 'Products',    icon: <Package size={14} /> },
    warehouses:  { label: 'Warehouses',  icon: <Warehouse size={14} /> },
    receipts:    { label: 'Receipts',    icon: <ClipboardCheck size={14} /> },
    deliveries:  { label: 'Deliveries',  icon: <Truck size={14} /> },
    adjustments: { label: 'Adjustments', icon: <ClipboardList size={14} /> },
  };

  const handleResultClick = (path) => {
    navigate(path);
    setSearchQuery('');
    setSearchOpen(false);
    setMobileSearchOpen(false);
  };

  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const lowStock = getLowStockProducts();
  const outOfStock = getOutOfStockProducts();
  const pendingReceipts = receipts.filter(r => r.status === 'Draft' || r.status === 'Ready');
  const pendingDeliveries = deliveries.filter(d => d.status === 'Draft' || d.status === 'Waiting' || d.status === 'Ready');
  const totalNotifications = lowStock.length + outOfStock.length +
    pendingReceipts.length + pendingDeliveries.length;

  const renderSearchResults = () => {
    if (!searchQuery || searchQuery.length < 2) {
      return <div className="search-hint">Type at least 2 characters to search...</div>;
    }
    if (!searchResults) {
      return <div className="search-no-results">No results found for &quot;{searchQuery}&quot;</div>;
    }
    return Object.entries(searchResults).map(([category, items]) => (
      <div key={category} className="search-category">
        <div className="search-category-header">
          {categoryConfig[category]?.icon}
          <span>{categoryConfig[category]?.label}</span>
        </div>
        {items.map(item => (
          <button
            key={item.id}
            className="search-result-item"
            onClick={() => handleResultClick(item.path)}
          >
            <span className="search-result-label">{item.label}</span>
            {item.sub && <span className="search-result-sub">{item.sub}</span>}
          </button>
        ))}
      </div>
    ));
  };

  return (
    <>
      <header className="topbar">
        <div className="topbar-left">
          <button className="topbar-menu-btn btn-ghost btn-icon" onClick={onMenuToggle}>
            <Menu size={20} />
          </button>
          <h1 className="topbar-title">{title}</h1>
        </div>
        <div className="topbar-right">
          <div className="topbar-search" ref={searchRef}>
            <Search size={16} />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search... (Ctrl+K)"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setSearchOpen(true); }}
              onFocus={() => { if (searchQuery.length >= 2) setSearchOpen(true); }}
            />
            {searchOpen && searchQuery.length >= 2 && (
              <div className="search-dropdown">
                {renderSearchResults()}
              </div>
            )}
          </div>

          <button className="topbar-search-mobile" onClick={() => setMobileSearchOpen(true)}>
            <Search size={18} />
          </button>

          <div className="topbar-notification-wrap" ref={notifRef}>
            <button className="topbar-notification" onClick={() => setNotifOpen(o => !o)}>
              <Bell size={18} />
              {totalNotifications > 0 && <span className="notification-dot"></span>}
            </button>
            {notifOpen && (
              <div className="notification-dropdown">
                <div className="notification-header">
                  <strong>Notifications</strong>
                  <span className="notification-count">{totalNotifications}</span>
                </div>
                <div className="notification-body">
                  {totalNotifications === 0 ? (
                    <div className="notification-empty">All clear! No notifications.</div>
                  ) : (
                    <>
                      {outOfStock.length > 0 && (
                        <div className="notification-section">
                          <div className="notification-section-title">
                            <AlertTriangle size={14} /> Out of Stock ({outOfStock.length})
                          </div>
                          {outOfStock.slice(0, 3).map(p => (
                            <button key={p.id} className="notification-item notification-danger"
                              onClick={() => { navigate('/stock'); setNotifOpen(false); }}>
                              {p.name} <span className="notification-item-sub">{p.sku}</span>
                            </button>
                          ))}
                        </div>
                      )}
                      {lowStock.length > 0 && (
                        <div className="notification-section">
                          <div className="notification-section-title">
                            <AlertTriangle size={14} /> Low Stock ({lowStock.length})
                          </div>
                          {lowStock.slice(0, 3).map(p => (
                            <button key={p.id} className="notification-item notification-warning"
                              onClick={() => { navigate('/stock'); setNotifOpen(false); }}>
                              {p.name} <span className="notification-item-sub">{p.sku}</span>
                            </button>
                          ))}
                        </div>
                      )}
                      {pendingReceipts.length > 0 && (
                        <div className="notification-section">
                          <div className="notification-section-title">
                            <ClipboardCheck size={14} /> Pending Receipts ({pendingReceipts.length})
                          </div>
                          {pendingReceipts.slice(0, 3).map(r => (
                            <button key={r.id} className="notification-item"
                              onClick={() => { navigate('/operations/receipts'); setNotifOpen(false); }}>
                              {r.ref} <span className="notification-item-sub">{r.contact}</span>
                            </button>
                          ))}
                        </div>
                      )}
                      {pendingDeliveries.length > 0 && (
                        <div className="notification-section">
                          <div className="notification-section-title">
                            <Truck size={14} /> Pending Deliveries ({pendingDeliveries.length})
                          </div>
                          {pendingDeliveries.slice(0, 3).map(d => (
                            <button key={d.id} className="notification-item"
                              onClick={() => { navigate('/operations/deliveries'); setNotifOpen(false); }}>
                              {d.ref} <span className="notification-item-sub">{d.contact}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="topbar-user">
            <div className="topbar-avatar">{(user?.loginId || user?.name || 'U').charAt(0).toUpperCase()}</div>
          </div>
        </div>
      </header>

      {mobileSearchOpen && (
        <div className="mobile-search-overlay">
          <div className="mobile-search-header">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search products, orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
            <button className="btn btn-ghost btn-icon" onClick={() => { setMobileSearchOpen(false); setSearchQuery(''); }}>
              <X size={18} />
            </button>
          </div>
          <div className="mobile-search-results">
            {renderSearchResults()}
          </div>
        </div>
      )}
    </>
  );
}
