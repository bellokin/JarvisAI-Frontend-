import React, { useState, useRef, useEffect } from 'react';
import ChatInterface from './ChatInteface';
const SwitchControlComponent = () => {
  const [isConnectedRelay, setIsConnectedRelay] = useState(false);
  const [switchState, setSwitchState] = useState('No');
  const [userInput, setUserInput] = useState('');
  const socketRelayRef = useRef(null);

  useEffect(() => {
    const socketRelay = new WebSocket('wss://jarvisai-backend.onrender.com/ws/switch-control/');

    socketRelayRef.current = socketRelay;

    socketRelay.onopen = () => {
      setIsConnectedRelay(true);
      console.log('Relay WebSocket connected');
    };

    socketRelay.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.switch_control) {
          setSwitchState(data.switch_control);
          console.log('Received switch_control state:', data.switch_control);
        }
      } catch (error) {
        console.error('Error parsing message from relay WebSocket:', error);
      }
    };

    socketRelay.onclose = () => {
      setIsConnectedRelay(false);
      console.log('Relay WebSocket disconnected');
    };

    socketRelay.onerror = (error) => {
      console.error('Relay WebSocket error:', error);
    };

    return () => {
      if (socketRelay) socketRelay.close();
    };
  }, []);

  const sendRelayCommand = (action) => {
    const socketRelay = socketRelayRef.current;
    if (socketRelay && socketRelay.readyState === WebSocket.OPEN) {
      const message = { action };
      socketRelay.send(JSON.stringify(message));
      console.log(`Sent action to relay: ${action}`);
    } else {
      console.error('Relay WebSocket is not connected');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (userInput.trim() === 'turn_on' || userInput.trim() === 'turn_off') {
      sendRelayCommand(userInput.trim());
      setUserInput('');
    } else {
      alert('Invalid command. Use "turn_on" or "turn_off".');
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
      <h2 className="text-xl font-semibold text-blue-600 mb-4">Switch Control</h2>
      <p className="text-sm text-gray-500 mb-2">WebSocket Status: {isConnectedRelay ? 'Connected' : 'Disconnected'}</p>
      <p className="text-sm text-gray-500 mb-4">Switch State: <span className="font-bold text-gray-800">{switchState}</span></p>
      <ChatInterface/>
    </div>
  );
};

export default SwitchControlComponent;
