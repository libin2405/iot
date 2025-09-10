import React, { useState, useEffect } from 'react';
import { Radio, Thermometer, Droplets, Wind, Zap } from 'lucide-react';

interface Sensor {
  id: string;
  name: string;
  type: string;
  status: 'online' | 'offline' | 'warning';
  temperature: number;
  humidity: number;
  smokLevel: number;
  windSpeed: number;
  location: string;
  lastUpdate: Date;
}

const SensorNetwork: React.FC = () => {
  const [sensors, setSensors] = useState<Sensor[]>([
    {
      id: 'sensor-001',
      name: 'Tower Alpha',
      type: 'Environmental',
      status: 'online',
      temperature: 72,
      humidity: 45,
      smokLevel: 12,
      windSpeed: 8,
      location: 'Grid A1',
      lastUpdate: new Date()
    },
    {
      id: 'sensor-002',
      name: 'Station Beta',
      type: 'Fire Detection',
      status: 'warning',
      temperature: 89,
      humidity: 28,
      smokLevel: 67,
      windSpeed: 15,
      location: 'Grid C4',
      lastUpdate: new Date()
    },
    {
      id: 'sensor-003',
      name: 'Monitor Gamma',
      type: 'Weather',
      status: 'online',
      temperature: 68,
      humidity: 52,
      smokLevel: 8,
      windSpeed: 5,
      location: 'Grid B2',
      lastUpdate: new Date()
    },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSensors(prevSensors =>
        prevSensors.map(sensor => ({
          ...sensor,
          temperature: 65 + Math.random() * 30,
          humidity: 30 + Math.random() * 40,
          smokLevel: Math.random() * 100,
          windSpeed: Math.random() * 25,
          lastUpdate: new Date()
        }))
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-orange-600 bg-orange-100';
      case 'offline': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getMetricColor = (value: number, type: string) => {
    switch (type) {
      case 'temperature':
        return value > 85 ? 'text-red-600' : value > 75 ? 'text-orange-600' : 'text-green-600';
      case 'humidity':
        return value < 30 ? 'text-red-600' : value < 40 ? 'text-orange-600' : 'text-blue-600';
      case 'smoke':
        return value > 50 ? 'text-red-600' : value > 25 ? 'text-orange-600' : 'text-green-600';
      case 'wind':
        return value > 20 ? 'text-red-600' : value > 15 ? 'text-orange-600' : 'text-green-600';
      default:
        return 'text-gray-600';
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
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">
              <span className="text-green-600 font-medium">{sensors.filter(s => s.status === 'online').length}</span> Online
            </div>
            <div className="text-sm text-gray-500">
              <span className="text-orange-600 font-medium">{sensors.filter(s => s.status === 'warning').length}</span> Warning
            </div>
            <div className="text-sm text-gray-500">
              <span className="text-red-600 font-medium">{sensors.filter(s => s.status === 'offline').length}</span> Offline
            </div>
          </div>
        </div>

        {/* Sensor Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {sensors.map((sensor) => (
            <div key={sensor.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-800">{sensor.name}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(sensor.status)}`}>
                  {sensor.status}
                </span>
              </div>

              <div className="text-sm text-gray-600 mb-4">
                {sensor.type} • {sensor.location}
              </div>

              <div className="space-y-3">
                {/* Temperature */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Thermometer className={`w-4 h-4 ${getMetricColor(sensor.temperature, 'temperature')}`} />
                    <span className="text-sm text-gray-600">Temperature</span>
                  </div>
                  <span className={`text-sm font-medium ${getMetricColor(sensor.temperature, 'temperature')}`}>
                    {Math.round(sensor.temperature)}°F
                  </span>
                </div>

                {/* Humidity */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Droplets className={`w-4 h-4 ${getMetricColor(sensor.humidity, 'humidity')}`} />
                    <span className="text-sm text-gray-600">Humidity</span>
                  </div>
                  <span className={`text-sm font-medium ${getMetricColor(sensor.humidity, 'humidity')}`}>
                    {Math.round(sensor.humidity)}%
                  </span>
                </div>

                {/* Smoke Level */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Zap className={`w-4 h-4 ${getMetricColor(sensor.smokLevel, 'smoke')}`} />
                    <span className="text-sm text-gray-600">Smoke Level</span>
                  </div>
                  <span className={`text-sm font-medium ${getMetricColor(sensor.smokLevel, 'smoke')}`}>
                    {Math.round(sensor.smokLevel)} ppm
                  </span>
                </div>

                {/* Wind Speed */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Wind className={`w-4 h-4 ${getMetricColor(sensor.windSpeed, 'wind')}`} />
                    <span className="text-sm text-gray-600">Wind Speed</span>
                  </div>
                  <span className={`text-sm font-medium ${getMetricColor(sensor.windSpeed, 'wind')}`}>
                    {Math.round(sensor.windSpeed)} mph
                  </span>
                </div>

                {/* Last Update */}
                <div className="pt-2 border-t border-gray-100">
                  <div className="text-xs text-gray-500">
                    Last update: {sensor.lastUpdate.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Network Overview */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Network Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">156</div>
            <div className="text-sm text-gray-600">Active Sensors</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">98.7%</div>
            <div className="text-sm text-gray-600">Network Uptime</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">24/7</div>
            <div className="text-sm text-gray-600">Monitoring</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">3</div>
            <div className="text-sm text-gray-600">Active Alerts</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SensorNetwork;