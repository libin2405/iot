import React, { useState, useEffect } from 'react';
import { Cloud, Sun, Droplets, Wind, Thermometer } from 'lucide-react';
import { io } from 'socket.io-client';

const WeatherWidget: React.FC = () => {
  const [weather, setWeather] = useState({
    temperature: 0, // Will update from Sensor
    humidity: 0,    // Will update from Sensor
    windSpeed: 12,  // Simulated (No sensor)
    windDirection: 'NW',
    conditions: 'Waiting for data...',
    uvIndex: 5,     // Simulated
    fireRiskIndex: 1 // Calculated from Real Data
  });

  useEffect(() => {
    // 1. Connect to Backend (CHANGE IP TO MATCH YOUR PC)
    const socket = io('http://10.164.45.157:5000');

    socket.on('connect', () => {
        console.log("✅ WeatherWidget Connected");
    });

    // 2. Listen for Real Sensor Data
    socket.on('sensor_update', (data: any) => {
        const temp = parseFloat(data.temperature);
        const humidity = parseFloat(data.humidity);

        // Calculate Fire Risk based on Real Data
        // Logic: High Temp (>90) or Low Humidity (<30) increases risk
        let risk = 1;
        if (temp > 85) risk = 3;
        if (temp > 95) risk = 5;
        if (humidity < 30) risk += 1; // Dry air increases risk
        if (risk > 5) risk = 5;       // Max cap

        setWeather(prev => ({
            ...prev,
            temperature: temp,
            humidity: humidity,
            fireRiskIndex: risk,
            conditions: temp > 85 ? 'Hot & Dry' : 'Normal',
        }));
    });

    // 3. Optional: Simulate Wind/UV changes (since we don't have sensors for them)
    const interval = setInterval(() => {
        setWeather(prev => ({
            ...prev,
            windSpeed: 8 + Math.random() * 5, // Random fluctuations
            uvIndex: 4 + Math.floor(Math.random() * 3)
        }));
    }, 10000);

    return () => {
        socket.disconnect();
        clearInterval(interval);
    };
  }, []);

  const getFireRiskColor = (index: number) => {
    if (index <= 2) return 'text-green-600 bg-green-100';
    if (index <= 3) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center space-x-3 mb-4">
        <Sun className="w-6 h-6 text-yellow-500" />
        <h3 className="text-lg font-semibold text-gray-800">Live Conditions</h3>
      </div>

      <div className="space-y-4">
        {/* Temperature (Real) */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Thermometer className="w-4 h-4 text-red-500" />
            <span className="text-gray-600">Temperature</span>
          </div>
          <span className="text-lg font-semibold">
            {weather.temperature > 0 ? `${weather.temperature.toFixed(1)}°F` : '--'}
          </span>
        </div>

        {/* Humidity (Real) */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Droplets className="w-4 h-4 text-blue-500" />
            <span className="text-gray-600">Humidity</span>
          </div>
          <span className="text-lg font-semibold">
            {weather.humidity > 0 ? `${weather.humidity.toFixed(1)}%` : '--'}
          </span>
        </div>

        {/* Wind (Simulated) */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Wind className="w-4 h-4 text-gray-500" />
            <span className="text-gray-600">Wind (Est.)</span>
          </div>
          <span className="text-lg font-semibold">
            {Math.round(weather.windSpeed)} mph {weather.windDirection}
          </span>
        </div>

        {/* Conditions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Cloud className="w-4 h-4 text-gray-500" />
            <span className="text-gray-600">Conditions</span>
          </div>
          <span className="text-lg font-semibold">{weather.conditions}</span>
        </div>

        {/* Fire Risk Index (Calculated) */}
        <div className="pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 font-medium">Fire Risk Index</span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getFireRiskColor(weather.fireRiskIndex)}`}>
              Level {weather.fireRiskIndex}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${
                weather.fireRiskIndex <= 2 ? 'bg-green-500' :
                weather.fireRiskIndex <= 3 ? 'bg-yellow-500' :
                'bg-red-500'
              }`}
              style={{ width: `${(weather.fireRiskIndex / 5) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Forecast */}
        <div className="pt-4">
          <h4 className="font-medium text-gray-700 mb-3">Live Analysis</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <div>• Real-time data from Sensor Node 1</div>
            <div>• Wind/UV estimated based on seasonal averages</div>
            {weather.fireRiskIndex >= 4 ? (
                <div className="text-red-600 font-bold animate-pulse">⚠ CRITICAL FIRE WEATHER DETECTED</div>
            ) : (
                <div className="text-green-600 font-medium">✓ Conditions are stable</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherWidget;
