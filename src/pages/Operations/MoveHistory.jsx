import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import DataTable from '../../components/common/DataTable';
import { History } from 'lucide-react';
import '../../components/common/DataTable.css';

export default function MoveHistory() {
  const { movements, products, warehouses, getWarehouseName } = useApp();
  const [filterType, setFilterType] = useState('');
  const [filterProduct, setFilterProduct] = useState('');
  const [filterWarehouse, setFilterWarehouse] = useState('');

  const sorted = [...movements].sort((a, b) => new Date(b.date) - new Date(a.date));

  let filtered = sorted;
  if (filterType) filtered = filtered.filter(m => m.type === filterType);
  if (filterProduct) filtered = filtered.filter(m => m.productId === filterProduct);
  if (filterWarehouse) filtered = filtered.filter(m => m.warehouseFrom === filterWarehouse || m.warehouseTo === filterWarehouse);

  const typeColors = {
    Receipt: 'var(--success)',
    Delivery: 'var(--danger)',
    Transfer: 'var(--info)',
    Adjustment: 'var(--warning)',
  };

  const columns = [
    { key: 'date', label: 'Date', accessor: (r) => new Date(r.date).toLocaleString() },
    { key: 'ref', label: 'Reference' },
    {
      key: 'type', label: 'Type',
      render: (r) => <span style={{ color: typeColors[r.type], fontWeight: 600 }}>{r.type}</span>
    },
    { key: 'productName', label: 'Product' },
    { key: 'from', label: 'From', accessor: (r) => r.warehouseFrom ? getWarehouseName(r.warehouseFrom) : '—' },
    { key: 'to', label: 'To', accessor: (r) => r.warehouseTo ? getWarehouseName(r.warehouseTo) : '—' },
    {
      key: 'quantity', label: 'Quantity',
      render: (r) => (
        <span style={{ color: r.quantity > 0 ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>
          {r.quantity > 0 ? '+' : ''}{r.quantity}
        </span>
      )
    },
  ];

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>Move History</h1>
      </div>

      <div className="filter-bar">
        <select value={filterType} onChange={e => setFilterType(e.target.value)}>
          <option value="">All Types</option>
          <option>Receipt</option><option>Delivery</option><option>Transfer</option><option>Adjustment</option>
        </select>
        <select value={filterProduct} onChange={e => setFilterProduct(e.target.value)}>
          <option value="">All Products</option>
          {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <select value={filterWarehouse} onChange={e => setFilterWarehouse(e.target.value)}>
          <option value="">All Warehouses</option>
          {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
        </select>
      </div>

      <DataTable columns={columns} data={filtered} emptyMessage="No stock movements yet. Operations will show up here." />
    </div>
  );
}
