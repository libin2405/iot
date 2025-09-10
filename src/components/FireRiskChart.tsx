import React from 'react';
import { TrendingUp } from 'lucide-react';

const FireRiskChart: React.FC = () => {
  const riskData = [
    { hour: '06:00', risk: 2 },
    { hour: '09:00', risk: 3 },
    { hour: '12:00', risk: 4 },
    { hour: '15:00', risk: 5 },
    { hour: '18:00', risk: 4 },
    { hour: '21:00', risk: 3 },
    { hour: '00:00', risk: 2 },
  ];

  const maxRisk = 5;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center space-x-3 mb-4">
        <TrendingUp className="w-6 h-6 text-green-600" />
        <h3 className="text-lg font-semibold text-gray-800">Fire Risk Trend</h3>
      </div>

      <div className="relative h-48">
        <div className="flex items-end justify-between h-full border-b border-gray-200">
          {riskData.map((data, index) => {
            const height = (data.risk / maxRisk) * 100;
            const color = data.risk <= 2 ? 'bg-green-500' : 
                         data.risk <= 3 ? 'bg-yellow-500' : 
                         'bg-red-500';
            
            return (
              <div key={index} className="flex flex-col items-center flex-1">
                <div 
                  className={`w-8 ${color} rounded-t-md transition-all duration-500 hover:opacity-80`}
                  style={{ height: `${height}%` }}
                  title={`Risk Level: ${data.risk} at ${data.hour}`}
                ></div>
                <div className="text-xs text-gray-500 mt-2">{data.hour}</div>
              </div>
            );
          })}
        </div>
        
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 -ml-8">
          <span>5</span>
          <span>4</span>
          <span>3</span>
          <span>2</span>
          <span>1</span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-lg font-bold text-red-600">High</div>
          <div className="text-xs text-gray-500">15:00 Peak</div>
        </div>
        <div>
          <div className="text-lg font-bold text-yellow-600">Moderate</div>
          <div className="text-xs text-gray-500">Current Level</div>
        </div>
        <div>
          <div className="text-lg font-bold text-green-600">Low</div>
          <div className="text-xs text-gray-500">Overnight</div>
        </div>
      </div>
    </div>
  );
};

export default FireRiskChart;