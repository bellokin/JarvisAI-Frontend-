import React, { useState, useRef, useEffect } from 'react';
import ThinkingBubble from "./ThinkingBubble"; // Import the new component

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isListening, setIsListening] = useState(false); // For speech-to-text status
  const [isThinking, setIsThinking] = useState(false); // For AI processing status

  const [showPopup, setShowPopup] = useState(false); // For popup visibility
  const recognitionRef = useRef(null); // Reference for SpeechRecognition
  const socketRelayRef = useRef(null); // WebSocket reference for relay control
  const [popupText, setPopupText] = useState(''); // For dynamic popup text

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

    setIsThinking(true); // Show the thinking bubble

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
     
      setTimeout(() => setShowPopup(false), 3000);

      if (data.action === 'turn_on' || data.action === 'turn_off') {
        sendRelayCommand(data.action);
      }
    } catch (error) {
      console.error('Error interacting with AI:', error);
    } finally {
      setIsThinking(false); // Hide the thinking bubble after response
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
    console.log("Speak ggegg");
    const utterance = new SpeechSynthesisUtterance(text);

    // Function to handle voice selection and speaking
    const setVoice = () => {
      const voices = window.speechSynthesis.getVoices();

      // Try to find a female voice
      const femaleVoice = voices.find((voice) => voice.name.toLowerCase().includes('female'));

      // If a female voice is found, use it
      if (femaleVoice) {
        utterance.voice = femaleVoice;

      } else {
        // If no female voice is found, fallback to the first available voice (could be male)
        utterance.voice = voices[0];
      }

      // If voices are not loaded yet, set the callback to get them after they're loaded
      if (voices.length === 0) {
        window.speechSynthesis.onvoiceschanged = () => {
          const updatedVoices = window.speechSynthesis.getVoices();
          const femaleVoice = updatedVoices.find((voice) => voice.name.toLowerCase().includes('female'));
          utterance.voice = femaleVoice || updatedVoices[0]; // Default to first available if no female voice
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
      recognitionRef.current.start();
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col items-center justify-center p-6">
      <div className="bg-white shadow-lg rounded-lg w-full max-w-md p-6">
        <h1 className="text-2xl font-bold text-center mb-4">J.A.R.V.I.S</h1>
        <div className="h-64 overflow-y-auto border border-gray-300 p-4 rounded mb-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`p-2 rounded-lg my-2 ${msg.type === "user"
                  ? "bg-blue-500 text-white ml-auto max-w-xs"
                  : "bg-green-500 text-white mr-auto max-w-xs"
                }`}
            >
              {msg.text}
            </div>
          ))}
          {isThinking && <ThinkingBubble />} {/* Show animation when AI is thinking */}
        </div>
        <div className="flex flex-col space-y-4">
          <button
            onClick={handleStartListening}
            className={`w-full px-4 py-2 text-white rounded-md ${isListening ? "bg-red-500" : "bg-green-500"
              }`}
          >
            {isListening ? "Listening..." : "🎤 Speak to J.A.R.V.I.S"}
          </button>
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Type here (optional)..."
            className="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            onClick={() => handleSend(userInput)}
            className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
