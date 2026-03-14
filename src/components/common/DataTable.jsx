import { Search } from 'lucide-react';
import { useState } from 'react';

export default function DataTable({ columns, data, onRowClick, emptyMessage = 'No data found' }) {
  const [search, setSearch] = useState('');
  const [sortCol, setSortCol] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(0);
  const perPage = 15;

  const handleSort = (key) => {
    if (sortCol === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortCol(key);
      setSortDir('asc');
    }
  };

  let filtered = data;
  if (search) {
    const q = search.toLowerCase();
    filtered = data.filter(row =>
      columns.some(col => {
        const val = col.accessor ? col.accessor(row) : row[col.key];
        return val && String(val).toLowerCase().includes(q);
      })
    );
  }

  if (sortCol) {
    const col = columns.find(c => c.key === sortCol);
    filtered = [...filtered].sort((a, b) => {
      const aVal = col?.accessor ? col.accessor(a) : a[sortCol];
      const bVal = col?.accessor ? col.accessor(b) : b[sortCol];
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }

  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice(page * perPage, (page + 1) * perPage);

  return (
    <div className="datatable-wrapper">
      <div className="datatable-toolbar">
        <div className="search-input">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(0); }}
          />
        </div>
        <span className="datatable-count">{filtered.length} record{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="datatable-scroll">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map(col => (
                <th
                  key={col.key}
                  onClick={() => col.sortable !== false && handleSort(col.key)}
                  style={{ cursor: col.sortable !== false ? 'pointer' : 'default' }}
                >
                  {col.label}
                  {sortCol === col.key && (sortDir === 'asc' ? ' ↑' : ' ↓')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td colSpan={columns.length} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paged.map((row, idx) => (
                <tr key={row.id || idx} onClick={() => onRowClick?.(row)} style={{ cursor: onRowClick ? 'pointer' : 'default' }}>
                  {columns.map(col => (
                    <td key={col.key}>
                      {col.render ? col.render(row) : (col.accessor ? col.accessor(row) : row[col.key])}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="datatable-pagination">
          <button className="btn btn-ghost btn-sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
            Previous
          </button>
          <span className="pagination-info">Page {page + 1} of {totalPages}</span>
          <button className="btn btn-ghost btn-sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
            Next
          </button>
        </div>
      )}
    </div>
  );
}
