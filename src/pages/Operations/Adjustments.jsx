import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import Modal from '../../components/common/Modal';
import DataTable from '../../components/common/DataTable';
import { Plus } from 'lucide-react';
import '../../components/common/DataTable.css';

export default function Adjustments() {
  const { adjustments, products, warehouses, dispatch, getWarehouseName } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ productId: '', warehouseId: '', countedQty: 0, reason: '' });

  const resetForm = () => setForm({ productId: '', warehouseId: '', countedQty: 0, reason: '' });

  const selectedProduct = products.find(p => p.id === form.productId);
  const currentStock = selectedProduct && form.warehouseId ? (selectedProduct.stock[form.warehouseId] || 0) : 0;

  const handleCreate = () => {
    if (!form.productId || !form.warehouseId) return;
    dispatch({ type: 'ADD_ADJUSTMENT', payload: { ...form, countedQty: Number(form.countedQty) } });
    setShowForm(false);
    resetForm();
  };

  const columns = [
    { key: 'ref', label: 'Reference' },
    { key: 'productName', label: 'Product' },
    { key: 'warehouse', label: 'Location', accessor: (r) => getWarehouseName(r.warehouseId) },
    { key: 'oldQty', label: 'Previous Qty' },
    { key: 'newQty', label: 'Counted Qty' },
    {
      key: 'difference', label: 'Difference',
      render: (r) => (
        <span style={{ color: r.difference > 0 ? 'var(--success)' : r.difference < 0 ? 'var(--danger)' : 'var(--text-secondary)' }}>
          {r.difference > 0 ? '+' : ''}{r.difference}
        </span>
      )
    },
    { key: 'reason', label: 'Reason' },
    { key: 'date', label: 'Date', accessor: (r) => new Date(r.date).toLocaleDateString() },
  ];

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>Inventory Adjustments</h1>
        <button className="btn btn-primary" onClick={() => { resetForm(); setShowForm(true); }}><Plus size={16} /> New Adjustment</button>
      </div>

      <DataTable columns={columns} data={adjustments} emptyMessage="No adjustments yet" />

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="New Inventory Adjustment"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleCreate}>Apply Adjustment</button>
          </>
        }
      >
        <div className="form-row">
          <div className="form-group">
            <label>Product *</label>
            <select value={form.productId} onChange={e => setForm(f => ({ ...f, productId: e.target.value }))}>
              <option value="">Select product</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Location *</label>
            <select value={form.warehouseId} onChange={e => setForm(f => ({ ...f, warehouseId: e.target.value }))}>
              <option value="">Select location</option>
              {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </div>
        </div>

        {form.productId && form.warehouseId && (
          <div className="card" style={{ padding: '14px 18px', marginBottom: 16, background: 'var(--bg-tertiary)' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Current recorded stock:</span>
            <strong style={{ marginLeft: 8, fontSize: '1.1rem' }}>{currentStock} {selectedProduct?.uom}</strong>
          </div>
        )}

        <div className="form-row">
          <div className="form-group">
            <label>Counted Quantity *</label>
            <input type="number" min="0" value={form.countedQty} onChange={e => setForm(f => ({ ...f, countedQty: e.target.value }))} />
            {form.productId && form.warehouseId && (
              <span style={{ fontSize: '0.78rem', color: Number(form.countedQty) - currentStock >= 0 ? 'var(--success)' : 'var(--danger)', marginTop: 4, display: 'block' }}>
                Difference: {Number(form.countedQty) - currentStock >= 0 ? '+' : ''}{Number(form.countedQty) - currentStock}
              </span>
            )}
          </div>
          <div className="form-group">
            <label>Reason</label>
            <input value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} placeholder="e.g. Damaged, Expired, Count error" />
          </div>
        </div>
      </Modal>
    </div>
  );
}
