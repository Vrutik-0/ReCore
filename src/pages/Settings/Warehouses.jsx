import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import Modal from '../../components/common/Modal';
import { Plus, Edit2, Trash2, Warehouse as WarehouseIcon, MapPin } from 'lucide-react';
import './Warehouses.css';

export default function Warehouses() {
  const { warehouses, dispatch } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', code: '', address: '' });
  const [deleteTarget, setDeleteTarget] = useState(null);

  const resetForm = () => setForm({ name: '', code: '', address: '' });
  const openCreate = () => { resetForm(); setEditing(null); setShowForm(true); };
  const openEdit = (wh) => { setForm({ name: wh.name, code: wh.code, address: wh.address || '' }); setEditing(wh); setShowForm(true); };

  const handleSave = () => {
    if (!form.name.trim() || !form.code.trim()) return;
    if (editing) {
      dispatch({ type: 'UPDATE_WAREHOUSE', payload: { id: editing.id, ...form } });
    } else {
      dispatch({ type: 'ADD_WAREHOUSE', payload: form });
    }
    setShowForm(false);
  };

  const handleDelete = (wh) => {
    setDeleteTarget(wh);
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      dispatch({ type: 'DELETE_WAREHOUSE', payload: deleteTarget.id });
      setDeleteTarget(null);
    }
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>Warehouses</h1>
        <button className="btn btn-primary" onClick={openCreate}><Plus size={16} /> New Warehouse</button>
      </div>

      <div className="warehouse-grid">
        {warehouses.length === 0 ? (
          <div className="empty-state">
            <WarehouseIcon size={48} />
            <h3>No Warehouses</h3>
            <p>Add your first warehouse location.</p>
          </div>
        ) : (
          warehouses.map(wh => (
            <div key={wh.id} className="card warehouse-card">
              <div className="wh-card-header">
                <div className="wh-icon"><WarehouseIcon size={20} /></div>
                <div className="wh-actions">
                  <button className="btn btn-ghost btn-icon" onClick={() => openEdit(wh)}><Edit2 size={15} /></button>
                  <button className="btn btn-ghost btn-icon" onClick={() => handleDelete(wh)} style={{ color: 'var(--danger)' }}><Trash2 size={15} /></button>
                </div>
              </div>
              <h3 className="wh-name">{wh.name}</h3>
              <span className="wh-code">{wh.code}</span>
              {wh.address && (
                <div className="wh-address"><MapPin size={13} /> {wh.address}</div>
              )}
            </div>
          ))
        )}
      </div>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editing ? 'Edit Warehouse' : 'New Warehouse'} size="sm"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave}>Save</button>
          </>
        }
      >
        <div className="form-group">
          <label>Warehouse Name *</label>
          <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Main Warehouse" />
        </div>
        <div className="form-group">
          <label>Code *</label>
          <input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} placeholder="e.g. WH-MAIN" />
        </div>
        <div className="form-group">
          <label>Address</label>
          <input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="e.g. 123 Industrial Ave" />
        </div>
      </Modal>

      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Confirm Delete" size="sm"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setDeleteTarget(null)}>Cancel</button>
            <button className="btn btn-danger" onClick={confirmDelete}>Delete</button>
          </>
        }
      >
        <p>Are you sure you want to delete the warehouse <strong>"{deleteTarget?.name}"</strong>? This action cannot be undone.</p>
      </Modal>
    </div>
  );
}
