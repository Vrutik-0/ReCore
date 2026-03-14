export default function StatusBadge({ status }) {
  const classMap = {
    'Draft': 'badge-draft',
    'Waiting': 'badge-waiting',
    'Ready': 'badge-ready',
    'Done': 'badge-done',
    'Canceled': 'badge-canceled',
    'in-stock': 'badge-in-stock',
    'low-stock': 'badge-low-stock',
    'out-of-stock': 'badge-out-of-stock',
  };

  const labelMap = {
    'in-stock': 'In Stock',
    'low-stock': 'Low Stock',
    'out-of-stock': 'Out of Stock',
  };

  return (
    <span className={`badge ${classMap[status] || 'badge-draft'}`}>
      {labelMap[status] || status}
    </span>
  );
}
