import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaMicrophone } from "react-icons/fa";

const ListeningAnimation = ({ isListening }) => {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length < 3 ? prev + "." : ""));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center">
      {/* Glowing Sphere (Only animates if isListening is true) */}
      <motion.div
        className="relative w-60 h-60 bg-transparent rounded-full border-4 border-blue-500"
        animate={isListening ? { boxShadow: ["0px 0px 20px #00FFFF", "0px 0px 40px #00FFFF"] } : {}}
        transition={{ repeat: isListening ? Infinity : 0, duration: 2, ease: "easeInOut" }}
      >
        {/* Sound Wave Effect (Only animates if isListening is true) */}
        {isListening && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{
              opacity: [0.5, 1, 0.5],
              scale: [1, 1.1, 1],
            }}
            transition={{
              repeat: Infinity,
              duration: 1.5,
              ease: "easeInOut",
            }}
          >
            <svg viewBox="0 0 200 100" width="100%" height="100%">
              <motion.path
                d="M0,50 C50,20 100,80 150,40 C200,10 250,90 300,50"
                stroke="cyan"
                strokeWidth="3"
                fill="transparent"
                animate={{
                  d: [
                    "M0,50 C50,20 100,80 150,40 C200,10 250,90 300,50",
                    "M0,50 C50,80 100,20 150,60 C200,90 250,10 300,50",
                  ],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                  ease: "easeInOut",
                }}
              />
            </svg>
          </motion.div>
        )}
      </motion.div>
      <p className="text-white text-2xl font-semibold mt-2">
        {isListening ? `Listening${dots}` : "Click to Start Listening"}
      </p>

      {/* Microphone Icon */}
      <motion.div
        className="my-4 text-blue-400"
        animate={isListening ? { scale: [1, 1.2, 1] } : {}}
        transition={{ repeat: isListening ? Infinity : 0, duration: 1 }}
      >
        <FaMicrophone size={28} />
      </motion.div>
    </div>
  );
};

export default ListeningAnimation;
