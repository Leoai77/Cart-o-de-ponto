import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Clock } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'employee' | 'admin'>('employee');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login(email, role);
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-sm space-y-8 bg-white p-8 rounded-2xl shadow-sm border">
        <div className="text-center">
          <div className="mx-auto w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mb-4">
            <Clock className="text-white w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">PontoSmart</h2>
          <p className="text-sm text-slate-500 mt-2">Controle de ponto digital 100% seguro</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">E-mail</label>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Senha</label>
              <Input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="admin-role"
                name="role"
                type="checkbox"
                checked={role === 'admin'}
                onChange={(e) => setRole(e.target.checked ? 'admin' : 'employee')}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded"
              />
              <label htmlFor="admin-role" className="ml-2 block text-sm text-slate-900">
                Entrar como Administrador
              </label>
            </div>
          </div>

          <Button type="submit" className="w-full h-12 text-base">
            Entrar
          </Button>
        </form>

        <div className="text-center text-sm">
          <p className="text-slate-500">
            Não tem uma conta?{' '}
            <button onClick={() => navigate('/register')} className="font-medium text-indigo-600 hover:text-indigo-500">
              Cadastre-se
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
