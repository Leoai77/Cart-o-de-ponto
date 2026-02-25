import React from 'react';
import { useRecords } from '../context/RecordsContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Users, Clock, AlertTriangle, FileText, Download } from 'lucide-react';
import { Button } from '../components/ui/button';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const { records } = useRecords();
  const navigate = useNavigate();

  const todayRecords = records.filter(
    (r) => new Date(r.timestamp).toDateString() === new Date().toDateString()
  );

  const uniqueUsersToday = new Set(todayRecords.map((r) => r.userId)).size;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mt-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Visão Geral</h1>
          <p className="text-slate-500 text-sm">Acompanhe os registros em tempo real</p>
        </div>
        <Button variant="outline" size="sm" className="h-9 gap-2">
          <Download className="w-4 h-4" /> Exportar
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-indigo-600 text-white border-none shadow-md">
          <CardContent className="p-4 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-6 h-6 text-indigo-200" />
              <span className="text-xs font-medium bg-indigo-500/50 px-2 py-1 rounded-full">Hoje</span>
            </div>
            <div>
              <p className="text-3xl font-bold tracking-tight">{uniqueUsersToday}</p>
              <p className="text-sm text-indigo-100 font-medium">Funcionários Ativos</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border shadow-sm">
          <CardContent className="p-4 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between mb-4">
              <AlertTriangle className="w-6 h-6 text-amber-500" />
              <span className="text-xs font-medium bg-amber-100 text-amber-700 px-2 py-1 rounded-full">Alerta</span>
            </div>
            <div>
              <p className="text-3xl font-bold tracking-tight text-slate-900">2</p>
              <p className="text-sm text-slate-500 font-medium">Atrasos Registrados</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider px-1">Últimos Registros</h3>
        
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          {todayRecords.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">
              Nenhum registro encontrado hoje.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {todayRecords.slice(0, 5).map((record) => (
                <div key={record.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      record.type === 'entrada' ? 'bg-emerald-100 text-emerald-600' :
                      record.type === 'saida' ? 'bg-slate-100 text-slate-600' : 'bg-amber-100 text-amber-600'
                    }`}>
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 text-sm">
                        {record.type === 'entrada' ? 'Entrada' :
                         record.type === 'saida' ? 'Saída' :
                         record.type === 'inicio_intervalo' ? 'Início Intervalo' : 'Fim Intervalo'}
                      </p>
                      <p className="text-xs text-slate-500 font-mono">
                        {record.userId.substring(0, 6)} • {format(new Date(record.timestamp), "dd/MM 'às' HH:mm")}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {record.synced ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700">
                        Sincronizado
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-medium bg-amber-50 text-amber-700">
                        Offline
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Button variant="outline" className="h-20 flex flex-col gap-2 border-slate-200 hover:bg-slate-50">
          <FileText className="w-6 h-6 text-indigo-600" />
          <span className="text-sm font-medium">Relatório Mensal</span>
        </Button>
        <Button 
          variant="outline" 
          className="h-20 flex flex-col gap-2 border-slate-200 hover:bg-slate-50"
          onClick={() => navigate('/employees')}
        >
          <Users className="w-6 h-6 text-indigo-600" />
          <span className="text-sm font-medium">Gerir Equipe</span>
        </Button>
      </div>
    </div>
  );
}
