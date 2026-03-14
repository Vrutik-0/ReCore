import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import { Plus, X, Check, List, LayoutGrid, ClipboardCheck, Ban } from 'lucide-react';
import '../../components/common/DataTable.css';

const KANBAN_STATUSES = ['Draft', 'Ready', 'Done'];

export default function Receipts() {
  const { receipts, products, warehouses, dispatch, getWarehouseName, getProduct } = useApp();
  const { user } = useAuth();

  const [view, setView] = useState('list');
  const [showForm, setShowForm] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [form, setForm] = useState({
    contact: '',
    scheduleDate: '',
    warehouseId: '',
    responsible: user?.loginId || '',
    items: [{ productId: '', quantity: 0 }],
  });

  const resetForm = () => setForm({
    contact: '',
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
      type: 'ADD_RECEIPT',
      payload: {
        contact: form.contact,
        scheduleDate: form.scheduleDate,
        warehouseId: form.warehouseId,
        responsible: form.responsible,
        items: form.items,
      },
    });
    setShowForm(false);
    resetForm();
  };

  const handleTodo = (id) => {
    dispatch({ type: 'READY_RECEIPT', payload: id });
  };

  const handleValidate = (id) => {
    dispatch({ type: 'VALIDATE_RECEIPT', payload: id });
  };

  const handleCancel = (id) => {
    dispatch({ type: 'CANCEL_RECEIPT', payload: id });
  };

  let filtered = receipts;
  if (filterStatus) filtered = filtered.filter(r => r.status === filterStatus);

  const columns = [
    { key: 'ref', label: 'Reference' },
    { key: 'contact', label: 'Contact', accessor: (r) => r.contact || r.supplier || '—' },
    {
      key: 'scheduleDate', label: 'Schedule Date',
      accessor: (r) => r.scheduleDate ? new Date(r.scheduleDate).toLocaleDateString() : '—',
    },
    {
      key: 'status', label: 'Status',
      render: (r) => <StatusBadge status={r.status} />,
      sortable: false,
    },
    {
      key: 'actions', label: '', sortable: false,
      render: (r) => (
        <div style={{ display: 'flex', gap: 6 }}>
          {r.status === 'Draft' && (
            <>
              <button className="btn btn-primary btn-sm" onClick={(e) => { e.stopPropagation(); handleTodo(r.id); }}>
                TODO
              </button>
              <button className="btn btn-ghost btn-sm" onClick={(e) => { e.stopPropagation(); handleCancel(r.id); }} style={{ color: 'var(--danger-text)' }}>
                <Ban size={14} />
              </button>
            </>
          )}
          {r.status === 'Ready' && (
            <>
              <button className="btn btn-success btn-sm" onClick={(e) => { e.stopPropagation(); handleValidate(r.id); }}>
                <Check size={14} /> Validate
              </button>
              <button className="btn btn-ghost btn-sm" onClick={(e) => { e.stopPropagation(); handleCancel(r.id); }} style={{ color: 'var(--danger-text)' }}>
                <Ban size={14} />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  // Kanban helpers
  const getReceiptsByStatus = (status) =>
    receipts.filter(r => r.status === status)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const renderKanbanCard = (r) => {
    const itemNames = r.items.map(i => {
      const p = getProduct(i.productId);
      return p ? `${p.name} x${i.quantity}` : `Unknown x${i.quantity}`;
    });

    return (
      <div
        key={r.id}
        className="kanban-card"
        onClick={() => setSelectedReceipt(r)}
      >
        <div className="kanban-card-header">
          <span className="kanban-card-ref">{r.ref}</span>
          <StatusBadge status={r.status} />
        </div>
        <div className="kanban-card-body">
          <p className="kanban-card-contact">{r.contact || r.supplier || '—'}</p>
          {r.scheduleDate && (
            <p className="kanban-card-date">{new Date(r.scheduleDate).toLocaleDateString()}</p>
          )}
          <p className="kanban-card-items">{itemNames.join(', ')}</p>
        </div>
        <div className="kanban-card-actions">
          {r.status === 'Draft' && (
            <>
              <button className="btn btn-primary btn-sm" onClick={(e) => { e.stopPropagation(); handleTodo(r.id); }}>TODO</button>
              <button className="btn btn-ghost btn-sm" onClick={(e) => { e.stopPropagation(); handleCancel(r.id); }} style={{ color: 'var(--danger-text)' }}>Cancel</button>
            </>
          )}
          {r.status === 'Ready' && (
            <>
              <button className="btn btn-success btn-sm" onClick={(e) => { e.stopPropagation(); handleValidate(r.id); }}><Check size={14} /> Validate</button>
              <button className="btn btn-ghost btn-sm" onClick={(e) => { e.stopPropagation(); handleCancel(r.id); }} style={{ color: 'var(--danger-text)' }}>Cancel</button>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>Receipts</h1>
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
            <Plus size={16} /> New Receipt
          </button>
        </div>
      </div>

      {view === 'list' && (
        <>
          <div className="filter-bar">
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="">All Statuses</option>
              <option>Draft</option>
              <option>Ready</option>
              <option>Done</option>
              <option>Canceled</option>
            </select>
          </div>
          <DataTable columns={columns} data={filtered} emptyMessage="No receipts yet" />
        </>
      )}

      {view === 'kanban' && (
        <div className="kanban-board">
          {KANBAN_STATUSES.map(status => (
            <div key={status} className="kanban-column">
              <div className="kanban-column-header">
                <h3>{status}</h3>
                <span className="kanban-count">{getReceiptsByStatus(status).length}</span>
              </div>
              <div className="kanban-column-body">
                {getReceiptsByStatus(status).length === 0 ? (
                  <p className="kanban-empty">No items</p>
                ) : (
                  getReceiptsByStatus(status).map(renderKanbanCard)
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal (for kanban card click) */}
      <Modal
        isOpen={!!selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
        title={selectedReceipt ? `Receipt ${selectedReceipt.ref}` : ''}
        size="md"
        footer={
          selectedReceipt && (
            <div style={{ display: 'flex', gap: 8 }}>
              {selectedReceipt.status === 'Draft' && (
                <>
                  <button className="btn btn-primary" onClick={() => { handleTodo(selectedReceipt.id); setSelectedReceipt(null); }}>TODO</button>
                  <button className="btn btn-danger" onClick={() => { handleCancel(selectedReceipt.id); setSelectedReceipt(null); }}>Cancel</button>
                </>
              )}
              {selectedReceipt.status === 'Ready' && (
                <>
                  <button className="btn btn-success" onClick={() => { handleValidate(selectedReceipt.id); setSelectedReceipt(null); }}><Check size={14} /> Validate</button>
                  <button className="btn btn-danger" onClick={() => { handleCancel(selectedReceipt.id); setSelectedReceipt(null); }}>Cancel</button>
                </>
              )}
              <button className="btn btn-secondary" onClick={() => setSelectedReceipt(null)}>Close</button>
            </div>
          )
        }
      >
        {selectedReceipt && (
          <div>
            <div className="detail-row"><strong>Contact:</strong> {selectedReceipt.contact || selectedReceipt.supplier || '—'}</div>
            <div className="detail-row"><strong>Schedule Date:</strong> {selectedReceipt.scheduleDate ? new Date(selectedReceipt.scheduleDate).toLocaleDateString() : '—'}</div>
            <div className="detail-row"><strong>Warehouse:</strong> {getWarehouseName(selectedReceipt.warehouseId)}</div>
            <div className="detail-row"><strong>Responsible:</strong> {selectedReceipt.responsible || '—'}</div>
            <div className="detail-row"><strong>Status:</strong> <StatusBadge status={selectedReceipt.status} /></div>
            <div style={{ marginTop: 16 }}>
              <strong>Items:</strong>
              <table className="data-table" style={{ marginTop: 8 }}>
                <thead>
                  <tr><th>Product</th><th>Quantity</th></tr>
                </thead>
                <tbody>
                  {selectedReceipt.items.map((item, idx) => {
                    const p = getProduct(item.productId);
                    return (
                      <tr key={idx}>
                        <td>{p ? p.name : 'Unknown'}</td>
                        <td>{item.quantity}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>

      {/* New Receipt Modal */}
      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title="New Receipt"
        size="lg"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleCreate}>Create Receipt</button>
          </>
        }
      >
        <div className="form-row">
          <div className="form-group">
            <label>Receive From (Contact) *</label>
            <input
              value={form.contact}
              onChange={e => setForm(f => ({ ...f, contact: e.target.value }))}
              placeholder="Vendor / Supplier name"
            />
          </div>
          <div className="form-group">
            <label>Schedule Date</label>
            <input
              type="date"
              value={form.scheduleDate}
              onChange={e => setForm(f => ({ ...f, scheduleDate: e.target.value }))}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Destination Warehouse *</label>
            <select value={form.warehouseId} onChange={e => setForm(f => ({ ...f, warehouseId: e.target.value }))}>
              <option value="">Select warehouse</option>
              {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Responsible</label>
            <input
              value={form.responsible}
              onChange={e => setForm(f => ({ ...f, responsible: e.target.value }))}
              placeholder="Responsible person"
            />
          </div>
        </div>

        <label style={{ marginTop: 12, marginBottom: 10, display: 'block', fontWeight: 700 }}>Products</label>
        {form.items.map((item, idx) => (
          <div key={idx} className="line-item-row">
            <div className="form-group" style={{ margin: 0 }}>
              <select value={item.productId} onChange={e => updateItem(idx, 'productId', e.target.value)}>
                <option value="">Select product</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
              </select>
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <input
                type="number"
                min="1"
                placeholder="Qty"
                value={item.quantity || ''}
                onChange={e => updateItem(idx, 'quantity', e.target.value)}
              />
            </div>
            <button className="btn btn-ghost btn-icon" onClick={() => removeItem(idx)} style={{ color: 'var(--danger)' }}>
              <X size={16} />
            </button>
          </div>
        ))}
        <button className="btn btn-ghost btn-sm" onClick={addItem} style={{ marginTop: 8 }}>
          <Plus size={14} /> Add Item
        </button>
      </Modal>
    </div>
  );
}
