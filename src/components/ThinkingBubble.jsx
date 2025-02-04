import React from "react";

const ThinkingBubble = () => {
  return (
    <div
      style={{
        position: "fixed",
        top: "0",
        left: "0",
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.7)", // Semi-transparent dark background
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          display: "flex",
          gap: "20px", // Larger space between dots
        }}
      >
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            style={{
              width: "30px",  // Increased size of the dots
              height: "30px",
              borderRadius: "50%",
              backgroundColor: "#ffffff", // Changed dot color to white
              opacity: 0,
              animation: `pulse 1.5s ${i * 0.3}s infinite ease-in-out`,
            }}
          ></div>
        ))}
      </div>

      <style>
        {`
          @keyframes pulse {
            0% {
              opacity: 0;
              transform: scale(0.5);
            }
            50% {
              opacity: 1;
              transform: scale(2);
            }
            100% {
              opacity: 0;
              transform: scale(0.5);
            }
          }
        `}
      </style>
    </div>
  );
};

export default ThinkingBubble;
