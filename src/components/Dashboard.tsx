import React, { useState, useEffect } from 'react';
import { Activity, MapPin, Thermometer, Wind, Eye, TrendingUp, Radio } from 'lucide-react';
import StatusCard from './StatusCard';
import RiskMap from './RiskMap';
import WeatherWidget from './WeatherWidget';
import FireRiskChart from './FireRiskChart';
import { io } from 'socket.io-client';

// Define types for our data
interface ActivityLog {
  time: string;
  type: string;
  location: string;
  status: 'verified' | 'investigating' | 'resolved' | 'processed';
}

const Dashboard: React.FC = () => {
  // Real-time State
  const [riskLevel, setRiskLevel] = useState(1); // 1=Low, 2=Moderate, 3=High
  const [activeAlerts, setActiveAlerts] = useState(0);
  const [monitoredAreas, setMonitoredAreas] = useState(1); // Default to 1 (Camera Station)
  const [activeSensors, setActiveSensors] = useState(0);
  const [latestTemp, setLatestTemp] = useState(0);

  // Activity Log State
  const [recentActivity, setRecentActivity] = useState<ActivityLog[]>([
    { time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), type: 'System Startup', location: 'Main Server', status: 'processed' }
  ]);

  useEffect(() => {
    // 1. Connect to Backend (CHANGE IP TO MATCH YOUR PC)
    const socket = io('http://10.164.45.157:5000');

    socket.on('connect', () => {
      console.log("✅ Dashboard Connected to Backend");
    });

    // 2. Listen for Sensor Updates (Regular Data)
    socket.on('sensor_update', (data: any) => {
      const temp = parseFloat(data.temperature);
      setLatestTemp(temp);
      setActiveSensors(1); // Since we have 1 physical ESP32 connected

      // Determine Global Risk Level based on live temp
      if (temp > 95) setRiskLevel(3);      // High Risk
      else if (temp > 85) setRiskLevel(2); // Moderate Risk
      else setRiskLevel(1);                // Low Risk
    });

    // 3. Listen for Critical Alerts (Fire/High Temp)
    socket.on('alert_event', (alert: any) => {
      // Increment Alert Counter
      setActiveAlerts(prev => prev + 1);

      // Add to Activity Log
      const newActivity: ActivityLog = {
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        type: alert.title.includes('Fire') ? 'FIRE DETECTED' : 'High Temp Alert',
        location: 'Sensor Node 1',
        status: 'investigating'
      };

      setRecentActivity(prev => [newActivity, ...prev].slice(0, 5)); // Keep last 5 logs
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const getRiskColor = (level: number) => {
    if (level === 1) return 'text-green-600 bg-green-100';
    if (level === 2) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getRiskText = (level: number) => {
    if (level === 1) return 'Low Risk';
    if (level === 2) return 'Moderate Risk';
    return 'CRITICAL RISK';
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
          trend={latestTemp > 0 ? `Current Temp: ${latestTemp.toFixed(1)}°F` : "Waiting for data..."}
        />
        <StatusCard
          title="Active Alerts"
          value={activeAlerts.toString()}
          icon={MapPin}
          color={activeAlerts > 0 ? "text-red-600 bg-red-100" : "text-gray-600 bg-gray-100"}
          trend={activeAlerts > 0 ? "Requires Attention" : "System Normal"}
        />
        <StatusCard
          title="Monitored Zones"
          value={monitoredAreas.toString()}
          icon={Eye}
          color="text-blue-600 bg-blue-100"
          trend="100% coverage"
        />
        <StatusCard
          title="Active Sensors"
          value={activeSensors.toString()}
          icon={Radio}
          color={activeSensors > 0 ? "text-green-600 bg-green-100" : "text-gray-600 bg-gray-100"}
          trend={activeSensors > 0 ? "Online" : "Offline"}
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
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Live System Activity</h3>
          <div className="space-y-4">
            {recentActivity.length === 0 ? (
                <div className="text-gray-500 text-center py-4">No recent activity</div>
            ) : (
                recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg animate-fade-in">
                    <div>
                    <div className="font-medium text-gray-800">{activity.type}</div>
                    <div className="text-sm text-gray-500">{activity.location} • {activity.time}</div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium uppercase ${
                    activity.status === 'verified' ? 'bg-green-100 text-green-800' :
                    activity.status === 'investigating' ? 'bg-red-100 text-red-800 animate-pulse' :
                    activity.status === 'resolved' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                    }`}>
                    {activity.status}
                    </span>
                </div>
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
