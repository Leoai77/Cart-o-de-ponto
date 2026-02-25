import React, { createContext, useContext, useState, useEffect } from 'react';

export type RecordType = 'entrada' | 'inicio_intervalo' | 'fim_intervalo' | 'saida';

export interface TimeRecord {
  id: string;
  userId: string;
  type: RecordType;
  timestamp: string;
  location?: {
    lat: number;
    lng: number;
  };
  photoUrl?: string;
  synced: boolean;
}

interface RecordsContextType {
  records: TimeRecord[];
  addRecord: (record: Omit<TimeRecord, 'id' | 'synced'>) => void;
  getRecordsByUser: (userId: string) => TimeRecord[];
  syncRecords: () => void;
}

const RecordsContext = createContext<RecordsContextType | undefined>(undefined);

export function RecordsProvider({ children }: { children: React.ReactNode }) {
  const [records, setRecords] = useState<TimeRecord[]>(() => {
    const saved = localStorage.getItem('ponto_records');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('ponto_records', JSON.stringify(records));
  }, [records]);

  const addRecord = (record: Omit<TimeRecord, 'id' | 'synced'>) => {
    const newRecord: TimeRecord = {
      ...record,
      id: Math.random().toString(36).substr(2, 9),
      synced: navigator.onLine, // Simulate offline mode
    };
    setRecords((prev) => [newRecord, ...prev]);
  };

  const getRecordsByUser = (userId: string) => {
    return records.filter((r) => r.userId === userId);
  };

  const syncRecords = () => {
    setRecords((prev) =>
      prev.map((r) => ({ ...r, synced: true }))
    );
  };

  // Listen to online event to sync
  useEffect(() => {
    const handleOnline = () => {
      syncRecords();
      // You could show a toast here
    };
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, []);

  return (
    <RecordsContext.Provider value={{ records, addRecord, getRecordsByUser, syncRecords }}>
      {children}
    </RecordsContext.Provider>
  );
}

export function useRecords() {
  const context = useContext(RecordsContext);
  if (context === undefined) {
    throw new Error('useRecords must be used within a RecordsProvider');
  }
  return context;
}
