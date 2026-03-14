import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Shield, Save } from 'lucide-react';

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const displayName = user?.loginId || user?.name || '';
  const [form, setForm] = useState({ loginId: displayName, email: user?.email || '', role: user?.role || '' });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updateProfile({ loginId: form.loginId });
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
            color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.8rem', fontWeight: 800,
            border: '1px solid var(--border)',
          }}>
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 style={{ marginBottom: 2 }}>{displayName}</h2>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{user?.role}</span>
          </div>
        </div>

        <div className="form-group">
          <label><User size={13} style={{ marginRight: 4, verticalAlign: '-2px' }} /> Login Id</label>
          <input value={form.loginId} disabled style={{ opacity: 0.6 }} />
        </div>

        <div className="form-group">
          <label><Mail size={13} style={{ marginRight: 4, verticalAlign: '-2px' }} /> Email</label>
          <input value={form.email} disabled style={{ opacity: 0.6 }} />
        </div>

        <div className="form-group">
          <label><Shield size={13} style={{ marginRight: 4, verticalAlign: '-2px' }} /> Role</label>
          <input value={form.role} disabled style={{ opacity: 0.6 }} />
        </div>

        <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: 20 }}>
          Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
        </p>
      </div>
    </div>
  );
}
