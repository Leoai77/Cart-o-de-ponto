import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Users, Mail, Phone, Calendar, Briefcase, Shield } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Employees() {
  const { users } = useAuth();

  // Filter out admin users if you only want to show employees, 
  // or show everyone. The request says "todos os funcionarios registrados" (all registered employees).
  // Usually "funcionarios" implies employees, but admins are also staff. 
  // Let's show everyone but distinguish roles.
  
  const sortedUsers = [...users].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="space-y-6">
      <div className="mt-4">
        <h1 className="text-2xl font-bold text-slate-900">Gerir Equipe</h1>
        <p className="text-slate-500 text-sm">Lista de todos os funcionários registrados</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sortedUsers.map((user) => (
          <Card key={user.id} className="bg-white border shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${
                user.role === 'admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'
              }`}>
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <CardTitle className="text-base font-semibold text-slate-900">{user.name}</CardTitle>
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <Briefcase className="w-3 h-3" />
                  {user.role === 'admin' ? 'Administrador' : 'Funcionário'}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm pt-2">
              <div className="flex items-center gap-2 text-slate-600">
                <Mail className="w-4 h-4 text-slate-400" />
                <span className="truncate">{user.email}</span>
              </div>
              {user.phone && (
                <div className="flex items-center gap-2 text-slate-600">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span>{user.phone}</span>
                </div>
              )}
              {user.cpf && (
                <div className="flex items-center gap-2 text-slate-600">
                  <Shield className="w-4 h-4 text-slate-400" />
                  <span>{user.cpf}</span>
                </div>
              )}
              {user.admissionDate && (
                <div className="flex items-center gap-2 text-slate-600">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>Admissão: {format(new Date(user.admissionDate), 'dd/MM/yyyy')}</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {sortedUsers.length === 0 && (
          <div className="col-span-full text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">Nenhum funcionário registrado.</p>
          </div>
        )}
      </div>
    </div>
  );
}
