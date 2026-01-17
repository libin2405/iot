import React, { useState, useEffect } from 'react';
import { MapPin, Zap, AlertTriangle } from 'lucide-react';
import { io } from 'socket.io-client';

// Define the shape of our sensor data
interface SensorData {
  id: string;
  lat: number;
  lng: number;
  risk: 'high' | 'medium' | 'low';
  temp: number;
  location: string;
}

const RiskMap: React.FC = () => {
  // Initial state with a default "safe" sensor node
  // We place it at a default coordinate for the visual map
  const [sensors, setSensors] = useState<SensorData[]>([
    { 
      id: 'sensor-001', 
      lat: 45.2, 
      lng: -121.7, 
      risk: 'low', 
      temp: 70, // Default safe temp
      location: 'Sensor Node 1'
    }
  ]);

  const [lastUpdated, setLastUpdated] = useState<string>("Waiting for data...");

  useEffect(() => {
    // 1. Connect to Backend (CHANGE THIS IP TO MATCH YOUR PC/ESP32)
    const socket = io('http://10.164.45.157:5000'); 

    socket.on('connect', () => {
        console.log("✅ RiskMap Connected to Backend");
    });

    // 2. Listen for Real-Time Updates
    socket.on('sensor_update', (data: any) => {
      const temp = parseFloat(data.temperature);
      
      // Determine Risk Level based on Temperature
      let currentRisk: 'high' | 'medium' | 'low' = 'low';
      
      // Risk Logic: High > 95°F, Medium > 85°F, else Low
      if (temp > 95) currentRisk = 'high';
      else if (temp > 85) currentRisk = 'medium';

      // Update the specific sensor in our list
      setSensors(prev => prev.map(sensor => {
        // Since we currently have one physical sensor, we update ID 'sensor-001'
        // In the future, you can match data.device_id here
        if (sensor.id === 'sensor-001') {
            return {
                ...sensor,
                temp: temp,
                risk: currentRisk
            };
        }
        return sensor;
      }));

      setLastUpdated(new Date().toLocaleTimeString());
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  // Calculate stats for the bottom grid dynamically
  const highRiskCount = sensors.filter(s => s.risk === 'high').length;
  const mediumRiskCount = sensors.filter(s => s.risk === 'medium').length;
  const lowRiskCount = sensors.filter(s => s.risk === 'low').length;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Live Fire Risk Map</h3>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Last updated: {lastUpdated}</span>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        </div>
      </div>
      
      <div className="relative bg-gradient-to-br from-green-100 to-green-200 rounded-lg h-80 overflow-hidden border border-green-100">
        {/* Simulated Map Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-green-600/20"></div>
        
        {/* Dynamic Sensor Nodes */}
        {sensors.map((sensor) => (
          <div
            key={sensor.id}
            className={`absolute w-6 h-6 rounded-full ${getRiskColor(sensor.risk)} 
                        animate-pulse cursor-pointer transform -translate-x-3 -translate-y-3
                        hover:scale-125 transition-transform duration-200 shadow-lg border-2 border-white`}
            style={{
              left: `${(sensor.lng + 122) * 50}%`, // Coordinate mapping for this demo visual
              top: `${(46 - sensor.lat) * 50}%`,
            }}
            title={`${sensor.location}: ${sensor.risk.toUpperCase()} Risk (${sensor.temp}°F)`}
          >
            {/* Ping Animation for High Risk */}
            {sensor.risk === 'high' && (
                <div className="absolute inset-0 bg-red-500 rounded-full opacity-75 animate-ping"></div>
            )}
          </div>
        ))}
        
        {/* Map Legend */}
        <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-sm border border-gray-100">
          <div className="text-sm font-medium text-gray-800 mb-2">Risk Levels</div>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-xs text-gray-600">High ({'>'}95°F)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-xs text-gray-600">Medium ({'>'}85°F)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-xs text-gray-600">Low (Normal)</span>
            </div>
          </div>
        </div>

        {/* Map Controls (Visual Only) */}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-sm">
          <div className="flex flex-col space-y-2">
            <button className="p-2 text-gray-600 hover:text-green-600 transition-colors">
              <Zap className="w-4 h-4" />
            </button>
            <button className="p-2 text-gray-600 hover:text-green-600 transition-colors">
              <MapPin className="w-4 h-4" />
            </button>
            <button className="p-2 text-gray-600 hover:text-green-600 transition-colors">
              <AlertTriangle className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Real-time Stats */}
      <div className="grid grid-cols-3 gap-4 mt-4">
        <div className="text-center p-2 rounded-lg bg-red-50">
          <div className="text-2xl font-bold text-red-600">{highRiskCount}</div>
          <div className="text-sm text-gray-600">High Risk</div>
        </div>
        <div className="text-center p-2 rounded-lg bg-yellow-50">
          <div className="text-2xl font-bold text-yellow-600">{mediumRiskCount}</div>
          <div className="text-sm text-gray-600">Medium Risk</div>
        </div>
        <div className="text-center p-2 rounded-lg bg-green-50">
          <div className="text-2xl font-bold text-green-600">{lowRiskCount}</div>
          <div className="text-sm text-gray-600">Low Risk</div>
        </div>
      </div>
    </div>
  );
};

export default RiskMap;
