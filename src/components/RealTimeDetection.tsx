import React, { useState, useEffect, useContext, useRef } from 'react';
import { Camera, Wifi, WifiOff, AlertTriangle, CheckCircle, Activity, Play, Square, Power, PowerOff } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { AlertContext } from '../context/AlertContext';

interface DetectionResult {
  prediction: string;
  probability: string;
}

const RealTimeDetection: React.FC = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [detectionResult, setDetectionResult] = useState<DetectionResult | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [detectionHistory, setDetectionHistory] = useState<Array<DetectionResult & { timestamp: Date }>>([]);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { addAlert } = useContext(AlertContext);

  // Alert management state
  const [fireDetectionCount, setFireDetectionCount] = useState(0);
  const [lastFireAlert, setLastFireAlert] = useState<Date | null>(null);
  const [isFireAlertActive, setIsFireAlertActive] = useState(false);
  const fireDetectionThreshold = 50; // 5 seconds at 10 FPS

  const connectToServer = () => {
    if (socket) return;

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

      // Handle fire detection counting
      if (data.prediction === 'Fire' && parseFloat(data.probability) > 55) {
        setFireDetectionCount(prev => prev + 1);
      } else {
        setFireDetectionCount(0); // Reset counter if not fire
      }
    });

    setSocket(newSocket);
  };

  const disconnectFromServer = () => {
    if (socket) {
      socket.close();
      setSocket(null);
      setIsConnected(false);
      setDetectionResult(null);
      setLastUpdate(null);
      setFireDetectionCount(0);
      setIsFireAlertActive(false);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 } 
      });
      setVideoStream(stream);
      setIsCameraActive(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Could not access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (videoStream) {
      videoStream.getTracks().forEach(track => track.stop());
      setVideoStream(null);
      setIsCameraActive(false);
      
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  };

  // Handle fire alert generation
  useEffect(() => {
    if (fireDetectionCount >= fireDetectionThreshold && !isFireAlertActive) {
      setIsFireAlertActive(true);
      setLastFireAlert(new Date());
      
      addAlert({
        title: 'CRITICAL: Fire Detected!',
        description: `Sustained fire detection for 5+ seconds with high confidence. Immediate action required.`,
        severity: 'critical',
        location: 'Camera Station 1',
        source: 'AI Detection System'
      });
    }
  }, [fireDetectionCount, isFireAlertActive, addAlert]);

  // Reset fire alert when acknowledged (this would be handled by the alert system)
  useEffect(() => {
    // Reset fire alert status after 30 seconds to allow new alerts
    if (isFireAlertActive && lastFireAlert) {
      const timer = setTimeout(() => {
        setIsFireAlertActive(false);
        setFireDetectionCount(0);
      }, 30000);
      
      return () => clearTimeout(timer);
    }
  }, [isFireAlertActive, lastFireAlert]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
      disconnectFromServer();
    };
  }, []);

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
          <div className="flex items-center space-x-4">
            {/* Connection Status */}
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
            
            {/* Camera Status */}
            <div className="flex items-center space-x-2">
              {isCameraActive ? (
                <div className="flex items-center space-x-2 text-blue-600">
                  <Camera className="w-4 h-4" />
                  <span className="text-sm">Camera Active</span>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                </div>
              ) : (
                <div className="flex items-center space-x-2 text-gray-600">
                  <Camera className="w-4 h-4" />
                  <span className="text-sm">Camera Off</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex flex-wrap gap-3 mb-6">
          {!isConnected ? (
            <button
              onClick={connectToServer}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Power className="w-4 h-4" />
              <span>Connect to Server</span>
            </button>
          ) : (
            <button
              onClick={disconnectFromServer}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <PowerOff className="w-4 h-4" />
              <span>Disconnect</span>
            </button>
          )}

          {!isCameraActive ? (
            <button
              onClick={startCamera}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Play className="w-4 h-4" />
              <span>Start Camera</span>
            </button>
          ) : (
            <button
              onClick={stopCamera}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Square className="w-4 h-4" />
              <span>Stop Camera</span>
            </button>
          )}
        </div>

        {/* Video Feed and Detection Results */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Live Video Feed */}
          <div className="relative bg-gray-900 rounded-lg overflow-hidden min-h-64">
            {isCameraActive ? (
              <div className="relative">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
                {/* Live Indicator */}
                <div className="absolute top-4 left-4 flex items-center space-x-2 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <span>LIVE</span>
                </div>
                {/* Timestamp */}
                {lastUpdate && (
                  <div className="absolute top-4 right-4 bg-black/50 text-white px-2 py-1 rounded text-xs">
                    {lastUpdate.toLocaleTimeString()}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 text-white">
                <div className="text-center">
                  <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <div className="text-lg font-medium">Camera Feed</div>
                  <div className="text-sm text-gray-400 mt-2">
                    Start camera to view live feed
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Detection Results */}
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
                
                {/* Fire Detection Progress */}
                {detectionResult.prediction === 'Fire' && (
                  <div className="mt-3 p-2 bg-red-200/50 rounded">
                    <div className="text-xs font-medium">Fire Detection Progress</div>
                    <div className="text-xs">
                      {fireDetectionCount}/{fireDetectionThreshold} frames 
                      ({((fireDetectionCount / fireDetectionThreshold) * 100).toFixed(1)}%)
                    </div>
                    <div className="w-full bg-red-300 rounded-full h-1 mt-1">
                      <div 
                        className="h-1 rounded-full bg-red-600 transition-all duration-300"
                        style={{ width: `${Math.min((fireDetectionCount / fireDetectionThreshold) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="border-2 border-gray-200 rounded-lg p-4 text-center text-gray-500">
                {isConnected && isCameraActive ? 'Analyzing video feed...' : 'Connect server and start camera'}
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
            <h4 className="font-medium text-gray-700 mb-3">Alert Settings</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Fire Alert Confidence (%)</label>
                <input type="number" defaultValue="70" min="0" max="100" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Fire Detection Duration (seconds)</label>
                <input type="number" defaultValue="5" min="1" max="30" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Alert Cooldown (seconds)</label>
                <input type="number" defaultValue="30" min="10" max="300" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-700 mb-3">Camera Settings</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Video Resolution</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="640x480">640x480</option>
                  <option value="1280x720">1280x720 (HD)</option>
                  <option value="1920x1080">1920x1080 (Full HD)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Detection Frequency</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="10">10 FPS</option>
                  <option value="5">5 FPS</option>
                  <option value="1">1 FPS</option>
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
