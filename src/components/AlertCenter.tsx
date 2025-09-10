import React, { useContext } from 'react';
import { AlertTriangle, Bell, Clock, CheckCircle, XCircle } from 'lucide-react';
import { AlertContext } from '../context/AlertContext';

const AlertCenter: React.FC = () => {
  const { alerts, dismissAlert, acknowledgeAlert } = useContext(AlertContext);

  const getAlertIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return XCircle;
      case 'high': return AlertTriangle;
      case 'medium': return Bell;
      case 'low': return Clock;
      default: return Bell;
    }
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'border-red-500 bg-red-50';
      case 'high': return 'border-orange-500 bg-orange-50';
      case 'medium': return 'border-yellow-500 bg-yellow-50';
      case 'low': return 'border-blue-500 bg-blue-50';
      default: return 'border-gray-500 bg-gray-50';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-6 h-6 text-orange-600" />
            <h2 className="text-xl font-semibold text-gray-800">Alert Center</h2>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">{alerts.filter(a => !a.acknowledged).length} Active Alerts</span>
          </div>
        </div>

        {/* Alert Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-lg font-bold text-red-600">
              {alerts.filter(a => a.severity === 'critical').length}
            </div>
            <div className="text-sm text-gray-600">Critical</div>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="text-lg font-bold text-orange-600">
              {alerts.filter(a => a.severity === 'high').length}
            </div>
            <div className="text-sm text-gray-600">High</div>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <div className="text-lg font-bold text-yellow-600">
              {alerts.filter(a => a.severity === 'medium').length}
            </div>
            <div className="text-sm text-gray-600">Medium</div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-lg font-bold text-blue-600">
              {alerts.filter(a => a.severity === 'low').length}
            </div>
            <div className="text-sm text-gray-600">Low</div>
          </div>
        </div>

        {/* Alert List */}
        <div className="space-y-4">
          {alerts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
              <div className="text-lg font-medium">All Clear</div>
              <div className="text-sm">No active alerts at this time</div>
            </div>
          ) : (
            alerts.map((alert) => {
              const AlertIcon = getAlertIcon(alert.severity);
              return (
                <div
                  key={alert.id}
                  className={`border-l-4 rounded-lg p-4 ${getAlertColor(alert.severity)} ${
                    alert.acknowledged ? 'opacity-60' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <AlertIcon className={`w-5 h-5 mt-0.5 ${
                        alert.severity === 'critical' ? 'text-red-600' :
                        alert.severity === 'high' ? 'text-orange-600' :
                        alert.severity === 'medium' ? 'text-yellow-600' :
                        'text-blue-600'
                      }`} />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-semibold text-gray-800">{alert.title}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                            {alert.severity}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-2">{alert.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>{alert.location}</span>
                          <span>•</span>
                          <span>{alert.timestamp.toLocaleString()}</span>
                          <span>•</span>
                          <span>Source: {alert.source}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {!alert.acknowledged && (
                        <button
                          onClick={() => acknowledgeAlert(alert.id)}
                          className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
                        >
                          Acknowledge
                        </button>
                      )}
                      <button
                        onClick={() => dismissAlert(alert.id)}
                        className="px-3 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Alert Settings */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Alert Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-700 mb-3">Threshold Settings</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Temperature Alert (°F)</label>
                <input type="number" defaultValue="85" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Humidity Alert (%)</label>
                <input type="number" defaultValue="30" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Smoke Level (ppm)</label>
                <input type="number" defaultValue="50" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-700 mb-3">Notification Settings</h4>
            <div className="space-y-3">
              <label className="flex items-center space-x-2">
                <input type="checkbox" defaultChecked className="rounded" />
                <span className="text-sm text-gray-600">Email Notifications</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" defaultChecked className="rounded" />
                <span className="text-sm text-gray-600">SMS Alerts</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" defaultChecked className="rounded" />
                <span className="text-sm text-gray-600">Emergency Broadcasts</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="rounded" />
                <span className="text-sm text-gray-600">Auto-Deploy UAVs</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertCenter;