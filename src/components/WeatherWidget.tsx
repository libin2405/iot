import React, { useState, useEffect } from 'react';
import { Cloud, Sun, Droplets, Wind, Thermometer } from 'lucide-react';

const WeatherWidget: React.FC = () => {
  const [weather, setWeather] = useState({
    temperature: 72,
    humidity: 45,
    windSpeed: 8,
    windDirection: 'NW',
    conditions: 'Partly Cloudy',
    uvIndex: 6,
    fireRiskIndex: 3
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setWeather(prev => ({
        ...prev,
        temperature: 65 + Math.random() * 20,
        humidity: 30 + Math.random() * 40,
        windSpeed: Math.random() * 25,
        fireRiskIndex: Math.floor(Math.random() * 5) + 1
      }));
    }, 8000);

    return () => clearInterval(interval);
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
        <h3 className="text-lg font-semibold text-gray-800">Weather Conditions</h3>
      </div>

      <div className="space-y-4">
        {/* Temperature */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Thermometer className="w-4 h-4 text-red-500" />
            <span className="text-gray-600">Temperature</span>
          </div>
          <span className="text-lg font-semibold">{Math.round(weather.temperature)}°F</span>
        </div>

        {/* Humidity */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Droplets className="w-4 h-4 text-blue-500" />
            <span className="text-gray-600">Humidity</span>
          </div>
          <span className="text-lg font-semibold">{Math.round(weather.humidity)}%</span>
        </div>

        {/* Wind */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Wind className="w-4 h-4 text-gray-500" />
            <span className="text-gray-600">Wind</span>
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

        {/* Fire Risk Index */}
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
          <h4 className="font-medium text-gray-700 mb-3">24-Hour Forecast</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <div>• Decreasing humidity expected</div>
            <div>• Wind gusts up to 20 mph</div>
            <div>• No precipitation forecast</div>
            <div className="text-orange-600 font-medium">⚠ Elevated fire risk conditions</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherWidget;