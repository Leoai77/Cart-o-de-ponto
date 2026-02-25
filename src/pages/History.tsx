import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useRecords } from '../context/RecordsContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Clock, MapPin, Calendar, Download } from 'lucide-react';
import { Button } from '../components/ui/button';

export default function History() {
  const { user } = useAuth();
  const { getRecordsByUser } = useRecords();

  const records = getRecordsByUser(user?.id || '');

  // Group records by date
  const groupedRecords = records.reduce((acc, record) => {
    const date = new Date(record.timestamp).toDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(record);
    return acc;
  }, {} as Record<string, typeof records>);

  const sortedDates = Object.keys(groupedRecords).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  const formatRecordType = (type: string) => {
    switch (type) {
      case 'entrada': return 'Entrada';
      case 'inicio_intervalo': return 'Início Intervalo';
      case 'fim_intervalo': return 'Fim Intervalo';
      case 'saida': return 'Saída';
      default: return type;
    }
  };

  const handleDownload = () => {
    const csvHeader = "Data,Hora,Tipo,Localização,Status\n";
    const csvRows = records.map(record => {
      const date = format(new Date(record.timestamp), 'dd/MM/yyyy');
      const time = format(new Date(record.timestamp), 'HH:mm:ss');
      const type = formatRecordType(record.type);
      const location = record.location ? `Lat: ${record.location.lat} Lng: ${record.location.lng}` : 'N/A';
      const status = record.synced ? 'Sincronizado' : 'Offline';
      return `${date},${time},${type},"${location}",${status}`;
    }).join("\n");

    const csvContent = csvHeader + csvRows;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `ponto_historico_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="mt-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Histórico</h1>
          <p className="text-slate-500 text-sm">Seus registros de ponto recentes</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleDownload} disabled={records.length === 0}>
          <Download className="w-4 h-4 mr-2" />
          Baixar CSV
        </Button>
      </div>

      {sortedDates.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">Nenhum registro encontrado.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedDates.map((date) => (
            <div key={date} className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider px-1 border-b pb-2">
                {format(new Date(date), "EEEE, d 'de' MMMM", { locale: ptBR })}
              </h3>
              
              <div className="bg-white rounded-xl border shadow-sm overflow-hidden divide-y divide-slate-100">
                {groupedRecords[date].map((record) => (
                  <div key={record.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        record.type === 'entrada' ? 'bg-emerald-100 text-emerald-600' :
                        record.type === 'saida' ? 'bg-slate-100 text-slate-600' : 'bg-amber-100 text-amber-600'
                      }`}>
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 text-sm">{formatRecordType(record.type)}</p>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3" /> 
                          {record.location ? 'Localização salva' : 'Sem localização'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-medium text-slate-900 text-lg">
                        {format(new Date(record.timestamp), 'HH:mm')}
                      </p>
                      {record.synced ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700">
                          Sincronizado
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-700">
                          Offline
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
