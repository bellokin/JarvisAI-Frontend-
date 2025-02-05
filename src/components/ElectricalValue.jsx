import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const ElectricalComponent = () => {
  const [isConnectedCurrent, setIsConnectedCurrent] = useState(false);
  const [currentValues, setCurrentValues] = useState({ current: (Math.random() * 10).toFixed(2), voltage: (Math.random() * 240).toFixed(2) });
  const [data, setData] = useState([]);
  const socketCurrentRef = useRef(null);

  useEffect(() => {
    const socketCurrent = new WebSocket('wss://jarvisai-backend.onrender.com/ws/current-values/');
    socketCurrentRef.current = socketCurrent;

    socketCurrent.onopen = () => {
      setIsConnectedCurrent(true);
      console.log('Current WebSocket connected');
  const randomData = { current: (Math.random() * 10).toFixed(2), voltage: (Math.random() * 240).toFixed(2) };
        setCurrentValues(randomData);
     
    };

    socketCurrent.onmessage = (event) => {
      try {
        let newData = JSON.parse(event.data);
        if (newData.current === undefined || newData.voltage === undefined) {
          newData = { current: (Math.random() * 10).toFixed(2), voltage: (Math.random() * 240).toFixed(2) };
        }
        setCurrentValues(newData);
        setData((prevData) => [...prevData.slice(-19), { time: new Date().toLocaleTimeString(), ...newData }]);
        console.log('Received current values:', newData);
      } catch (error) {
        console.error('Error parsing message from current WebSocket:', error);
      }
    };

    socketCurrent.onclose = () => {
      setIsConnectedCurrent(false);
      console.log('Current WebSocket disconnected');

      // Generate random values when socket disconnects
      const interval = setInterval(() => {
        const randomData = { current: (Math.random() * 10).toFixed(2), voltage: (Math.random() * 240).toFixed(2) };
        setCurrentValues(randomData);
        setData((prevData) => [...prevData.slice(-19), { time: new Date().toLocaleTimeString(), ...randomData }]);
      }, 2000);

      return () => clearInterval(interval);
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
        <p className="text-sm text-gray-500">House 1A: {isConnectedCurrent ? 'Connected' : 'Disconnected'}</p>
        <p className="text-lg font-bold text-gray-800">Current: {currentValues.current} A</p>
        <p className="text-lg font-bold text-gray-800">Voltage: {currentValues.voltage} V</p>
      </div>
      <div className="mt-6 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="current" stroke="#8884d8" dot={false} />
            <Line type="monotone" dataKey="voltage" stroke="#82ca9d" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Professional Disclaimer */}
      <div className="mt-4 p-4 bg-gray-100 rounded-lg border border-gray-300">
        <p className="text-sm text-gray-700">
        <strong>Note:</strong> The current and voltage readings displayed are mock values, used to demonstrate Jarvis' ability to interact with and process household electrical data. For privacy reasons, Jarvis does not display any of its currently integrated household system values.
<br />
An interactive bulb in the chat interface further showcases Jarvis' natural language processing (NLP) capabilities integrated with hardware.
<br />
In addition to understanding commands like "Turn on my switch," Jarvis also functions as an AI chatbot, capable of engaging in regular conversations and responding to a wide variety of inquiries.
<br />
Jarvis can process speech-to-text multimodal commands and is equipped with a voice module to engage in spoken conversations, enhancing its interactivity.
<br />
<br />
  To see Jarvis in action, check out this demonstration video:
            <a href="https://youtu.be/cnM65i1Fg2k?si=w5gKMcFYzeEuqPs7" className="text-blue-500 underline ml-1" target="_blank" rel="noopener noreferrer">
            this demonstration video
          </a>.
        </p>

      </div>
    </div>
  );
};

export default ElectricalComponent;
