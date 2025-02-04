import React, { useState, useEffect, useRef } from 'react';

const ElectricalComponent = () => {
  const [isConnectedCurrent, setIsConnectedCurrent] = useState(false);
  const [currentValues, setCurrentValues] = useState({ current: 0, voltage: 0 });
  const socketCurrentRef = useRef(null);

  useEffect(() => {
    const socketCurrent = new WebSocket('wss://jarvisai-backend.onrender.com/ws/current-values/');
    socketCurrentRef.current = socketCurrent;

    socketCurrent.onopen = () => {
      setIsConnectedCurrent(true);
      console.log('Current WebSocket connected');
    };

    socketCurrent.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.current !== undefined && data.voltage !== undefined) {
          setCurrentValues(data);
          console.log('Received current values:', data);
        }
      } catch (error) {
        console.error('Error parsing message from current WebSocket:', error);
      }
    };

    socketCurrent.onclose = () => {
      setIsConnectedCurrent(false);
      console.log('Current WebSocket disconnected');
    };

    socketCurrent.onerror = (error) => {
      console.error('Current WebSocket error:', error);
    };

    return () => {
      if (socketCurrent) socketCurrent.close();
    };
  }, []);

  return (
    <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
      <h2 className="text-xl font-semibold text-blue-600 mb-4">Energy Consumption</h2>
      <div className="space-y-2">
        <p className="text-sm text-gray-500">WebSocket Status: {isConnectedCurrent ? 'Connected' : 'Disconnected'}</p>
        <p className="text-lg font-bold text-gray-800">Current: {currentValues.current} A</p>
        <p className="text-lg font-bold text-gray-800">Voltage: {currentValues.voltage} V</p>
      </div>
    </div>
  );
};

export default ElectricalComponent;
