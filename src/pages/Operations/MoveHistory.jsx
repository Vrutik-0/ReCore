import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import { History, List, LayoutGrid, ArrowDownCircle, ArrowUpCircle, RefreshCw } from 'lucide-react';
import '../../components/common/DataTable.css';

const KANBAN_STATUSES = ['Draft', 'Ready', 'Done', 'Canceled'];

export default function MoveHistory() {
  const { movements, receipts, deliveries, products, warehouses, locations, getWarehouseName, getLocationName, getProduct } = useApp();

  const [view, setView] = useState('list');
  const [filterType, setFilterType] = useState('');
  const [filterRef, setFilterRef] = useState('');
  const [filterContact, setFilterContact] = useState('');

  // Resolve a from/to ID to a display name
  const resolveLocationLabel = (val) => {
    if (!val) return '—';
    if (val === 'Vendor') return 'Vendor';
    // Try location first
    const loc = locations.find(l => l.id === val);
    if (loc) {
      const wh = warehouses.find(w => w.id === loc.warehouseId);
      return wh ? `${wh.code}/${loc.code}` : loc.name;
    }
    // Try warehouse
    const wh = warehouses.find(w => w.id === val);
    if (wh) return `${wh.code}/Stock`;
    return val;
  };

  // Build expanded movement rows: each movement already represents one product line,
  // but we also attach the parent operation's contact for filtering
  const expandedMovements = useMemo(() => {
    return [...movements]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .map(m => {
        // Find the parent operation to get contact info
        let contact = '';
        let status = 'Done';
        if (m.type === 'Receipt') {
          const r = receipts.find(rc => rc.ref === m.ref);
          contact = r?.contact || r?.supplier || '';
          status = r?.status || 'Done';
        } else if (m.type === 'Delivery') {
          const d = deliveries.find(dl => dl.ref === m.ref);
          contact = d?.contact || d?.customer || '';
          status = d?.status || 'Done';
        } else {
          status = 'Done'; // Adjustments are always Done
        }
        return { ...m, contact, status };
      });
  }, [movements, receipts, deliveries]);

  // Apply filters
  let filtered = expandedMovements;
  if (filterType) filtered = filtered.filter(m => m.type === filterType);
  if (filterRef) {
    const q = filterRef.toLowerCase();
    filtered = filtered.filter(m => m.ref.toLowerCase().includes(q));
  }
  if (filterContact) {
    const q = filterContact.toLowerCase();
    filtered = filtered.filter(m => m.contact.toLowerCase().includes(q));
  }

  const getRowColor = (m) => {
    if (m.type === 'Receipt') return 'var(--success)';
    if (m.type === 'Delivery') return 'var(--danger)';
    return 'transparent';
  };

  const getTypeIcon = (type) => {
    if (type === 'Receipt') return <ArrowDownCircle size={14} />;
    if (type === 'Delivery') return <ArrowUpCircle size={14} />;
    return <RefreshCw size={14} />;
  };

  const columns = [
    {
      key: 'date', label: 'Date',
      accessor: (r) => new Date(r.date).toLocaleString(),
    },
    { key: 'ref', label: 'Reference' },
    {
      key: 'type', label: 'Type',
      render: (r) => {
        const color = r.type === 'Receipt' ? 'var(--success-text)' : r.type === 'Delivery' ? 'var(--danger-text)' : 'var(--warning-text)';
        return (
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, color, fontWeight: 700 }}>
            {getTypeIcon(r.type)} {r.type}
          </span>
        );
      },
    },
    { key: 'productName', label: 'Product' },
    {
      key: 'from', label: 'From',
      accessor: (r) => resolveLocationLabel(r.from),
    },
    {
      key: 'to', label: 'To',
      accessor: (r) => resolveLocationLabel(r.to),
    },
    {
      key: 'quantity', label: 'Quantity',
      render: (r) => {
        const isIn = r.type === 'Receipt';
        const isOut = r.type === 'Delivery';
        const color = isIn ? 'var(--success-text)' : isOut ? 'var(--danger-text)' : 'var(--text-primary)';
        const prefix = isIn ? '+' : isOut ? '-' : '';
        return (
          <span style={{ color, fontWeight: 700, fontSize: '0.95rem' }}>
            {prefix}{Math.abs(r.quantity)}
          </span>
        );
      },
    },
    {
      key: 'status', label: 'Status',
      render: (r) => <StatusBadge status={r.status} />,
      sortable: false,
    },
  ];

  // Kanban: group movements by their parent operation status
  const getMovementsByStatus = (status) =>
    filtered.filter(m => m.status === status);

  const renderKanbanCard = (m) => {
    const isIn = m.type === 'Receipt';
    const isOut = m.type === 'Delivery';
    const cardBorderColor = isIn ? 'var(--success-border)' : isOut ? 'var(--danger-border)' : 'var(--border)';

    return (
      <div key={m.id} className="kanban-card" style={{ borderLeftWidth: 3, borderLeftColor: cardBorderColor }}>
        <div className="kanban-card-header">
          <span className="kanban-card-ref">{m.ref}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: isIn ? 'var(--success-text)' : isOut ? 'var(--danger-text)' : 'var(--text-muted)', fontWeight: 700, fontSize: '0.8rem' }}>
            {getTypeIcon(m.type)} {m.type}
          </span>
        </div>
        <div className="kanban-card-body">
          <p style={{ fontWeight: 700 }}>{m.productName}</p>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {resolveLocationLabel(m.from)} → {resolveLocationLabel(m.to)}
          </p>
          <p style={{
            fontWeight: 800,
            color: isIn ? 'var(--success-text)' : isOut ? 'var(--danger-text)' : 'var(--text-primary)',
            fontSize: '1.05rem',
          }}>
            {isIn ? '+' : isOut ? '-' : ''}{Math.abs(m.quantity)}
          </p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
            {new Date(m.date).toLocaleString()}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>Move History</h1>
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
      </div>

      <div className="filter-bar">
        <select value={filterType} onChange={e => setFilterType(e.target.value)}>
          <option value="">All Types</option>
          <option>Receipt</option>
          <option>Delivery</option>
          <option>Adjustment</option>
        </select>
        <input
          type="text"
          placeholder="Filter by reference..."
          value={filterRef}
          onChange={e => setFilterRef(e.target.value)}
          style={{ width: 'auto', minWidth: 180 }}
        />
        <input
          type="text"
          placeholder="Filter by contact..."
          value={filterContact}
          onChange={e => setFilterContact(e.target.value)}
          style={{ width: 'auto', minWidth: 180 }}
        />
      </div>

      {view === 'list' && (
        <DataTable
          columns={columns}
          data={filtered}
          emptyMessage="No stock movements yet. Operations will show up here."
        />
      )}

      {view === 'kanban' && (
        <div className="kanban-board">
          {KANBAN_STATUSES.map(status => (
            <div key={status} className="kanban-column">
              <div className="kanban-column-header">
                <h3>{status}</h3>
                <span className="kanban-count">{getMovementsByStatus(status).length}</span>
              </div>
              <div className="kanban-column-body">
                {getMovementsByStatus(status).length === 0 ? (
                  <p className="kanban-empty">No items</p>
                ) : (
                  getMovementsByStatus(status).map(renderKanbanCard)
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
