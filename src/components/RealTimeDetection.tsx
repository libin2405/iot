import React, { useState, useEffect, useContext } from 'react';
import { Camera, Wifi, WifiOff, AlertTriangle, CheckCircle, Activity } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { AlertContext } from '../context/AlertContext';

interface DetectionResult {
  prediction: string;
  probability: string;
}

const RealTimeDetection: React.FC = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [detectionResult, setDetectionResult] = useState<DetectionResult | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [detectionHistory, setDetectionHistory] = useState<Array<DetectionResult & { timestamp: Date }>>([]);
  const { addAlert } = useContext(AlertContext);

  useEffect(() => {
    // Connect to Flask-SocketIO backend
    const newSocket = io('http://localhost:5000');
    
    newSocket.on('connect', () => {
      console.log('Connected to detection server');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from detection server');
      setIsConnected(false);
    });

    newSocket.on('prediction_result', (data: DetectionResult) => {
      setDetectionResult(data);
      setLastUpdate(new Date());
      
      // Add to history
      setDetectionHistory(prev => [
        { ...data, timestamp: new Date() },
        ...prev.slice(0, 9) // Keep last 10 results
      ]);

      // Generate alerts for fire or smoke detection
      if (data.prediction === 'Fire' && parseFloat(data.probability) > 70) {
        addAlert({
          title: 'Fire Detected!',
          description: `Real-time camera detected fire with ${data.probability}% confidence`,
          severity: 'critical',
          location: 'Camera Station 1',
          source: 'AI Detection System'
        });
      } else if (data.prediction === 'Smoke' && parseFloat(data.probability) > 60) {
        addAlert({
          title: 'Smoke Detected',
          description: `Smoke detected with ${data.probability}% confidence`,
          severity: 'high',
          location: 'Camera Station 1',
          source: 'AI Detection System'
        });
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [addAlert]);

  const getDetectionColor = (prediction: string) => {
    switch (prediction) {
      case 'Fire': return 'text-red-600 bg-red-100 border-red-200';
      case 'Smoke': return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'Neutral': return 'text-green-600 bg-green-100 border-green-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getDetectionIcon = (prediction: string) => {
    switch (prediction) {
      case 'Fire': return AlertTriangle;
      case 'Smoke': return Activity;
      case 'Neutral': return CheckCircle;
      default: return CheckCircle;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Camera className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-800">Real-Time Fire Detection</h2>
          </div>
          <div className="flex items-center space-x-2">
            {isConnected ? (
              <div className="flex items-center space-x-2 text-green-600">
                <Wifi className="w-4 h-4" />
                <span className="text-sm">Connected</span>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-red-600">
                <WifiOff className="w-4 h-4" />
                <span className="text-sm">Disconnected</span>
              </div>
            )}
          </div>
        </div>

        {/* Current Detection Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-gray-900 rounded-lg p-4 flex items-center justify-center min-h-64">
            <div className="text-center text-white">
              <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <div className="text-lg font-medium">Live Camera Feed</div>
              <div className="text-sm text-gray-400 mt-2">
                AI analyzing video stream in real-time
              </div>
              {lastUpdate && (
                <div className="text-xs text-gray-500 mt-2">
                  Last frame: {lastUpdate.toLocaleTimeString()}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Current Detection</h3>
            
            {detectionResult ? (
              <div className={`border-2 rounded-lg p-4 ${getDetectionColor(detectionResult.prediction)}`}>
                <div className="flex items-center space-x-3 mb-2">
                  {React.createElement(getDetectionIcon(detectionResult.prediction), { 
                    className: "w-6 h-6" 
                  })}
                  <span className="text-xl font-bold">{detectionResult.prediction}</span>
                </div>
                <div className="text-sm opacity-80">
                  Confidence: {detectionResult.probability}%
                </div>
                <div className="mt-2">
                  <div className="w-full bg-white/30 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full bg-current transition-all duration-300"
                      style={{ width: `${detectionResult.probability}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="border-2 border-gray-200 rounded-lg p-4 text-center text-gray-500">
                {isConnected ? 'Waiting for detection results...' : 'Connect to detection server'}
              </div>
            )}

            {/* Detection Statistics */}
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-lg font-bold text-red-600">
                  {detectionHistory.filter(h => h.prediction === 'Fire').length}
                </div>
                <div className="text-xs text-gray-600">Fire Detections</div>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <div className="text-lg font-bold text-orange-600">
                  {detectionHistory.filter(h => h.prediction === 'Smoke').length}
                </div>
                <div className="text-xs text-gray-600">Smoke Detections</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-lg font-bold text-green-600">
                  {detectionHistory.filter(h => h.prediction === 'Neutral').length}
                </div>
                <div className="text-xs text-gray-600">Normal Frames</div>
              </div>
            </div>
          </div>
        </div>

        {/* Detection History */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Detections</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {detectionHistory.length > 0 ? (
              detectionHistory.map((detection, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {React.createElement(getDetectionIcon(detection.prediction), { 
                      className: `w-4 h-4 ${
                        detection.prediction === 'Fire' ? 'text-red-600' :
                        detection.prediction === 'Smoke' ? 'text-orange-600' :
                        'text-green-600'
                      }` 
                    })}
                    <span className="font-medium">{detection.prediction}</span>
                    <span className="text-sm text-gray-500">{detection.probability}%</span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {detection.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-4">
                No detection history available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* System Configuration */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Detection Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-700 mb-3">Alert Thresholds</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Fire Alert Confidence (%)</label>
                <input type="number" defaultValue="70" min="0" max="100" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Smoke Alert Confidence (%)</label>
                <input type="number" defaultValue="60" min="0" max="100" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-700 mb-3">Camera Settings</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Detection Frequency</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="10">10 FPS</option>
                  <option value="5">5 FPS</option>
                  <option value="1">1 FPS</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Camera Source</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="0">Default Camera</option>
                  <option value="1">External Camera</option>
                  <option value="rtsp">RTSP Stream</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealTimeDetection;