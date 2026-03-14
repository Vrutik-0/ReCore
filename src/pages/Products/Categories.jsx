import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import Modal from '../../components/common/Modal';
import { Plus, Edit2, Trash2, Tags } from 'lucide-react';

export default function Categories() {
  const { categories, dispatch } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);

  const openCreate = () => { setName(''); setEditing(null); setShowForm(true); };
  const openEdit = (cat) => { setName(cat.name); setEditing(cat); setShowForm(true); };

  const handleSave = () => {
    if (!name.trim()) return;
    if (editing) {
      dispatch({ type: 'UPDATE_CATEGORY', payload: { id: editing.id, name: name.trim() } });
    } else {
      dispatch({ type: 'ADD_CATEGORY', payload: { name: name.trim() } });
    }
    setShowForm(false);
  };

  const handleDelete = (cat) => {
    setDeleteTarget(cat);
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      dispatch({ type: 'DELETE_CATEGORY', payload: deleteTarget.id });
      setDeleteTarget(null);
    }
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>Product Categories</h1>
        <button className="btn btn-primary" onClick={openCreate}><Plus size={16} /> New Category</button>
      </div>

      <div className="card">
        {categories.length === 0 ? (
          <div className="empty-state">
            <Tags size={48} />
            <h3>No Categories</h3>
            <p>Create your first product category to organize your inventory.</p>
          </div>
        ) : (
          <div className="category-list">
            {categories.map(cat => (
              <div key={cat.id} className="category-item">
                <div className="category-info">
                  <Tags size={16} />
                  <span>{cat.name}</span>
                </div>
                <div className="category-actions">
                  <button className="btn btn-ghost btn-icon" onClick={() => openEdit(cat)}><Edit2 size={15} /></button>
                  <button className="btn btn-ghost btn-icon" onClick={() => handleDelete(cat)} style={{ color: 'var(--danger)' }}><Trash2 size={15} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editing ? 'Edit Category' : 'New Category'} size="sm"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave}>Save</button>
          </>
        }
      >
        <div className="form-group">
          <label>Category Name</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Raw Materials" autoFocus />
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
        <p>Are you sure you want to delete the category <strong>"{deleteTarget?.name}"</strong>? This action cannot be undone.</p>
      </Modal>
    </div>
  );
}
