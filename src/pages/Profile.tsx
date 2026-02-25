import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { User, Building, Mail, Phone, ShieldCheck } from 'lucide-react';

export default function Profile() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="mt-4">
        <h1 className="text-2xl font-bold text-slate-900">Perfil</h1>
        <p className="text-slate-500 text-sm">Gerencie suas informações</p>
      </div>

      <div className="bg-white rounded-2xl border shadow-sm p-6 text-center space-y-4">
        <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mx-auto">
          <User className="w-12 h-12 text-indigo-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">{user.name}</h2>
          <p className="text-slate-500">{user.role === 'admin' ? 'Administrador' : 'Funcionário'}</p>
        </div>
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-sm font-medium">
          <ShieldCheck className="w-4 h-4 mr-1.5" /> Conta Verificada
        </div>
      </div>

      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center">
            <Building className="w-5 h-5 text-slate-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-900">Empresa</p>
            <p className="text-sm text-slate-500">{user.company}</p>
          </div>
        </div>
        <div className="p-4 border-b border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center">
            <Mail className="w-5 h-5 text-slate-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-900">E-mail</p>
            <p className="text-sm text-slate-500">{user.email}</p>
          </div>
        </div>
        <div className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center">
            <Phone className="w-5 h-5 text-slate-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-900">Telefone</p>
            <p className="text-sm text-slate-500">{user.phone || 'Não informado'}</p>
          </div>
        </div>
      </div>

      <Button variant="destructive" className="w-full h-12 text-base" onClick={logout}>
        Sair da Conta
      </Button>
    </div>
  );
}
