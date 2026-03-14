import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { getTotalStock, getFreeToUse, getStockStatus } from '../data/store';
import StatusBadge from '../components/common/StatusBadge';
import {
  Package, AlertTriangle, ClipboardCheck, Truck,
  Activity, TrendingUp, Clock, AlertCircle
} from 'lucide-react';
import './Dashboard.css';

export default function Dashboard() {
  const {
    products, receipts, deliveries, movements,
    getWarehouseName, getLowStockProducts, getOutOfStockProducts
  } = useApp();
  const navigate = useNavigate();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Receipt KPIs
  const activeReceipts = receipts.filter(r => r.status !== 'Done' && r.status !== 'Canceled');
  const receiptsToReceive = receipts.filter(r => r.status === 'Ready').length;
  const receiptsLate = activeReceipts.filter(r => {
    if (!r.scheduleDate) return false;
    return new Date(r.scheduleDate) < today;
  }).length;
  const receiptOperations = activeReceipts.length;

  // Delivery KPIs
  const activeDeliveries = deliveries.filter(d => d.status !== 'Done' && d.status !== 'Canceled');
  const deliveriesToDeliver = deliveries.filter(d => d.status === 'Ready').length;
  const deliveriesLate = activeDeliveries.filter(d => {
    if (!d.scheduleDate) return false;
    return new Date(d.scheduleDate) < today;
  }).length;
  const deliveriesWaiting = deliveries.filter(d => d.status === 'Waiting').length;
  const deliveryOperations = activeDeliveries.length;

  // Stock alerts
  const lowStock = getLowStockProducts();
  const outOfStock = getOutOfStockProducts();
  const alertProducts = [...outOfStock, ...lowStock];

  // Recent activity
  const recentMovements = [...movements]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 8);

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p className="page-subtitle">Overview of your inventory operations</p>
        </div>
      </div>

      {/* Operations KPI Cards */}
      <div className="ops-kpi-grid">
        {/* Receipt Card */}
        <div
          className="card ops-kpi-card ops-kpi-receipt"
          onClick={() => navigate('/operations/receipts')}
          style={{ cursor: 'pointer' }}
        >
          <div className="ops-kpi-header">
            <div className="ops-kpi-icon">
              <ClipboardCheck size={22} />
            </div>
            <h3>Receipts</h3>
          </div>
          <div className="ops-kpi-metrics">
            <div className="ops-metric">
              <span className="ops-metric-value">{receiptsToReceive}</span>
              <span className="ops-metric-label">To Receive</span>
            </div>
            <div className="ops-metric ops-metric-late">
              <span className="ops-metric-value">{receiptsLate}</span>
              <span className="ops-metric-label">Late</span>
            </div>
            <div className="ops-metric">
              <span className="ops-metric-value">{receiptOperations}</span>
              <span className="ops-metric-label">Operations</span>
            </div>
          </div>
        </div>

        {/* Delivery Card */}
        <div
          className="card ops-kpi-card ops-kpi-delivery"
          onClick={() => navigate('/operations/deliveries')}
          style={{ cursor: 'pointer' }}
        >
          <div className="ops-kpi-header">
            <div className="ops-kpi-icon">
              <Truck size={22} />
            </div>
            <h3>Deliveries</h3>
          </div>
          <div className="ops-kpi-metrics">
            <div className="ops-metric">
              <span className="ops-metric-value">{deliveriesToDeliver}</span>
              <span className="ops-metric-label">To Deliver</span>
            </div>
            <div className="ops-metric ops-metric-late">
              <span className="ops-metric-value">{deliveriesLate}</span>
              <span className="ops-metric-label">Late</span>
            </div>
            <div className="ops-metric ops-metric-waiting">
              <span className="ops-metric-value">{deliveriesWaiting}</span>
              <span className="ops-metric-label">Waiting</span>
            </div>
            <div className="ops-metric">
              <span className="ops-metric-value">{deliveryOperations}</span>
              <span className="ops-metric-label">Operations</span>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div
          className="card ops-kpi-card ops-kpi-products"
          onClick={() => navigate('/stock')}
          style={{ cursor: 'pointer' }}
        >
          <div className="ops-kpi-header">
            <div className="ops-kpi-icon">
              <Package size={22} />
            </div>
            <h3>Products</h3>
          </div>
          <div className="ops-kpi-metrics">
            <div className="ops-metric">
              <span className="ops-metric-value">{products.length}</span>
              <span className="ops-metric-label">Total</span>
            </div>
            <div className="ops-metric ops-metric-warning">
              <span className="ops-metric-value">{lowStock.length}</span>
              <span className="ops-metric-label">Low Stock</span>
            </div>
            <div className="ops-metric ops-metric-late">
              <span className="ops-metric-value">{outOfStock.length}</span>
              <span className="ops-metric-label">Out of Stock</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Grid */}
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
