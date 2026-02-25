import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRecords, RecordType } from '../context/RecordsContext';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { MapPin, Camera, CheckCircle2, AlertCircle, Clock, LogOut } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const { addRecord, getRecordsByUser } = useRecords();
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isRegistering, setIsRegistering] = useState(false);

  const records = getRecordsByUser(user?.id || '');
  const todayRecords = records.filter(
    (r) => new Date(r.timestamp).toDateString() === new Date().toDateString()
  );

  const hasEntrada = todayRecords.some(r => r.type === 'entrada');
  const hasInicioIntervalo = todayRecords.some(r => r.type === 'inicio_intervalo');
  const hasFimIntervalo = todayRecords.some(r => r.type === 'fim_intervalo');
  const hasSaida = todayRecords.some(r => r.type === 'saida');

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const requestLocation = () => {
    setLocationError(null);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setLocationError(null);
        },
        (error) => {
          console.error('Geolocation error:', error);
          let errorMessage = 'Não foi possível obter a localização.';
          if (error.code === error.PERMISSION_DENIED) {
            errorMessage = 'Permissão de localização negada. Por favor, habilite nas configurações do navegador.';
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            errorMessage = 'Localização indisponível. Verifique seu GPS.';
          } else if (error.code === error.TIMEOUT) {
            errorMessage = 'Tempo limite esgotado ao buscar localização.';
          }
          setLocationError(errorMessage);
        },
        {
          enableHighAccuracy: true,
          timeout: 20000,
          maximumAge: 0
        }
      );
    } else {
      setLocationError('Geolocalização não suportada pelo navegador.');
    }
  };

  useEffect(() => {
    requestLocation();
  }, []);

  const handleRegister = async (type: RecordType) => {
    if (!location) {
      alert('Aguarde a obtenção da localização ou verifique as permissões.');
      return;
    }

    if (type === 'entrada' && hasEntrada) return;
    if (type === 'inicio_intervalo' && (!hasEntrada || hasInicioIntervalo)) return;
    if (type === 'fim_intervalo' && (!hasInicioIntervalo || hasFimIntervalo)) return;
    if (type === 'saida' && (!hasFimIntervalo || hasSaida)) return;

    setIsRegistering(true);
    
    // Simulate photo capture / facial recognition delay
    setTimeout(() => {
      addRecord({
        userId: user!.id,
        type,
        timestamp: new Date().toISOString(),
        location,
      });
      setIsRegistering(false);
      alert(`Ponto registrado com sucesso: ${formatRecordType(type)}`);
    }, 1500);
  };

  const formatRecordType = (type: RecordType) => {
    switch (type) {
      case 'entrada': return 'Entrada';
      case 'inicio_intervalo': return 'Início Intervalo';
      case 'fim_intervalo': return 'Fim Intervalo';
      case 'saida': return 'Saída';
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2 mt-4">
        <h1 className="text-2xl font-bold text-slate-900">Olá, {user?.name.split(' ')[0]}</h1>
        <p className="text-slate-500">{user?.company}</p>
      </div>

      <Card className="bg-gradient-to-br from-indigo-600 to-indigo-800 text-white border-none shadow-lg">
        <CardContent className="p-8 text-center space-y-4">
          <div className="text-5xl font-mono font-light tracking-tight">
            {format(currentTime, 'HH:mm:ss')}
          </div>
          <div className="text-indigo-100 font-medium tracking-wide uppercase text-sm">
            {format(currentTime, "EEEE, d 'de' MMMM", { locale: ptBR })}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Registrar Ponto</h3>
          {location ? (
            <span className="flex items-center text-xs text-emerald-600 font-medium">
              <MapPin className="w-3 h-3 mr-1" /> Localização OK
            </span>
          ) : (
            <span className="flex items-center text-xs text-amber-600 font-medium">
              <AlertCircle className="w-3 h-3 mr-1" /> Buscando local...
            </span>
          )}
        </div>

        {locationError && (
          <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 flex flex-col gap-2">
            <p>{locationError}</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={requestLocation}
              className="self-start border-red-200 text-red-700 hover:bg-red-100 hover:text-red-800"
            >
              <MapPin className="w-4 h-4 mr-2" />
              Tentar Novamente
            </Button>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={() => handleRegister('entrada')}
            disabled={isRegistering || !location || hasEntrada}
            className={cn(
              "h-24 flex flex-col gap-2 shadow-sm transition-all",
              hasEntrada ? "bg-slate-100 text-slate-400" : "bg-emerald-500 hover:bg-emerald-600 text-white"
            )}
          >
            <CheckCircle2 className="w-6 h-6" />
            <span className="font-semibold">Entrada</span>
          </Button>
          <Button
            onClick={() => handleRegister('inicio_intervalo')}
            disabled={isRegistering || !location || !hasEntrada || hasInicioIntervalo}
            variant="outline"
            className={cn(
              "h-24 flex flex-col gap-2 border-slate-200 transition-all",
              (!hasEntrada || hasInicioIntervalo) ? "bg-slate-50 text-slate-300 border-slate-100" : "hover:bg-slate-50 text-slate-700"
            )}
          >
            <Clock className={cn("w-6 h-6", (!hasEntrada || hasInicioIntervalo) ? "text-slate-300" : "text-amber-500")} />
            <span className="font-semibold">Início Intervalo</span>
          </Button>
          <Button
            onClick={() => handleRegister('fim_intervalo')}
            disabled={isRegistering || !location || !hasInicioIntervalo || hasFimIntervalo}
            variant="outline"
            className={cn(
              "h-24 flex flex-col gap-2 border-slate-200 transition-all",
              (!hasInicioIntervalo || hasFimIntervalo) ? "bg-slate-50 text-slate-300 border-slate-100" : "hover:bg-slate-50 text-slate-700"
            )}
          >
            <Clock className={cn("w-6 h-6", (!hasInicioIntervalo || hasFimIntervalo) ? "text-slate-300" : "text-indigo-500")} />
            <span className="font-semibold">Fim Intervalo</span>
          </Button>
          <Button
            onClick={() => handleRegister('saida')}
            disabled={isRegistering || !location || !hasFimIntervalo || hasSaida}
            className={cn(
              "h-24 flex flex-col gap-2 shadow-sm transition-all",
              (!hasFimIntervalo || hasSaida) ? "bg-slate-100 text-slate-400" : "bg-slate-800 hover:bg-slate-900 text-white"
            )}
          >
            <LogOut className="w-6 h-6" />
            <span className="font-semibold">Saída</span>
          </Button>
        </div>
      </div>

      {isRegistering && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl flex flex-col items-center space-y-4 max-w-xs w-full mx-4">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center animate-pulse">
              <Camera className="w-8 h-8 text-indigo-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Validando Identidade...</h3>
            <p className="text-sm text-slate-500 text-center">
              Aguarde enquanto confirmamos sua biometria facial e localização.
            </p>
          </div>
        </div>
      )}

      <div className="space-y-3 pt-4">
        <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider px-1">Registros de Hoje</h3>
        {todayRecords.length === 0 ? (
          <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <p className="text-sm text-slate-500">Nenhum registro hoje.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {todayRecords.map((record) => (
              <div key={record.id} className="flex items-center justify-between p-4 bg-white rounded-xl border shadow-sm">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    record.type === 'entrada' ? 'bg-emerald-500' :
                    record.type === 'saida' ? 'bg-slate-800' : 'bg-amber-500'
                  }`} />
                  <div>
                    <p className="font-medium text-slate-900">{formatRecordType(record.type)}</p>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" /> Registrado via App
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono font-medium text-slate-900">{format(new Date(record.timestamp), 'HH:mm')}</p>
                  {record.synced ? (
                    <span className="text-[10px] text-emerald-600 font-medium">Sincronizado</span>
                  ) : (
                    <span className="text-[10px] text-amber-600 font-medium">Offline</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
