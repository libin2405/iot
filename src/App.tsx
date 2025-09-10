import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import SatelliteView from './components/SatelliteView';
import UAVMonitoring from './components/UAVMonitoring';
import SensorNetwork from './components/SensorNetwork';
import AlertCenter from './components/AlertCenter';
import EnvironmentalQuotes from './components/EnvironmentalQuotes';
import { AlertProvider } from './context/AlertContext';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'satellite':
        return <SatelliteView />;
      case 'uav':
        return <UAVMonitoring />;
      case 'sensors':
        return <SensorNetwork />;
      case 'alerts':
        return <AlertCenter />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <AlertProvider>
      <div className="min-h-screen bg-gray-50">
        <Header activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="container mx-auto px-4 py-6">
          {renderActiveComponent()}
          <EnvironmentalQuotes />
        </main>
      </div>
    </AlertProvider>
  );
}

export default App;