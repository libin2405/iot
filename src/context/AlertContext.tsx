import React, { createContext, useState, useEffect, ReactNode } from 'react';

interface Alert {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  location: string;
  source: string;
  timestamp: Date;
  acknowledged: boolean;
}

interface AlertContextType {
  alerts: Alert[];
  addAlert: (alert: Omit<Alert, 'id' | 'timestamp' | 'acknowledged'>) => void;
  dismissAlert: (id: string) => void;
  acknowledgeAlert: (id: string) => void;
}

export const AlertContext = createContext<AlertContextType>({
  alerts: [],
  addAlert: () => {},
  dismissAlert: () => {},
  acknowledgeAlert: () => {},
});

interface AlertProviderProps {
  children: ReactNode;
}

export const AlertProvider: React.FC<AlertProviderProps> = ({ children }) => {
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: '1',
      title: 'High Temperature Detected',
      description: 'Sensor readings show abnormal temperature spike in monitoring zone.',
      severity: 'high',
      location: 'Sector C4, Station 23',
      source: 'Temperature Sensor',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      acknowledged: false
    },
    {
      id: '2',
      title: 'Smoke Anomaly Detected',
      description: 'UAV thermal imaging detected potential smoke plume formation.',
      severity: 'medium',
      location: 'Sector A7, Grid 15',
      source: 'UAV Alpha',
      timestamp: new Date(Date.now() - 45 * 60 * 1000),
      acknowledged: false
    },
    {
      id: '3',
      title: 'Low Humidity Warning',
      description: 'Humidity levels dropped below safe threshold for extended period.',
      severity: 'medium',
      location: 'Sector B2, Multiple Stations',
      source: 'Weather Network',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      acknowledged: true
    }
  ]);

  const addAlert = (alertData: Omit<Alert, 'id' | 'timestamp' | 'acknowledged'>) => {
    const newAlert: Alert = {
      ...alertData,
      id: Date.now().toString(),
      timestamp: new Date(),
      acknowledged: false
    };
    setAlerts(prev => [newAlert, ...prev]);
  };

  const dismissAlert = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  const acknowledgeAlert = (id: string) => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === id ? { ...alert, acknowledged: true } : alert
      )
    );
  };

  // Simulate random alerts
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() < 0.1) { // 10% chance every 30 seconds
        const randomAlerts = [
          {
            title: 'Sensor Connectivity Issue',
            description: 'Lost communication with remote sensor station.',
            severity: 'medium' as const,
            location: `Sector ${String.fromCharCode(65 + Math.floor(Math.random() * 3))}${Math.floor(Math.random() * 9) + 1}`,
            source: 'Network Monitor'
          },
          {
            title: 'Wind Speed Increase',
            description: 'Wind speeds exceeding normal thresholds detected.',
            severity: 'low' as const,
            location: 'Weather Station Central',
            source: 'Meteorological Sensor'
          }
        ];
        
        addAlert(randomAlerts[Math.floor(Math.random() * randomAlerts.length)]);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <AlertContext.Provider value={{ alerts, addAlert, dismissAlert, acknowledgeAlert }}>
      {children}
    </AlertContext.Provider>
  );
};