import React, { useState, useEffect } from 'react';
import { Activity, MapPin, Thermometer, Wind, Eye, TrendingUp, Radio } from 'lucide-react';
import StatusCard from './StatusCard';
import RiskMap from './RiskMap';
import WeatherWidget from './WeatherWidget';
import FireRiskChart from './FireRiskChart';

const Dashboard: React.FC = () => {
  const [riskLevel, setRiskLevel] = useState(3);
  const [activeAlerts, setActiveAlerts] = useState(2);
  const [monitoiredAreas, setMonitoredAreas] = useState(24);
  const [activeSensors, setActiveSensors] = useState(156);

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setRiskLevel(Math.floor(Math.random() * 5) + 1);
      setActiveAlerts(Math.floor(Math.random() * 5));
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const getRiskColor = (level: number) => {
    if (level <= 2) return 'text-green-600 bg-green-100';
    if (level <= 3) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getRiskText = (level: number) => {
    if (level <= 2) return 'Low Risk';
    if (level <= 3) return 'Moderate Risk';
    return 'High Risk';
  };

  return (
    <div className="space-y-6">
      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatusCard
          title="Fire Risk Level"
          value={getRiskText(riskLevel)}
          icon={Activity}
          color={getRiskColor(riskLevel)}
          trend="+2% from yesterday"
        />
        <StatusCard
          title="Active Alerts"
          value={activeAlerts.toString()}
          icon={MapPin}
          color="text-orange-600 bg-orange-100"
          trend="2 new today"
        />
        <StatusCard
          title="Monitored Areas"
          value={monitoiredAreas.toString()}
          icon={Eye}
          color="text-blue-600 bg-blue-100"
          trend="98.7% coverage"
        />
        <StatusCard
          title="Active Sensors"
          value={`${activeSensors}/160`}
          icon={Radio}
          color="text-purple-600 bg-purple-100"
          trend="97.5% operational"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Map */}
        <div className="lg:col-span-2">
          <RiskMap />
        </div>
        
        {/* Weather Widget */}
        <div>
          <WeatherWidget />
        </div>
      </div>

      {/* Fire Risk Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FireRiskChart />
        
        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {[
              { time: '14:23', type: 'UAV Detection', location: 'Sector A7', status: 'verified' },
              { time: '13:45', type: 'Sensor Alert', location: 'Station 23', status: 'investigating' },
              { time: '12:30', type: 'Satellite Anomaly', location: 'Grid C4', status: 'resolved' },
              { time: '11:15', type: 'Weather Update', location: 'All Sectors', status: 'processed' },
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-800">{activity.type}</div>
                  <div className="text-sm text-gray-500">{activity.location} • {activity.time}</div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  activity.status === 'verified' ? 'bg-green-100 text-green-800' :
                  activity.status === 'investigating' ? 'bg-yellow-100 text-yellow-800' :
                  activity.status === 'resolved' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {activity.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;