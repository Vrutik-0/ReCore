import { createContext, useContext, useState, useEffect } from 'react';
import { loadData, saveData } from '../data/store';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => loadData('currentUser'));
  const [otpStore, setOtpStore] = useState(null);

  useEffect(() => {
    if (user) {
      saveData('currentUser', user);
    } else {
      localStorage.removeItem('coreinventory_currentUser');
    }
  }, [user]);

  function getUsers() {
    return loadData('users') || [];
  }

  function signup(name, email, password, role) {
    const users = getUsers();
    if (users.find(u => u.email === email)) {
      return { success: false, error: 'Email already registered' };
    }
    const newUser = {
      id: Date.now().toString(36),
      name,
      email,
      password,
      role: role || 'Inventory Manager',
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    saveData('users', users);
    const { password: _, ...safeUser } = newUser;
    setUser(safeUser);
    return { success: true };
  }

  function login(email, password) {
    const users = getUsers();
    const found = users.find(u => u.email === email && u.password === password);
    if (!found) {
      return { success: false, error: 'Invalid email or password' };
    }
    const { password: _, ...safeUser } = found;
    setUser(safeUser);
    return { success: true };
  }

  function logout() {
    setUser(null);
  }

  function requestOtp(email) {
    const users = getUsers();
    const found = users.find(u => u.email === email);
    if (!found) {
      return { success: false, error: 'Email not found' };
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setOtpStore({ email, otp });
    return { success: true, otp };
  }

  function verifyOtp(email, otp) {
    if (otpStore && otpStore.email === email && otpStore.otp === otp) {
      return { success: true };
    }
    return { success: false, error: 'Invalid OTP' };
  }

  function resetPassword(email, newPassword) {
    const users = getUsers();
    const idx = users.findIndex(u => u.email === email);
    if (idx === -1) return { success: false, error: 'User not found' };
    users[idx].password = newPassword;
    saveData('users', users);
    setOtpStore(null);
    return { success: true };
  }

  function updateProfile(updates) {
    const users = getUsers();
    const idx = users.findIndex(u => u.id === user.id);
    if (idx !== -1) {
      users[idx] = { ...users[idx], ...updates };
      saveData('users', users);
      const { password: _, ...safeUser } = users[idx];
      setUser(safeUser);
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      login,
      signup,
      logout,
      requestOtp,
      verifyOtp,
      resetPassword,
      updateProfile,
      isAuthenticated: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
