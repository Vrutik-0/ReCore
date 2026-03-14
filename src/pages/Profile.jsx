import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Shield, Save } from 'lucide-react';

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '', role: user?.role || '' });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updateProfile({ name: form.name });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>My Profile</h1>
      </div>

      <div className="card" style={{ maxWidth: 560 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 28 }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'var(--accent)',
            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.8rem', fontWeight: 800,
          }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 style={{ marginBottom: 2 }}>{user?.name}</h2>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{user?.role}</span>
          </div>
        </div>

        <div className="form-group">
          <label><User size={13} style={{ marginRight: 4, verticalAlign: '-2px' }} /> Full Name</label>
          <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
        </div>

        <div className="form-group">
          <label><Mail size={13} style={{ marginRight: 4, verticalAlign: '-2px' }} /> Email</label>
          <input value={form.email} disabled style={{ opacity: 0.6 }} />
        </div>

        <div className="form-group">
          <label><Shield size={13} style={{ marginRight: 4, verticalAlign: '-2px' }} /> Role</label>
          <input value={form.role} disabled style={{ opacity: 0.6 }} />
        </div>

        <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="btn btn-primary" onClick={handleSave}><Save size={16} /> Save Changes</button>
          {saved && <span style={{ color: 'var(--success)', fontSize: '0.85rem' }}>✓ Profile updated</span>}
        </div>

        <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: 20 }}>
          Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
        </p>
      </div>
    </div>
  );
}
