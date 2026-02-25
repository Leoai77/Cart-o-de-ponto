import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'employee' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  company: string;
  cpf?: string;
  phone?: string;
  admissionDate?: string;
}

interface AuthContextType {
  user: User | null;
  users: User[];
  login: (email: string, role: UserRole) => void;
  logout: () => void;
  register: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('ponto_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('ponto_users');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('ponto_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('ponto_user');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('ponto_users', JSON.stringify(users));
  }, [users]);

  const login = (email: string, role: UserRole) => {
    const existingUser = users.find(u => u.email === email);
    
    if (existingUser) {
      setUser(existingUser);
    } else {
      // Auto-register for demo purposes if not found
      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        name: email.split('@')[0],
        email,
        role,
        company: 'Empresa Demo Ltda',
        admissionDate: new Date().toISOString(),
      };
      setUsers(prev => [...prev, newUser]);
      setUser(newUser);
    }
  };

  const register = (data: Partial<User>) => {
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name: data.name || 'Novo Usuário',
      email: data.email || '',
      role: 'employee',
      company: data.company || 'Empresa Demo Ltda',
      cpf: data.cpf,
      phone: data.phone,
      admissionDate: new Date().toISOString(),
    };
    
    setUsers(prev => [...prev, newUser]);
    setUser(newUser);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, users, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
