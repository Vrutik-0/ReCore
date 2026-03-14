import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getTotalStock, getFreeToUse, getTotalReserved } from '../data/store';
import DataTable from '../components/common/DataTable';
import Modal from '../components/common/Modal';
import { Package, Edit2 } from 'lucide-react';
import '../components/common/DataTable.css';

export default function Stock() {
  const { products, warehouses, dispatch, getWarehouseName } = useApp();

  const [editingProduct, setEditingProduct] = useState(null);
  const [stockForm, setStockForm] = useState({});

  const openStockEdit = (product) => {
    const formData = {};
    warehouses.forEach(w => {
      formData[w.id] = product.stock[w.id] || 0;
    });
    setStockForm(formData);
    setEditingProduct(product);
  };

  const handleSaveStock = () => {
    if (!editingProduct) return;
    Object.entries(stockForm).forEach(([warehouseId, newQty]) => {
      const currentQty = editingProduct.stock[warehouseId] || 0;
      if (Number(newQty) !== currentQty) {
        dispatch({
          type: 'UPDATE_STOCK',
          payload: {
            productId: editingProduct.id,
            warehouseId,
            newQty: Number(newQty),
          },
        });
      }
    });
    setEditingProduct(null);
    setStockForm({});
  };

  const formatCurrency = (amount) => {
    return `Rs ${Number(amount).toLocaleString('en-IN')}`;
  };

  const columns = [
    {
      key: 'name', label: 'Product',
      render: (p) => (
        <div>
          <div style={{ fontWeight: 700 }}>{p.name}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>{p.sku}</div>
        </div>
      ),
    },
    {
      key: 'unitCost', label: 'Per Unit Cost',
      accessor: (p) => formatCurrency(p.unitCost || 0),
    },
    {
      key: 'onHand', label: 'On Hand',
      accessor: (p) => getTotalStock(p),
      render: (p) => {
        const total = getTotalStock(p);
        return (
          <span style={{ fontWeight: 700, color: total === 0 ? 'var(--danger-text)' : 'var(--text-primary)' }}>
            {total}
          </span>
        );
      },
    },
    {
      key: 'freeToUse', label: 'Free to Use',
      accessor: (p) => getFreeToUse(p),
      render: (p) => {
        const free = getFreeToUse(p);
        const reserved = getTotalReserved(p);
        return (
          <div>
            <span style={{ fontWeight: 700, color: free <= 0 ? 'var(--danger-text)' : 'var(--success-text)' }}>
              {free}
            </span>
            {reserved > 0 && (
              <span style={{ fontSize: '0.8rem', color: 'var(--warning-text)', marginLeft: 8, fontWeight: 600 }}>
                ({reserved} reserved)
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: 'breakdown', label: 'Warehouse Breakdown',
      sortable: false,
      render: (p) => {
        const entries = Object.entries(p.stock || {}).filter(([, qty]) => qty > 0);
        if (entries.length === 0) return <span style={{ color: 'var(--text-muted)' }}>—</span>;
        return (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {entries.map(([whId, qty]) => (
              <span key={whId} className="stock-wh-badge">
                {getWarehouseName(whId)}: {qty}
              </span>
            ))}
          </div>
        );
      },
    },
    {
      key: 'actions', label: '', sortable: false,
      render: (p) => (
        <button
          className="btn btn-ghost btn-icon"
          onClick={(e) => { e.stopPropagation(); openStockEdit(p); }}
          title="Update Stock"
          style={{ border: 'var(--border-width) solid var(--border)' }}
        >
          <Edit2 size={15} />
        </button>
      ),
    },
  ];

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1>Stock Overview</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500, marginTop: 4 }}>
            View and manage stock levels across all warehouses
          </p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={products}
        emptyMessage="No products found. Add products first."
      />

      {/* Edit Stock Modal */}
      <Modal
        isOpen={!!editingProduct}
        onClose={() => setEditingProduct(null)}
        title={editingProduct ? `Update Stock: ${editingProduct.name}` : ''}
        size="md"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setEditingProduct(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSaveStock}>Save Changes</button>
          </>
        }
      >
        {editingProduct && (
          <div>
            <div style={{ marginBottom: 16, padding: 14, background: 'var(--bg-secondary)', border: 'var(--border-width) solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{editingProduct.name}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>SKU: {editingProduct.sku} | Unit Cost: {formatCurrency(editingProduct.unitCost)}</div>
              <div style={{ marginTop: 8, fontSize: '0.9rem' }}>
                <strong>Current Total:</strong> {getTotalStock(editingProduct)} |{' '}
                <strong>Reserved:</strong> {getTotalReserved(editingProduct)} |{' '}
                <strong>Free to Use:</strong> {getFreeToUse(editingProduct)}
              </div>
            </div>

            <label style={{ fontWeight: 700, marginBottom: 12, display: 'block' }}>Stock per Warehouse</label>
            {warehouses.map(w => (
              <div key={w.id} className="form-group">
                <label>{w.name} ({w.code})</label>
                <input
                  type="number"
                  min="0"
                  value={stockForm[w.id] ?? 0}
                  onChange={e => setStockForm(f => ({ ...f, [w.id]: e.target.value }))}
                />
                {editingProduct.reserved[w.id] > 0 && (
                  <span style={{ fontSize: '0.8rem', color: 'var(--warning-text)', fontWeight: 600, marginTop: 4, display: 'block' }}>
                    {editingProduct.reserved[w.id]} reserved in this warehouse
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}
