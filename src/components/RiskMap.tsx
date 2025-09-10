import React, { useState, useEffect } from 'react';
import { MapPin, Zap, AlertTriangle } from 'lucide-react';

const RiskMap: React.FC = () => {
  const [activeHotspots, setActiveHotspots] = useState([
    { id: 1, lat: 45.2, lng: -121.7, risk: 'high', temp: 78 },
    { id: 2, lat: 45.4, lng: -121.5, risk: 'medium', temp: 65 },
    { id: 3, lat: 45.1, lng: -121.9, risk: 'low', temp: 55 },
  ]);

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Fire Risk Map</h3>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Last updated: 2 min ago</span>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        </div>
      </div>
      
      <div className="relative bg-gradient-to-br from-green-100 to-green-200 rounded-lg h-80 overflow-hidden">
        {/* Simulated Map Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-green-600/20"></div>
        
        {/* Hotspots */}
        {activeHotspots.map((hotspot) => (
          <div
            key={hotspot.id}
            className={`absolute w-4 h-4 rounded-full ${getRiskColor(hotspot.risk)} 
                       animate-pulse cursor-pointer transform -translate-x-2 -translate-y-2
                       hover:scale-150 transition-transform duration-200`}
            style={{
              left: `${(hotspot.lng + 122) * 50}%`,
              top: `${(46 - hotspot.lat) * 50}%`,
            }}
            title={`Risk: ${hotspot.risk} | Temp: ${hotspot.temp}°F`}
          >
            <div className={`absolute inset-0 ${getRiskColor(hotspot.risk)} rounded-full opacity-30 animate-ping`}></div>
          </div>
        ))}
        
        {/* Map Legend */}
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3">
          <div className="text-sm font-medium text-gray-800 mb-2">Risk Levels</div>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-xs text-gray-600">High Risk</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-xs text-gray-600">Medium Risk</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-xs text-gray-600">Low Risk</span>
            </div>
          </div>
        </div>

        {/* Map Controls */}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-2">
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

      {/* Map Statistics */}
      <div className="grid grid-cols-3 gap-4 mt-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">1</div>
          <div className="text-sm text-gray-500">High Risk</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-600">1</div>
          <div className="text-sm text-gray-500">Medium Risk</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">1</div>
          <div className="text-sm text-gray-500">Low Risk</div>
        </div>
      </div>
    </div>
  );
};

export default RiskMap;