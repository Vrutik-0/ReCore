import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import { Plus, X, Check } from 'lucide-react';
import '../../components/common/DataTable.css';

export default function Receipts() {
  const { receipts, products, warehouses, dispatch, getWarehouseName } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ supplier: '', warehouseId: '', items: [{ productId: '', quantity: 0 }] });
  const [filterStatus, setFilterStatus] = useState('');

  const resetForm = () => setForm({ supplier: '', warehouseId: '', items: [{ productId: '', quantity: 0 }] });

  const addItem = () => setForm(f => ({ ...f, items: [...f.items, { productId: '', quantity: 0 }] }));
  const removeItem = (idx) => setForm(f => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));
  const updateItem = (idx, key, val) => setForm(f => ({
    ...f, items: f.items.map((item, i) => i === idx ? { ...item, [key]: key === 'quantity' ? Number(val) : val } : item)
  }));

  const handleCreate = () => {
    if (!form.supplier || !form.warehouseId || form.items.some(i => !i.productId || i.quantity <= 0)) return;
    dispatch({ type: 'ADD_RECEIPT', payload: { supplier: form.supplier, warehouseId: form.warehouseId, items: form.items } });
    setShowForm(false);
    resetForm();
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
    { key: 'supplier', label: 'Supplier' },
    { key: 'warehouse', label: 'Destination', accessor: (r) => getWarehouseName(r.warehouseId) },
    { key: 'items', label: 'Items', accessor: (r) => r.items?.length || 0, sortable: false },
    { key: 'date', label: 'Date', accessor: (r) => new Date(r.createdAt).toLocaleDateString() },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} />, sortable: false },
    {
      key: 'actions', label: '', sortable: false,
      render: (r) => (
        <div style={{ display: 'flex', gap: 6 }}>
          {r.status === 'Draft' && (
            <>
              <button className="btn btn-success btn-sm" onClick={(e) => { e.stopPropagation(); handleValidate(r.id); }}><Check size={14} /> Validate</button>
              <button className="btn btn-ghost btn-sm" onClick={(e) => { e.stopPropagation(); handleCancel(r.id); }} style={{ color: 'var(--text-muted)' }}>Cancel</button>
            </>
          )}
        </div>
      )
    },
  ];

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>Receipts</h1>
        <button className="btn btn-primary" onClick={() => { resetForm(); setShowForm(true); }}><Plus size={16} /> New Receipt</button>
      </div>

      <div className="filter-bar">
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All Statuses</option>
          <option>Draft</option><option>Done</option><option>Canceled</option>
        </select>
      </div>

      <DataTable columns={columns} data={filtered} emptyMessage="No receipts yet" />

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="New Receipt" size="lg"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleCreate}>Create Receipt</button>
          </>
        }
      >
        <div className="form-row">
          <div className="form-group">
            <label>Supplier *</label>
            <input value={form.supplier} onChange={e => setForm(f => ({ ...f, supplier: e.target.value }))} placeholder="Supplier name" />
          </div>
          <div className="form-group">
            <label>Destination Warehouse *</label>
            <select value={form.warehouseId} onChange={e => setForm(f => ({ ...f, warehouseId: e.target.value }))}>
              <option value="">Select warehouse</option>
              {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </div>
        </div>

        <label style={{ marginTop: 12, marginBottom: 10, display: 'block' }}>Line Items</label>
        {form.items.map((item, idx) => (
          <div key={idx} className="line-item-row">
            <div className="form-group" style={{ margin: 0 }}>
              <select value={item.productId} onChange={e => updateItem(idx, 'productId', e.target.value)}>
                <option value="">Select product</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
              </select>
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <input type="number" min="1" placeholder="Qty" value={item.quantity || ''} onChange={e => updateItem(idx, 'quantity', e.target.value)} />
            </div>
            <button className="btn btn-ghost btn-icon" onClick={() => removeItem(idx)} style={{ color: 'var(--danger)' }}><X size={16} /></button>
          </div>
        ))}
        <button className="btn btn-ghost btn-sm" onClick={addItem} style={{ marginTop: 8 }}><Plus size={14} /> Add Item</button>
      </Modal>
    </div>
  );
}
