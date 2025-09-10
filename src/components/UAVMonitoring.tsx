import React, { useState, useEffect } from 'react';
import { Plane, Battery, Signal, Camera, MapPin } from 'lucide-react';

interface UAV {
  id: string;
  name: string;
  status: 'active' | 'standby' | 'maintenance';
  battery: number;
  signal: number;
  location: string;
  altitude: number;
  mission: string;
}

const UAVMonitoring: React.FC = () => {
  const [uavs, setUavs] = useState<UAV[]>([
    {
      id: 'uav-001',
      name: 'Fire Scout Alpha',
      status: 'active',
      battery: 87,
      signal: 95,
      location: 'Sector A7',
      altitude: 150,
      mission: 'Perimeter Patrol'
    },
    {
      id: 'uav-002',
      name: 'Forest Guardian Beta',
      status: 'active',
      battery: 72,
      signal: 88,
      location: 'Sector B3',
      altitude: 200,
      mission: 'Thermal Scanning'
    },
    {
      id: 'uav-003',
      name: 'Sky Watch Gamma',
      status: 'standby',
      battery: 100,
      signal: 0,
      location: 'Base Station',
      altitude: 0,
      mission: 'Ready for Deployment'
    },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setUavs(prevUavs => 
        prevUavs.map(uav => ({
          ...uav,
          battery: uav.status === 'active' ? Math.max(uav.battery - Math.random() * 2, 0) : uav.battery,
          signal: uav.status === 'active' ? 85 + Math.random() * 15 : uav.signal,
        }))
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'standby': return 'text-yellow-600 bg-yellow-100';
      case 'maintenance': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getBatteryColor = (level: number) => {
    if (level > 50) return 'text-green-600';
    if (level > 20) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Plane className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-800">UAV Fleet Monitoring</h2>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">{uavs.filter(u => u.status === 'active').length} Active</span>
            <span className="text-sm text-gray-500">•</span>
            <span className="text-sm text-gray-500">{uavs.length} Total</span>
          </div>
        </div>

        {/* UAV Fleet Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {uavs.map((uav) => (
            <div key={uav.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-800">{uav.name}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(uav.status)}`}>
                  {uav.status}
                </span>
              </div>

              <div className="space-y-3">
                {/* Battery Level */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Battery className={`w-4 h-4 ${getBatteryColor(uav.battery)}`} />
                    <span className="text-sm text-gray-600">Battery</span>
                  </div>
                  <span className={`text-sm font-medium ${getBatteryColor(uav.battery)}`}>
                    {Math.round(uav.battery)}%
                  </span>
                </div>

                {/* Signal Strength */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Signal className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-gray-600">Signal</span>
                  </div>
                  <span className="text-sm font-medium text-blue-600">
                    {Math.round(uav.signal)}%
                  </span>
                </div>

                {/* Location */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-purple-600" />
                    <span className="text-sm text-gray-600">Location</span>
                  </div>
                  <span className="text-sm font-medium text-gray-800">{uav.location}</span>
                </div>

                {/* Mission */}
                <div className="pt-2 border-t border-gray-100">
                  <div className="text-xs text-gray-500 mb-1">Current Mission</div>
                  <div className="text-sm font-medium text-gray-800">{uav.mission}</div>
                  <div className="text-xs text-gray-500">Altitude: {uav.altitude}m</div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2 pt-3">
                  <button className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm">
                    <Camera className="w-4 h-4 inline mr-1" />
                    Live Feed
                  </button>
                  <button className="px-3 py-2 border border-gray-300 text-gray-600 rounded-md hover:bg-gray-50 transition-colors text-sm">
                    Control
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* UAV Control Center */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Mission Control</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-700 mb-3">Quick Deploy</h4>
            <div className="space-y-2">
              <button className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                Deploy Emergency Response
              </button>
              <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                Start Routine Patrol
              </button>
              <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors">
                Thermal Survey Mission
              </button>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-700 mb-3">Flight Statistics</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Flight Hours Today</span>
                <span className="text-sm font-medium">14.5h</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Areas Scanned</span>
                <span className="text-sm font-medium">18.2 km²</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Images Captured</span>
                <span className="text-sm font-medium">1,247</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Anomalies Detected</span>
                <span className="text-sm font-medium text-orange-600">3</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UAVMonitoring;