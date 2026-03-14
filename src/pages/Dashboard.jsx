import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { getTotalStock, getStockStatus } from '../data/store';
import KPICard from '../components/Dashboard/KPICard';
import StatusBadge from '../components/common/StatusBadge';
import { Package, AlertTriangle, ClipboardCheck, Truck, ArrowLeftRight, TrendingUp, Activity } from 'lucide-react';
import './Dashboard.css';

export default function Dashboard() {
  const { products, receipts, deliveries, transfers, movements, getWarehouseName, getLowStockProducts, getOutOfStockProducts } = useApp();
  const navigate = useNavigate();

  const totalProducts = products.length;
  const lowStock = getLowStockProducts();
  const outOfStock = getOutOfStockProducts();
  const pendingReceipts = receipts.filter(r => r.status !== 'Done' && r.status !== 'Canceled').length;
  const pendingDeliveries = deliveries.filter(d => d.status !== 'Done' && d.status !== 'Canceled').length;
  const scheduledTransfers = transfers.filter(t => t.status !== 'Done' && t.status !== 'Canceled').length;

  const recentMovements = [...movements].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 8);

  const alertProducts = [...lowStock, ...outOfStock];

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p className="page-subtitle">Overview of your inventory operations</p>
        </div>
      </div>

      <div className="kpi-grid">
        <KPICard icon={<Package size={22} />} label="Total Products" value={totalProducts} color="accent" onClick={() => navigate('/products')} />
        <KPICard icon={<AlertTriangle size={22} />} label="Low / Out of Stock" value={lowStock.length + outOfStock.length} color="warning" onClick={() => navigate('/products')} />
        <KPICard icon={<ClipboardCheck size={22} />} label="Pending Receipts" value={pendingReceipts} color="info" onClick={() => navigate('/operations/receipts')} />
        <KPICard icon={<Truck size={22} />} label="Pending Deliveries" value={pendingDeliveries} color="danger" onClick={() => navigate('/operations/deliveries')} />
        <KPICard icon={<ArrowLeftRight size={22} />} label="Scheduled Transfers" value={scheduledTransfers} color="success" onClick={() => navigate('/operations/transfers')} />
      </div>

      <div className="dashboard-grid">
        {/* Recent Activity */}
        <div className="card dashboard-card">
          <div className="dashboard-card-header">
            <h3><Activity size={16} /> Recent Activity</h3>
          </div>
          <div className="activity-list">
            {recentMovements.length === 0 ? (
              <p className="text-muted" style={{ padding: '20px', textAlign: 'center' }}>No recent activity</p>
            ) : (
              recentMovements.map(m => (
                <div key={m.id} className="activity-item">
                  <div className={`activity-dot dot-${m.type.toLowerCase()}`} />
                  <div className="activity-content">
                    <span className="activity-text">
                      <strong>{m.type}</strong> — {m.productName}
                      {m.quantity > 0 ? ` +${m.quantity}` : ` ${m.quantity}`}
                    </span>
                    <span className="activity-meta">
                      {m.ref} · {new Date(m.date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Stock Alerts */}
        <div className="card dashboard-card">
          <div className="dashboard-card-header">
            <h3><AlertTriangle size={16} /> Stock Alerts</h3>
          </div>
          <div className="alerts-list">
            {alertProducts.length === 0 ? (
              <p className="text-muted" style={{ padding: '20px', textAlign: 'center' }}>All stock levels are healthy</p>
            ) : (
              alertProducts.map(p => (
                <div key={p.id} className="alert-item">
                  <div className="alert-info">
                    <span className="alert-name">{p.name}</span>
                    <span className="alert-sku">{p.sku}</span>
                  </div>
                  <div className="alert-right">
                    <span className="alert-qty">{getTotalStock(p)} {p.uom}</span>
                    <StatusBadge status={getStockStatus(p)} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
