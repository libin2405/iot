import React, { useState, useEffect } from 'react';
import { Radio, Thermometer, Droplets } from 'lucide-react';
import { io } from 'socket.io-client';

interface Sensor {
  id: string;
  name: string;
  type: string;
  status: 'online' | 'offline' | 'warning' | 'simulated';
  temperature: number;
  humidity: number;
  location: string;
  lastUpdate: Date;
}

const SensorNetwork: React.FC = () => {
  const [sensors, setSensors] = useState<Sensor[]>([
    {
      id: 'sensor-001',
      name: 'Tower Alpha (Live)',
      type: 'Environmental',
      status: 'offline',
      temperature: 0,
      humidity: 0,
      location: 'Grid A1',
      lastUpdate: new Date()
    }
  ]);

  useEffect(() => {
    // 1. Connect to Backend
    const socket = io('http://localhost:5000');

    socket.on('connect', () => {
        console.log("✅ React Connected to Backend!");
    });

    // 2. Listen for sensor updates
    socket.on('sensor_update', (data: any) => {
      console.log("📊 Data Received in React:", data); // <--- CHECK CONSOLE FOR THIS

      setSensors(prevSensors => 
        prevSensors.map(sensor => {
          if (sensor.id === 'sensor-001') {
            return {
              ...sensor,
              // Use the data (handle potential string/number mismatch)
              temperature: typeof data.temperature === 'string' ? parseFloat(data.temperature) : data.temperature,
              humidity: typeof data.humidity === 'string' ? parseFloat(data.humidity) : data.humidity,
              status: 'online',
              lastUpdate: new Date()
            };
          }
          return sensor;
        })
      );
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-600 bg-green-100';
      case 'simulated': return 'text-blue-600 bg-blue-100';
      case 'offline': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Radio className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-800">Sensor Network</h2>
          </div>
          <div className="text-sm text-gray-500">
             Live Data Feed
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sensors.map((sensor) => (
            <div key={sensor.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-800">{sensor.name}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium uppercase ${getStatusColor(sensor.status)}`}>
                  {sensor.status}
                </span>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Thermometer className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Temperature</span>
                  </div>
                  <span className="text-lg font-bold text-gray-800">
                    {Number(sensor.temperature).toFixed(1)}°C
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Droplets className="w-4 h-4 text-blue-500" />
                    <span className="text-sm text-gray-600">Humidity</span>
                  </div>
                  <span className="text-lg font-bold text-gray-800">
                    {Number(sensor.humidity).toFixed(1)}%
                  </span>
                </div>
                
                <div className="text-xs text-gray-400 mt-2 text-right">
                    Last Update: {sensor.lastUpdate.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SensorNetwork;
