import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { getTotalStock, getStockStatus } from '../../data/store';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import { Plus, Trash2 } from 'lucide-react';
import '../../components/common/DataTable.css';

export default function ProductList() {
  const { products, categories, warehouses, dispatch } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', sku: '', categoryId: '', uom: 'pcs', reorderLevel: 0, initialStock: 0, warehouseId: '' });
  const [filterCat, setFilterCat] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);

  const resetForm = () => setForm({ name: '', sku: '', categoryId: '', uom: 'pcs', reorderLevel: 0, initialStock: 0, warehouseId: '' });

  const openCreate = () => { resetForm(); setEditing(null); setShowForm(true); };
  const openEdit = (product) => {
    setEditing(product);
    setForm({ name: product.name, sku: product.sku, categoryId: product.categoryId, uom: product.uom, reorderLevel: product.reorderLevel || 0, initialStock: 0, warehouseId: '' });
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.name || !form.sku) return;
    if (editing) {
      dispatch({ type: 'UPDATE_PRODUCT', payload: { id: editing.id, name: form.name, sku: form.sku, categoryId: form.categoryId, uom: form.uom, reorderLevel: Number(form.reorderLevel) } });
    } else {
      const stock = {};
      if (form.initialStock > 0 && form.warehouseId) {
        stock[form.warehouseId] = Number(form.initialStock);
      }
      dispatch({ type: 'ADD_PRODUCT', payload: { name: form.name, sku: form.sku, categoryId: form.categoryId, uom: form.uom, reorderLevel: Number(form.reorderLevel), stock } });
    }
    setShowForm(false);
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      dispatch({ type: 'DELETE_PRODUCT', payload: deleteTarget.id });
      setDeleteTarget(null);
    }
  };

  let filtered = products;
  if (filterCat) filtered = filtered.filter(p => p.categoryId === filterCat);
  if (filterStatus) filtered = filtered.filter(p => getStockStatus(p) === filterStatus);

  const columns = [
    { key: 'sku', label: 'SKU' },
    { key: 'name', label: 'Product Name' },
    { key: 'category', label: 'Category', accessor: (row) => categories.find(c => c.id === row.categoryId)?.name || '—' },
    { key: 'uom', label: 'UoM' },
    { key: 'totalStock', label: 'Total Stock', accessor: (row) => getTotalStock(row) },
    { key: 'status', label: 'Status', render: (row) => <StatusBadge status={getStockStatus(row)} />, sortable: false },
    {
      key: 'locations', label: 'Stock by Location', sortable: false,
      render: (row) => {
        if (!row.stock || Object.keys(row.stock).length === 0) return '—';
        return Object.entries(row.stock).map(([whId, qty]) => {
          const wh = warehouses.find(w => w.id === whId);
          return <span key={whId} style={{ marginRight: 10, fontSize: '0.82rem' }}>{wh?.name || whId}: <strong>{qty}</strong></span>;
        });
      }
    },
    {
      key: 'actions', label: '', sortable: false,
      render: (row) => (
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="btn btn-ghost btn-sm" onClick={(e) => { e.stopPropagation(); openEdit(row); }}>Edit</button>
          <button className="btn btn-ghost btn-sm" onClick={(e) => { e.stopPropagation(); setDeleteTarget(row); }} style={{ color: 'var(--danger-text)' }}>
            <Trash2 size={14} />
          </button>
        </div>
      )
    },
  ];

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>Products</h1>
        <button className="btn btn-primary" onClick={openCreate}><Plus size={16} /> New Product</button>
      </div>

      <div className="filter-bar">
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)}>
          <option value="">All Categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All Status</option>
          <option value="in-stock">In Stock</option>
          <option value="low-stock">Low Stock</option>
          <option value="out-of-stock">Out of Stock</option>
        </select>
      </div>

      <DataTable columns={columns} data={filtered} emptyMessage="No products found. Create your first product!" />

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editing ? 'Edit Product' : 'New Product'}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave}>Save</button>
          </>
        }
      >
        <div className="form-row">
          <div className="form-group">
            <label>Product Name *</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Steel Rods" />
          </div>
          <div className="form-group">
            <label>SKU / Code *</label>
            <input value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))} placeholder="e.g. STL-001" />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Category</label>
            <select value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}>
              <option value="">Select category</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Unit of Measure</label>
            <select value={form.uom} onChange={e => setForm(f => ({ ...f, uom: e.target.value }))}>
              <option>pcs</option><option>kg</option><option>meters</option><option>liters</option><option>rolls</option><option>boxes</option>
            </select>
          </div>
        </div>
        <div className="form-group">
          <label>Reorder Level</label>
          <input type="number" min="0" value={form.reorderLevel} onChange={e => setForm(f => ({ ...f, reorderLevel: e.target.value }))} />
        </div>
        {!editing && (
          <div className="form-row">
            <div className="form-group">
              <label>Initial Stock (optional)</label>
              <input type="number" min="0" value={form.initialStock} onChange={e => setForm(f => ({ ...f, initialStock: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Warehouse</label>
              <select value={form.warehouseId} onChange={e => setForm(f => ({ ...f, warehouseId: e.target.value }))}>
                <option value="">Select warehouse</option>
                {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Confirm Delete" size="sm"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setDeleteTarget(null)}>Cancel</button>
            <button className="btn btn-danger" onClick={confirmDelete}>Delete</button>
          </>
        }
      >
        <p>Are you sure you want to delete <strong>"{deleteTarget?.name}"</strong> ({deleteTarget?.sku})? This action cannot be undone.</p>
      </Modal>
    </div>
  );
}