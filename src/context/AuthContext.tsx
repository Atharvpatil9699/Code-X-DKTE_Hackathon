import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, UserRole, NotificationItem } from '../types';

interface AuthContextType {
  currentUser: User;
  activeRole: UserRole;
  authenticated: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedComplaintId: string | null;
  setSelectedComplaintId: (id: string | null) => void;
  isReportModalOpen: boolean;
  setIsReportModalOpen: (open: boolean) => void;
  notifications: NotificationItem[];
  unreadCount: number;
  markNotificationAsRead: (id: string) => Promise<void>;
  refreshTrigger: number;
  triggerRefresh: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>({ id:'', name:'', email:'', role:'CITIZEN' });
  const [activeRole, setActiveRole] = useState<UserRole>('CITIZEN');
  const [authenticated, setAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const loadSession = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const user = await res.json();
        setCurrentUser(user);
        setActiveRole(user.role);
        setAuthenticated(true);
      } else {
        setCurrentUser(null);
        setActiveRole(null);
        setAuthenticated(false);
      }
    } catch {
      setAuthenticated(false);
    }
  };

  useEffect(() => { loadSession(); }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) return { ok: false, error: data.error || 'Login failed' };
      setCurrentUser(data.user);
      setActiveRole(data.user.role);
      setAuthenticated(true);
      setActiveTab('dashboard');
      setRefreshTrigger(v => v + 1);
      return { ok: true };
    } catch {
      return { ok: false, error: 'Unable to connect to CivicResolve server.' };
    }
  };

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => undefined);
    setCurrentUser({ id:'', name:'', email:'', role:'CITIZEN' });
    setActiveRole('CITIZEN');
    setAuthenticated(false);
    setNotifications([]);
  };

  const triggerRefresh = () => setRefreshTrigger(prev => prev + 1);

  const fetchNotifications = async () => {
    if (!authenticated) return;
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) setNotifications(await res.json());
    } catch { /* keep current notification state */ }
  };

  useEffect(() => {
    if (!authenticated) return;
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, [authenticated, refreshTrigger]);

  const markNotificationAsRead = async (id: string) => {
    await fetch(`/api/notifications/${id}/read`, { method: 'PUT' }).catch(() => undefined);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  return (
    <AuthContext.Provider value={{
      currentUser, activeRole, authenticated, login, logout,
      activeTab, setActiveTab, selectedComplaintId, setSelectedComplaintId,
      isReportModalOpen, setIsReportModalOpen, notifications,
      unreadCount: notifications.filter(n => !n.read).length,
      markNotificationAsRead, refreshTrigger, triggerRefresh,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
