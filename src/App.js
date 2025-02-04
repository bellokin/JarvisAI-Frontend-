import React from 'react';
import ElectricalComponent from './components/ElectricalValue';
import SwitchControlComponent from './components/SwitchControl';

const App = () => {
  return (
    <div className="min-h-screen bg-white text-gray-800 flex flex-col items-center p-4">
      <h1 className="text-3xl font-bold mb-8 text-blue-600">J.A.R.V.I.S</h1>
      <div className="w-full max-w-4xl">
        <ElectricalComponent />
        <div className="my-6"></div>
        <SwitchControlComponent />
      </div>
    </div>
  );
};

export default App; 