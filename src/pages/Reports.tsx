import React, { useState, useMemo } from 'react';
import { useRecords, TimeRecord } from '../context/RecordsContext';
import { useAuth, User } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { format, startOfMonth, endOfMonth, differenceInMinutes } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Download, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Reports() {
  const { records } = useRecords();
  const { users } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedUser, setSelectedUser] = useState<string>('all');

  // Helper to change months
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  // Filter records for the selected month
  const monthRecords = useMemo(() => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    
    return records.filter(r => {
      const date = new Date(r.timestamp);
      return date >= start && date <= end;
    });
  }, [records, currentDate]);

  // Calculate stats per user
  const userStats = useMemo(() => {
    const stats = new Map<string, {
      user: User;
      totalMinutes: number;
      daysPresent: number;
      delays: number; // Assuming > 15min tolerance from 8:00 AM
    }>();

    // Initialize stats for all users
    users.forEach(u => {
      if (u.role !== 'admin') { // Only employees
        stats.set(u.id, { user: u, totalMinutes: 0, daysPresent: 0, delays: 0 });
      }
    });

    // Group records by user and day
    const recordsByUserAndDay = new Map<string, Map<string, TimeRecord[]>>();

    monthRecords.forEach(r => {
      if (!recordsByUserAndDay.has(r.userId)) {
        recordsByUserAndDay.set(r.userId, new Map());
      }
      const dayKey = format(new Date(r.timestamp), 'yyyy-MM-dd');
      const userDays = recordsByUserAndDay.get(r.userId)!;
      if (!userDays.has(dayKey)) {
        userDays.set(dayKey, []);
      }
      userDays.get(dayKey)!.push(r);
    });

    // Calculate hours
    recordsByUserAndDay.forEach((days, userId) => {
      const userStat = stats.get(userId);
      if (!userStat) return;

      days.forEach((dayRecords, dayKey) => {
        userStat.daysPresent++;

        // Sort by time
        const sorted = dayRecords.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        
        const entrada = sorted.find(r => r.type === 'entrada');
        const saida = sorted.find(r => r.type === 'saida');
        const inicioIntervalo = sorted.find(r => r.type === 'inicio_intervalo');
        const fimIntervalo = sorted.find(r => r.type === 'fim_intervalo');

        // Check delay (Standard 8:00 AM with 10 min tolerance)
        if (entrada) {
          const entryTime = new Date(entrada.timestamp);
          const standardEntry = new Date(entryTime);
          standardEntry.setHours(8, 0, 0, 0);
          
          if (differenceInMinutes(entryTime, standardEntry) > 10) {
            userStat.delays++;
          }
        }

        // Calculate worked minutes
        if (entrada && saida) {
          let minutes = differenceInMinutes(new Date(saida.timestamp), new Date(entrada.timestamp));
          
          // Subtract break
          if (inicioIntervalo && fimIntervalo) {
            const breakMinutes = differenceInMinutes(new Date(fimIntervalo.timestamp), new Date(inicioIntervalo.timestamp));
            minutes -= breakMinutes;
          } else if (inicioIntervalo && !fimIntervalo) {
             // Forgot to clock in from break? Assume 1h break or handle error
             minutes -= 60; 
          }

          userStat.totalMinutes += minutes > 0 ? minutes : 0;
        }
      });
    });

    return Array.from(stats.values());
  }, [users, monthRecords]);

  const filteredStats = selectedUser === 'all' 
    ? userStats 
    : userStats.filter(s => s.user.id === selectedUser);

  const formatMinutes = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m`;
  };

  const handleExport = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Header
    if (selectedUser === 'all') {
      csvContent += "Funcionário,Data,Tipo,Hora,Localização\n";
    } else {
      csvContent += "Data,Tipo,Hora,Localização\n";
    }

    // Data
    const recordsToExport = selectedUser === 'all' 
      ? monthRecords 
      : monthRecords.filter(r => r.userId === selectedUser);

    // Sort by date
    recordsToExport.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    recordsToExport.forEach(r => {
      const date = format(new Date(r.timestamp), 'dd/MM/yyyy');
      const time = format(new Date(r.timestamp), 'HH:mm:ss');
      const typeMap: Record<string, string> = {
        'entrada': 'Entrada',
        'inicio_intervalo': 'Início Intervalo',
        'fim_intervalo': 'Fim Intervalo',
        'saida': 'Saída'
      };
      const type = typeMap[r.type] || r.type;
      const location = r.location ? `"${r.location.lat}, ${r.location.lng}"` : 'N/A';

      if (selectedUser === 'all') {
        const user = users.find(u => u.id === r.userId);
        const userName = user ? user.name : 'Desconhecido';
        csvContent += `"${userName}",${date},${type},${time},${location}\n`;
      } else {
        csvContent += `${date},${type},${time},${location}\n`;
      }
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const fileName = selectedUser === 'all' 
      ? `relatorio_geral_${format(currentDate, 'MM-yyyy')}.csv`
      : `relatorio_${users.find(u => u.id === selectedUser)?.name.replace(/\s+/g, '_')}_${format(currentDate, 'MM-yyyy')}.csv`;
    
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Relatórios de Ponto</h1>
          <p className="text-slate-500 text-sm">Resumo mensal de horas e ocorrências</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={prevMonth}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="font-medium min-w-[140px] text-center">
            {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
          </div>
          <Button variant="outline" size="icon" onClick={nextMonth}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-sm bg-white">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Resumo da Equipe</CardTitle>
            <div className="flex items-center gap-2">
              <select 
                value={selectedUser} 
                onChange={(e) => setSelectedUser(e.target.value)}
                className="h-9 w-[200px] rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="all">Todos os funcionários</option>
                {users.filter(u => u.role !== 'admin').map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
              <Button variant="outline" size="sm" className="gap-2" onClick={handleExport}>
                <Download className="w-4 h-4" /> Exportar Detalhado (CSV)
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 font-medium border-b">
                <tr>
                  <th className="h-10 px-4 align-middle">Funcionário</th>
                  <th className="h-10 px-4 align-middle">Dias Trabalhados</th>
                  <th className="h-10 px-4 align-middle">Horas Totais</th>
                  <th className="h-10 px-4 align-middle">Atrasos ({'>'}10min)</th>
                  <th className="h-10 px-4 align-middle">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStats.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-slate-500">
                      Nenhum dado encontrado para este período.
                    </td>
                  </tr>
                ) : (
                  filteredStats.map((stat) => (
                    <tr key={stat.user.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 font-medium">
                        <div className="flex flex-col">
                          <span>{stat.user.name}</span>
                          <span className="text-xs text-slate-500">{stat.user.email}</span>
                        </div>
                      </td>
                      <td className="p-4">{stat.daysPresent} dias</td>
                      <td className="p-4 font-mono">{formatMinutes(stat.totalMinutes)}</td>
                      <td className="p-4">
                        {stat.delays > 0 ? (
                          <span className="text-amber-600 font-medium flex items-center gap-1">
                            {stat.delays} ocorrências
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="p-4">
                        {stat.totalMinutes >= (stat.daysPresent * 8 * 60) ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
                            Regular
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700">
                            Abaixo da meta
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
