import React, { useState, useEffect } from 'react';
import { Satellite, Download, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';

const SatelliteView: React.FC = () => {
  const [selectedRegion, setSelectedRegion] = useState('sector-a');
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);

  const regions = [
    { id: 'sector-a', name: 'Sector A - Northern Forest', coverage: '98%' },
    { id: 'sector-b', name: 'Sector B - Eastern Range', coverage: '95%' },
    { id: 'sector-c', name: 'Sector C - Southern Valley', coverage: '97%' },
  ];

  const refreshImagery = () => {
    setIsLoading(true);
    setTimeout(() => {
      setLastUpdate(new Date());
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Satellite className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-800">Satellite Imagery</h2>
          </div>
          <div className="flex items-center space-x-2">
            <select 
              value={selectedRegion} 
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {regions.map((region) => (
                <option key={region.id} value={region.id}>{region.name}</option>
              ))}
            </select>
            <button 
              onClick={refreshImagery}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
            >
              <RotateCcw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Satellite Image Viewer */}
        <div className="relative bg-gradient-to-br from-green-200 to-green-400 rounded-lg h-96 overflow-hidden">
          {isLoading && (
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-10">
              <div className="bg-white rounded-lg p-4 flex items-center space-x-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="text-gray-700">Loading latest imagery...</span>
              </div>
            </div>
          )}
          
          {/* Simulated Satellite Image */}
          <img 
            src="https://images.pexels.com/photos/1423600/pexels-photo-1423600.jpeg?auto=compress&cs=tinysrgb&w=800" 
            alt="Forest satellite view"
            className="w-full h-full object-cover"
          />
          
          {/* Image Overlay Controls */}
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3">
            <div className="text-sm font-medium text-gray-800 mb-2">Layer Controls</div>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input type="checkbox" defaultChecked className="rounded" />
                <span className="text-sm text-gray-600">Heat Detection</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" defaultChecked className="rounded" />
                <span className="text-sm text-gray-600">Smoke Analysis</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="rounded" />
                <span className="text-sm text-gray-600">Vegetation Index</span>
              </label>
            </div>
          </div>

          {/* Zoom Controls */}
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-2">
            <div className="flex flex-col space-y-2">
              <button className="p-2 text-gray-600 hover:text-blue-600 transition-colors">
                <ZoomIn className="w-4 h-4" />
              </button>
              <button className="p-2 text-gray-600 hover:text-blue-600 transition-colors">
                <ZoomOut className="w-4 h-4" />
              </button>
              <button className="p-2 text-gray-600 hover:text-blue-600 transition-colors">
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Fire Detection Indicators */}
          <div className="absolute bottom-4 right-4 space-y-2">
            <div className="bg-red-500 w-3 h-3 rounded-full animate-pulse" title="Potential fire detected"></div>
            <div className="bg-yellow-500 w-3 h-3 rounded-full animate-pulse" title="Heat anomaly"></div>
          </div>
        </div>

        {/* Image Metadata */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-lg font-semibold text-gray-800">Resolution</div>
            <div className="text-sm text-gray-600">10m/pixel</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-lg font-semibold text-gray-800">Last Update</div>
            <div className="text-sm text-gray-600">{lastUpdate.toLocaleTimeString()}</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-lg font-semibold text-gray-800">Coverage</div>
            <div className="text-sm text-gray-600">
              {regions.find(r => r.id === selectedRegion)?.coverage}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SatelliteView;