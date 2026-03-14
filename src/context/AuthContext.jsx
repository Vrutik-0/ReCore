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

  function signup({ loginId, email, password }) {
    const users = getUsers();

    if (!loginId || loginId.length < 6 || loginId.length > 12) {
      return { success: false, error: 'Login ID must be between 6-12 characters' };
    }
    if (users.find(u => u.loginId === loginId)) {
      return { success: false, error: 'Login ID already exists. Please choose a different one.' };
    }
    if (users.find(u => u.email === email)) {
      return { success: false, error: 'Email ID already registered' };
    }
    if (password.length < 8) {
      return { success: false, error: 'Password must be more than 8 characters' };
    }
    if (!/[a-z]/.test(password)) {
      return { success: false, error: 'Password must contain at least one lowercase letter' };
    }
    if (!/[A-Z]/.test(password)) {
      return { success: false, error: 'Password must contain at least one uppercase letter' };
    }
    if (!/[^a-zA-Z0-9]/.test(password)) {
      return { success: false, error: 'Password must contain at least one special character' };
    }

    const newUser = {
      id: Date.now().toString(36),
      loginId,
      email,
      password,
      role: 'Inventory Manager',
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    saveData('users', users);
    const { password: _, ...safeUser } = newUser;
    setUser(safeUser);
    return { success: true };
  }

  function login(loginId, password) {
    const users = getUsers();
    const found = users.find(u => u.loginId === loginId && u.password === password);
    if (!found) {
      return { success: false, error: 'Invalid Login Id or Password' };
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
