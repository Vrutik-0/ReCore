import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { getTotalStock } from '../../data/store';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import { Plus, X, Check, List, LayoutGrid, Ban, AlertTriangle } from 'lucide-react';
import '../../components/common/DataTable.css';

const KANBAN_STATUSES = ['Draft', 'Waiting', 'Ready', 'Done'];

export default function Deliveries() {
  const { deliveries, products, warehouses, dispatch, getWarehouseName, getProduct } = useApp();
  const { user } = useAuth();

  const [view, setView] = useState('list');
  const [showForm, setShowForm] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [notification, setNotification] = useState(null);
  const [form, setForm] = useState({
    contact: '',
    deliveryAddress: '',
    scheduleDate: '',
    warehouseId: '',
    responsible: user?.loginId || '',
    items: [{ productId: '', quantity: 0 }],
  });

  const resetForm = () => setForm({
    contact: '',
    deliveryAddress: '',
    scheduleDate: '',
    warehouseId: '',
    responsible: user?.loginId || '',
    items: [{ productId: '', quantity: 0 }],
  });

  const addItem = () => setForm(f => ({ ...f, items: [...f.items, { productId: '', quantity: 0 }] }));
  const removeItem = (idx) => setForm(f => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));
  const updateItem = (idx, key, val) => setForm(f => ({
    ...f,
    items: f.items.map((item, i) => i === idx ? { ...item, [key]: key === 'quantity' ? Number(val) : val } : item),
  }));

  const handleCreate = () => {
    if (!form.contact || !form.warehouseId || form.items.some(i => !i.productId || i.quantity <= 0)) return;
    dispatch({
      type: 'ADD_DELIVERY',
      payload: {
        contact: form.contact,
        deliveryAddress: form.deliveryAddress,
        scheduleDate: form.scheduleDate,
        warehouseId: form.warehouseId,
        responsible: form.responsible,
        items: form.items,
      },
    });
    setShowForm(false);
    resetForm();
  };

  // Check stock and transition Draft -> Waiting or Ready
  const handleCheckStock = (id) => {
    const delivery = deliveries.find(d => d.id === id);
    if (!delivery || delivery.status !== 'Draft') return;

    // Check for out of stock items
    const outOfStockItems = [];
    delivery.items.forEach(item => {
      const p = products.find(pr => pr.id === item.productId);
      if (!p || (p.stock[delivery.warehouseId] || 0) < item.quantity) {
        outOfStockItems.push(p ? p.name : 'Unknown product');
      }
    });

    dispatch({ type: 'CHECK_DELIVERY', payload: id });

    if (outOfStockItems.length > 0) {
      setNotification({
        type: 'warning',
        message: `Insufficient stock for: ${outOfStockItems.join(', ')}. Delivery moved to Waiting.`,
      });
      setTimeout(() => setNotification(null), 5000);
    }
  };

  const handleReadyDelivery = (id) => {
    dispatch({ type: 'READY_DELIVERY', payload: id });
  };

  const handleValidate = (id) => {
    const delivery = deliveries.find(d => d.id === id);
    if (!delivery) return;

    // Final stock check before validation
    for (const item of delivery.items) {
      const product = products.find(p => p.id === item.productId);
      if (!product || (product.stock[delivery.warehouseId] || 0) < item.quantity) {
        setNotification({
          type: 'error',
          message: `Cannot validate: insufficient stock for ${product?.name || 'unknown product'}`,
        });
        setTimeout(() => setNotification(null), 5000);
        return;
      }
    }

    dispatch({ type: 'VALIDATE_DELIVERY', payload: id });
    setNotification({ type: 'success', message: 'Delivery validated and stock updated.' });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleCancel = (id) => {
    dispatch({ type: 'CANCEL_DELIVERY', payload: id });
  };

  // Check if a line item is out of stock for a given delivery
  const isItemOutOfStock = (delivery, item) => {
    const p = products.find(pr => pr.id === item.productId);
    if (!p) return true;
    return (p.stock[delivery.warehouseId] || 0) < item.quantity;
  };

  let filtered = deliveries;
  if (filterStatus) filtered = filtered.filter(d => d.status === filterStatus);

  const columns = [
    { key: 'ref', label: 'Reference' },
    { key: 'contact', label: 'Contact', accessor: (d) => d.contact || d.customer || '—' },
    {
      key: 'scheduleDate', label: 'Schedule Date',
      accessor: (d) => d.scheduleDate ? new Date(d.scheduleDate).toLocaleDateString() : '—',
    },
    {
      key: 'status', label: 'Status',
      render: (d) => <StatusBadge status={d.status} />,
      sortable: false,
    },
    {
      key: 'actions', label: '', sortable: false,
      render: (d) => (
        <div style={{ display: 'flex', gap: 6 }}>
          {d.status === 'Draft' && (
            <>
              <button className="btn btn-primary btn-sm" onClick={(e) => { e.stopPropagation(); handleCheckStock(d.id); }}>
                Check Availability
              </button>
              <button className="btn btn-ghost btn-sm" onClick={(e) => { e.stopPropagation(); handleCancel(d.id); }} style={{ color: 'var(--danger-text)' }}>
                <Ban size={14} />
              </button>
            </>
          )}
          {d.status === 'Waiting' && (
            <>
              <button className="btn btn-primary btn-sm" onClick={(e) => { e.stopPropagation(); handleReadyDelivery(d.id); }}>
                Force Ready
              </button>
              <button className="btn btn-ghost btn-sm" onClick={(e) => { e.stopPropagation(); handleCancel(d.id); }} style={{ color: 'var(--danger-text)' }}>
                <Ban size={14} />
              </button>
            </>
          )}
          {d.status === 'Ready' && (
            <>
              <button className="btn btn-success btn-sm" onClick={(e) => { e.stopPropagation(); handleValidate(d.id); }}>
                <Check size={14} /> Validate
              </button>
              <button className="btn btn-ghost btn-sm" onClick={(e) => { e.stopPropagation(); handleCancel(d.id); }} style={{ color: 'var(--danger-text)' }}>
                <Ban size={14} />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  // Kanban helpers
  const getDeliveriesByStatus = (status) =>
    deliveries.filter(d => d.status === status)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const renderKanbanCard = (d) => {
    const itemEntries = d.items.map(i => {
      const p = getProduct(i.productId);
      const oos = isItemOutOfStock(d, i);
      return { name: p ? p.name : 'Unknown', qty: i.quantity, outOfStock: oos };
    });

    return (
      <div
        key={d.id}
        className="kanban-card"
        onClick={() => setSelectedDelivery(d)}
      >
        <div className="kanban-card-header">
          <span className="kanban-card-ref">{d.ref}</span>
          <StatusBadge status={d.status} />
        </div>
        <div className="kanban-card-body">
          <p className="kanban-card-contact">{d.contact || d.customer || '—'}</p>
          {d.scheduleDate && (
            <p className="kanban-card-date">{new Date(d.scheduleDate).toLocaleDateString()}</p>
          )}
          <div className="kanban-card-items">
            {itemEntries.map((item, idx) => (
              <span
                key={idx}
                className={item.outOfStock && (d.status === 'Waiting' || d.status === 'Draft') ? 'line-out-of-stock' : ''}
              >
                {item.name} x{item.qty}{idx < itemEntries.length - 1 ? ', ' : ''}
              </span>
            ))}
          </div>
        </div>
        <div className="kanban-card-actions">
          {d.status === 'Draft' && (
            <>
              <button className="btn btn-primary btn-sm" onClick={(e) => { e.stopPropagation(); handleCheckStock(d.id); }}>Check</button>
              <button className="btn btn-ghost btn-sm" onClick={(e) => { e.stopPropagation(); handleCancel(d.id); }} style={{ color: 'var(--danger-text)' }}>Cancel</button>
            </>
          )}
          {d.status === 'Waiting' && (
            <button className="btn btn-primary btn-sm" onClick={(e) => { e.stopPropagation(); handleReadyDelivery(d.id); }}>Force Ready</button>
          )}
          {d.status === 'Ready' && (
            <button className="btn btn-success btn-sm" onClick={(e) => { e.stopPropagation(); handleValidate(d.id); }}><Check size={14} /> Validate</button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>Delivery Orders</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <div className="view-toggle">
            <button
              className={`btn btn-sm ${view === 'list' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setView('list')}
            >
              <List size={16} /> List
            </button>
            <button
              className={`btn btn-sm ${view === 'kanban' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setView('kanban')}
            >
              <LayoutGrid size={16} /> Kanban
            </button>
          </div>
          <button className="btn btn-primary" onClick={() => { resetForm(); setShowForm(true); }}>
            <Plus size={16} /> New Delivery
          </button>
        </div>
      </div>

      {/* Notifications */}
      {notification && (
        <div
          className={`notification notification-${notification.type}`}
          style={{ marginBottom: 16 }}
        >
          <AlertTriangle size={16} />
          <span>{notification.message}</span>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setNotification(null)}>
            <X size={14} />
          </button>
        </div>
      )}

      {view === 'list' && (
        <>
          <div className="filter-bar">
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="">All Statuses</option>
              <option>Draft</option>
              <option>Waiting</option>
              <option>Ready</option>
              <option>Done</option>
              <option>Canceled</option>
            </select>
          </div>
          <DataTable columns={columns} data={filtered} emptyMessage="No delivery orders yet" />
        </>
      )}

      {view === 'kanban' && (
        <div className="kanban-board">
          {KANBAN_STATUSES.map(status => (
            <div key={status} className="kanban-column">
              <div className="kanban-column-header">
                <h3>{status}</h3>
                <span className="kanban-count">{getDeliveriesByStatus(status).length}</span>
              </div>
              <div className="kanban-column-body">
                {getDeliveriesByStatus(status).length === 0 ? (
                  <p className="kanban-empty">No items</p>
                ) : (
                  getDeliveriesByStatus(status).map(renderKanbanCard)
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      <Modal
        isOpen={!!selectedDelivery}
        onClose={() => setSelectedDelivery(null)}
        title={selectedDelivery ? `Delivery ${selectedDelivery.ref}` : ''}
        size="lg"
        footer={
          selectedDelivery && (
            <div style={{ display: 'flex', gap: 8 }}>
              {selectedDelivery.status === 'Draft' && (
                <>
                  <button className="btn btn-primary" onClick={() => { handleCheckStock(selectedDelivery.id); setSelectedDelivery(null); }}>Check Availability</button>
                  <button className="btn btn-danger" onClick={() => { handleCancel(selectedDelivery.id); setSelectedDelivery(null); }}>Cancel</button>
                </>
              )}
              {selectedDelivery.status === 'Waiting' && (
                <button className="btn btn-primary" onClick={() => { handleReadyDelivery(selectedDelivery.id); setSelectedDelivery(null); }}>Force Ready</button>
              )}
              {selectedDelivery.status === 'Ready' && (
                <>
                  <button className="btn btn-success" onClick={() => { handleValidate(selectedDelivery.id); setSelectedDelivery(null); }}><Check size={14} /> Validate</button>
                  <button className="btn btn-danger" onClick={() => { handleCancel(selectedDelivery.id); setSelectedDelivery(null); }}>Cancel</button>
                </>
              )}
              <button className="btn btn-secondary" onClick={() => setSelectedDelivery(null)}>Close</button>
            </div>
          )
        }
      >
        {selectedDelivery && (
          <div>
            <div className="detail-row"><strong>Contact:</strong> {selectedDelivery.contact || selectedDelivery.customer || '—'}</div>
            <div className="detail-row"><strong>Delivery Address:</strong> {selectedDelivery.deliveryAddress || '—'}</div>
            <div className="detail-row"><strong>Schedule Date:</strong> {selectedDelivery.scheduleDate ? new Date(selectedDelivery.scheduleDate).toLocaleDateString() : '—'}</div>
            <div className="detail-row"><strong>Warehouse:</strong> {getWarehouseName(selectedDelivery.warehouseId)}</div>
            <div className="detail-row"><strong>Responsible:</strong> {selectedDelivery.responsible || '—'}</div>
            <div className="detail-row"><strong>Status:</strong> <StatusBadge status={selectedDelivery.status} /></div>
            <div style={{ marginTop: 16 }}>
              <strong>Items:</strong>
              <table className="data-table" style={{ marginTop: 8 }}>
                <thead>
                  <tr><th>Product</th><th>Quantity</th><th>Available</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {selectedDelivery.items.map((item, idx) => {
                    const p = getProduct(item.productId);
                    const available = p ? (p.stock[selectedDelivery.warehouseId] || 0) : 0;
                    const oos = isItemOutOfStock(selectedDelivery, item);
                    return (
                      <tr key={idx} style={oos && selectedDelivery.status !== 'Done' ? { background: 'var(--danger)', color: 'var(--danger-text)' } : {}}>
                        <td>{p ? p.name : 'Unknown'}</td>
                        <td>{item.quantity}</td>
                        <td>{available}</td>
                        <td>{oos && selectedDelivery.status !== 'Done' ? <span style={{ color: 'var(--danger-text)', fontWeight: 700 }}>Insufficient</span> : <span style={{ color: 'var(--success-text)', fontWeight: 600 }}>OK</span>}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>

      {/* New Delivery Modal */}
      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title="New Delivery Order"
        size="lg"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleCreate}>Create Delivery</button>
          </>
        }
      >
        <div className="form-row">
          <div className="form-group">
            <label>Contact (Deliver To) *</label>
            <input
              value={form.contact}
              onChange={e => setForm(f => ({ ...f, contact: e.target.value }))}
              placeholder="Customer name"
            />
          </div>
          <div className="form-group">
            <label>Delivery Address</label>
            <input
              value={form.deliveryAddress}
              onChange={e => setForm(f => ({ ...f, deliveryAddress: e.target.value }))}
              placeholder="Delivery address"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Schedule Date</label>
            <input
              type="date"
              value={form.scheduleDate}
              onChange={e => setForm(f => ({ ...f, scheduleDate: e.target.value }))}
            />
          </div>
          <div className="form-group">
            <label>Source Warehouse *</label>
            <select value={form.warehouseId} onChange={e => setForm(f => ({ ...f, warehouseId: e.target.value }))}>
              <option value="">Select warehouse</option>
              {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Responsible</label>
          <input
            value={form.responsible}
            onChange={e => setForm(f => ({ ...f, responsible: e.target.value }))}
            placeholder="Responsible person"
          />
        </div>

        <label style={{ marginTop: 12, marginBottom: 10, display: 'block', fontWeight: 700 }}>Products</label>
        {form.items.map((item, idx) => {
          const product = products.find(p => p.id === item.productId);
          const available = product && form.warehouseId ? (product.stock[form.warehouseId] || 0) : null;
          const isOos = available !== null && item.quantity > 0 && item.quantity > available;
          return (
            <div key={idx} className="line-item-row" style={isOos ? { border: '2px solid var(--danger-border)', borderRadius: 'var(--radius-sm)', padding: 4 } : {}}>
              <div className="form-group" style={{ margin: 0 }}>
                <select value={item.productId} onChange={e => updateItem(idx, 'productId', e.target.value)}>
                  <option value="">Select product</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
                </select>
                {available !== null && (
                  <span style={{ fontSize: '0.75rem', color: isOos ? 'var(--danger-text)' : 'var(--text-muted)', marginTop: 2, fontWeight: 600 }}>
                    Available: {available} {isOos ? '- INSUFFICIENT' : ''}
                  </span>
                )}
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <input
                  type="number"
                  min="1"
                  placeholder="Qty"
                  value={item.quantity || ''}
                  onChange={e => updateItem(idx, 'quantity', e.target.value)}
                  style={isOos ? { borderColor: 'var(--danger-border)', background: 'var(--danger)' } : {}}
                />
              </div>
              <button className="btn btn-ghost btn-icon" onClick={() => removeItem(idx)} style={{ color: 'var(--danger)' }}>
                <X size={16} />
              </button>
            </div>
          );
        })}
        <button className="btn btn-ghost btn-sm" onClick={addItem} style={{ marginTop: 8 }}>
          <Plus size={14} /> Add Item
        </button>
      </Modal>
    </div>
  );
}
