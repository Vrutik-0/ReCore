import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import Modal from '../../components/common/Modal';
import { Plus, Edit2, Trash2, MapPin, Warehouse as WarehouseIcon } from 'lucide-react';
import '../Settings/Warehouses.css';

export default function Locations() {
  const { locations, warehouses, dispatch, getWarehouseName } = useApp();

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState({ name: '', code: '', warehouseId: '' });

  const resetForm = () => setForm({ name: '', code: '', warehouseId: '' });

  const openCreate = () => {
    resetForm();
    setEditing(null);
    setShowForm(true);
  };

  const openEdit = (loc) => {
    setForm({ name: loc.name, code: loc.code, warehouseId: loc.warehouseId });
    setEditing(loc);
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.code.trim() || !form.warehouseId) return;
    if (editing) {
      dispatch({ type: 'UPDATE_LOCATION', payload: { id: editing.id, ...form } });
    } else {
      dispatch({ type: 'ADD_LOCATION', payload: form });
    }
    setShowForm(false);
    resetForm();
    setEditing(null);
  };

  const handleDelete = (loc) => {
    setDeleteTarget(loc);
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      dispatch({ type: 'DELETE_LOCATION', payload: deleteTarget.id });
      setDeleteTarget(null);
    }
  };

  // Group locations by warehouse
  const locationsByWarehouse = {};
  locations.forEach(loc => {
    if (!locationsByWarehouse[loc.warehouseId]) {
      locationsByWarehouse[loc.warehouseId] = [];
    }
    locationsByWarehouse[loc.warehouseId].push(loc);
  });

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>Locations</h1>
        <button className="btn btn-primary" onClick={openCreate}>
          <Plus size={16} /> New Location
        </button>
      </div>

      {locations.length === 0 ? (
        <div className="empty-state">
          <MapPin size={48} />
          <h3>No Locations</h3>
          <p>Add storage locations within your warehouses to organize inventory.</p>
        </div>
      ) : (
        <div className="warehouse-grid">
          {locations.map(loc => {
            const whName = getWarehouseName(loc.warehouseId);
            return (
              <div key={loc.id} className="card warehouse-card">
                <div className="wh-card-header">
                  <div className="wh-icon" style={{ background: 'var(--info)' }}>
                    <MapPin size={20} />
                  </div>
                  <div className="wh-actions">
                    <button className="btn btn-ghost btn-icon" onClick={() => openEdit(loc)}>
                      <Edit2 size={15} />
                    </button>
                    <button className="btn btn-ghost btn-icon" onClick={() => handleDelete(loc)} style={{ color: 'var(--danger)' }}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
                <h3 className="wh-name">{loc.name}</h3>
                <span className="wh-code">{loc.code}</span>
                <div className="wh-address">
                  <WarehouseIcon size={13} /> {whName}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditing(null); }}
        title={editing ? 'Edit Location' : 'New Location'}
        size="sm"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => { setShowForm(false); setEditing(null); }}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave}>Save</button>
          </>
        }
      >
        <div className="form-group">
          <label>Location Name *</label>
          <input
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="e.g. Stock Room 1"
          />
        </div>
        <div className="form-group">
          <label>Short Code *</label>
          <input
            value={form.code}
            onChange={e => setForm(f => ({ ...f, code: e.target.value }))}
            placeholder="e.g. Stock1"
          />
        </div>
        <div className="form-group">
          <label>Warehouse *</label>
          <select value={form.warehouseId} onChange={e => setForm(f => ({ ...f, warehouseId: e.target.value }))}>
            <option value="">Select warehouse</option>
            {warehouses.map(w => <option key={w.id} value={w.id}>{w.name} ({w.code})</option>)}
          </select>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Confirm Delete"
        size="sm"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setDeleteTarget(null)}>Cancel</button>
            <button className="btn btn-danger" onClick={confirmDelete}>Delete</button>
          </>
        }
      >
        <p>Are you sure you want to delete the location <strong>"{deleteTarget?.name}"</strong>? This action cannot be undone.</p>
      </Modal>
    </div>
  );
}
