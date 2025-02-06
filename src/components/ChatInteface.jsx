import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BsMicFill, BsSend } from 'react-icons/bs';
import { FaRobot } from 'react-icons/fa';
import { IoPerson } from 'react-icons/io5';

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isThinking, setIsThinking] = useState(false); // Added thinking state
  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Popup states
  const [showPopup, setShowPopup] = useState(false); // For popup visibility
  const [popupText, setPopupText] = useState(''); // For dynamic popup text

  // Relay WebSocket and bulb state
  const socketRelayRef = useRef(null); // WebSocket reference for relay control
  const [isBulbOn, setIsBulbOn] = useState(false); // UI bulb state

  // Auto-scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize SpeechRecognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition =
        window.webkitSpeechRecognition || window.SpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false; // Stop listening after a single phrase
      recognition.interimResults = false; // Do not show interim results
      recognition.lang = 'en-US'; // Set language to English

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        handleSend(transcript); // Automatically send the recognized speech
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
      };

      recognitionRef.current = recognition;
      recognition.start(); // Start listening immediately on load
    } else {
      console.warn('SpeechRecognition is not supported in this browser.');
    }
  }, []);

  // WebSocket setup for relay control
  useEffect(() => {
    const socketRelay = new WebSocket('wss://jarvisai-backend.onrender.com/ws/switch-control/');
    socketRelayRef.current = socketRelay;

    socketRelay.onopen = () => console.log('Relay WebSocket connected');
    socketRelay.onclose = () => console.log('Relay WebSocket disconnected');
    socketRelay.onerror = (error) => console.error('Relay WebSocket error:', error);

    return () => {
      if (socketRelay) socketRelay.close();
    };
  }, []);

  const handleSend = async (inputText) => {
    if (!inputText.trim()) return;

    const newMessage = { type: 'user', text: inputText };
    setMessages((prev) => [...prev, newMessage]);
    setUserInput(""); // Clears the input field

    setIsThinking(true); // Show the thinking indicator

    try {
      const response = await fetch('https://jarvisai-backend.onrender.com/aiLoad', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: inputText }),
      });

      const data = await response.json();
      const aiMessage = { type: 'ai', text: data.response };
      setMessages((prev) => [...prev, aiMessage]);

      speakText(data.response); // Ensure text-to-speech is called after receiving AI response

      setPopupText(data.response);
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 3000);

      if (data.action === 'turn_on' || data.action === 'turn_off') {
        if (data.action === 'turn_on') {
          setIsBulbOn(true);
        } else if (data.action === 'turn_off') {
          setIsBulbOn(false);
        }
        sendRelayCommand(data.action);
      }
    } catch (error) {
      console.error('Error interacting with AI:', error);
    } finally {
      setIsThinking(false); // Hide the thinking indicator after response
    }
  };

  const sendRelayCommand = (action) => {
    const socketRelay = socketRelayRef.current;
    if (socketRelay && socketRelay.readyState === WebSocket.OPEN) {
      socketRelay.send(JSON.stringify({ action }));
      console.log(`Sent action to relay: ${action}`);
    } else {
      console.error('Relay WebSocket is not connected');
    }
  };

  const speakText = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);

    // Function to handle voice selection and speaking
    const setVoice = () => {
      const voices = window.speechSynthesis.getVoices();

      // Try to find a female voice
      const femaleVoice = voices.find((voice) => voice.name.toLowerCase().includes('female'));

      // If a female voice is found, use it; otherwise, fallback to the first available voice
      utterance.voice = femaleVoice || voices[0];

      // If voices are not loaded yet, set the callback to get them after they're loaded
      if (voices.length === 0) {
        window.speechSynthesis.onvoiceschanged = () => {
          const updatedVoices = window.speechSynthesis.getVoices();
          const femaleVoiceUpdated = updatedVoices.find((voice) =>
            voice.name.toLowerCase().includes('female')
          );
          utterance.voice = femaleVoiceUpdated || updatedVoices[0]; // Default to first available if no female voice
          window.speechSynthesis.speak(utterance);
          setShowPopup(true);
          console.log("Voices loaded, speaking...");
        };
        return; // Exit early if voices aren't loaded yet
      }

      // If voices are already loaded, proceed to speak
      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
      setShowPopup(true);
      console.log("Speaking text...");
    };

    // Call the setVoice function to start the process
    setVoice();
  };

  const handleStartListening = () => {
    if (recognitionRef.current) {
      if (isListening) {
        recognitionRef.current.stop(); // Stop recognition if it's running
        setIsListening(false);
        console.log("Speech recognition stopped");
      } else {
        recognitionRef.current.start(); // Start recognition if it's not running
        setIsListening(true);
        console.log("Speech recognition started");
      }
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <header className="bg-white shadow-md p-4 text-center text-xl font-semibold border-b">
        J.A.R.V.I.S Chat {isBulbOn ? '💡' : '🔌'}
      </header>
      <div className="flex-1 overflow-y-auto p-4 space-y-4 relative">
        {messages.map((msg, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`flex items-start ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex items-center gap-2 ${msg.type === 'user' ? 'flex-row-reverse' : ''}`}>
              {msg.type === 'ai' ? (
                <FaRobot className="text-gray-600 text-xl" />
              ) : (
                <IoPerson className="text-blue-500 text-xl" />
              )}
              <div
                className={`p-3 rounded-lg max-w-xs ${
                  msg.type === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'
                }`}
              >
                {msg.text}
              </div>
            </div>
          </motion.div>
        ))}

        {/* Thinking Indicator */}
        {isThinking && (
          <div className="flex justify-center">
            <div className="bg-gray-300 p-2 rounded-full animate-pulse">Thinking...</div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <div className="bg-white p-4 flex items-center gap-2 border-t">
        <button
          onClick={handleStartListening}
          className={`p-3 rounded-full ${isListening ? 'bg-red-500' : 'bg-gray-300'} hover:bg-gray-400`}
        >
          <BsMicFill className="text-white text-lg" />
        </button>
        <input
  type="text"
  value={userInput}
  onChange={(e) => setUserInput(e.target.value)}
  onKeyDown={(e) => {
    if (e.key === 'Enter') {
      handleSend(userInput);
    }
  }}
  placeholder="Type a message..."
  className="flex-1 border rounded-lg p-3 focus:outline-none"
/>

        <button
          onClick={() => handleSend(userInput)}
          className="p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600"
        >
          <BsSend />
        </button>
      </div>
    </div>
  );
};

export default ChatInterface;
