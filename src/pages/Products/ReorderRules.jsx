import { useApp } from '../../context/AppContext';
import { getTotalStock } from '../../data/store';
import { AlertTriangle, CheckCircle } from 'lucide-react';

export default function ReorderRules() {
  const { products, dispatch } = useApp();

  const handleUpdateLevel = (product, newLevel) => {
    dispatch({ type: 'UPDATE_PRODUCT', payload: { id: product.id, reorderLevel: Number(newLevel) } });
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>Reorder Rules</h1>
      </div>
      <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>
        Set minimum stock levels for each product. You'll see alerts when stock falls below the threshold.
      </p>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Product</th>
              <th>Current Stock</th>
              <th>Reorder Level</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => {
              const total = getTotalStock(p);
              const isLow = p.reorderLevel && total <= p.reorderLevel;
              return (
                <tr key={p.id}>
                  <td style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>{p.sku}</td>
                  <td>{p.name}</td>
                  <td><strong>{total}</strong> {p.uom}</td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      value={p.reorderLevel || 0}
                      onChange={e => handleUpdateLevel(p, e.target.value)}
                      style={{ width: 80, padding: '6px 10px', textAlign: 'center' }}
                    />
                  </td>
                  <td>
                    {isLow ? (
                      <span className="badge badge-warning"><AlertTriangle size={12} /> Below Threshold</span>
                    ) : (
                      <span className="badge badge-done"><CheckCircle size={12} /> OK</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
