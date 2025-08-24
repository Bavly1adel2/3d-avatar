'use client';

import { ThreeDAvatarCard } from '@/components/AvatarSession/ThreeDAvatarCard';
import { useState } from 'react';

export default function Test3DPage() {
  const [isTalking, setIsTalking] = useState(false);
  const [isConnected, setIsConnected] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">
            Mariem - Patient with Skin Issues
          </h1>
          <p className="mt-2 text-gray-300">
            You are the doctor helping Mariem, a 45-year-old patient from UAE with persistent skin problems
          </p>
        </div>

        {/* Controls */}
        <div className="mb-6 flex gap-4">
          <button
            onClick={() => setIsTalking(!isTalking)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              isTalking 
                ? 'bg-red-600 text-white' 
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {isTalking ? 'Stop Talking' : 'Start Talking'}
          </button>
          
          <button
            onClick={() => setIsConnected(!isConnected)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              isConnected 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-600 text-white hover:bg-gray-700'
            }`}
          >
            {isConnected ? 'Disconnect' : 'Connect'}
          </button>
        </div>

                                       {/* 3D Avatar Card */}
                <ThreeDAvatarCard
                  isTalking={isTalking}
                  isConnected={isConnected}
                  title="Mariem - Patient with Skin Issues"
                  description="45-year-old patient from UAE seeking help for persistent skin problems"
                  onSendMessage={(message) => {
                    console.log('Test message sent:', message);
                    // Simulate talking for demo
                    setIsTalking(true);
                    setTimeout(() => setIsTalking(false), 3000);
                  }}
                  showTextChat={true}
                  className="w-full"
                />

                 {/* Doctor's Guide */}
         <div className="mt-6 p-4 bg-blue-900/20 rounded-lg border border-blue-600/30">
           <h3 className="text-lg font-semibold text-blue-400 mb-2">👨‍⚕️ Doctor's Guide - How to Help Mariem</h3>
           <div className="text-sm text-blue-200 space-y-2">
             <p><strong>Mariem will say:</strong> "Hi doctor." (and wait for you to ask questions)</p>
             <p><strong>Start the consultation:</strong> "Hi Mariem, what brings you in today?" or "What's your problem?"</p>
             <p><strong>Ask about symptoms:</strong> "Can you describe your skin issues?" or "When did this start?"</p>
             <p><strong>Explore impact:</strong> "How does this affect your daily life?" or "Are you having trouble sleeping?"</p>
             <p><strong>Family history:</strong> "Does anyone in your family have asthma or allergies?"</p>
             <p><strong>Previous treatments:</strong> "What have you tried so far?"</p>
             <p><strong>Give diagnosis:</strong> "Based on your symptoms, this appears to be atopic dermatitis (eczema)"</p>
           </div>
         </div>

        {/* Status Info */}
        <div className="mt-6 p-4 bg-gray-800/50 rounded-lg border border-gray-600/50">
          <h3 className="text-lg font-semibold text-white mb-2">Status Information</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-300">Talking State:</span>
              <span className={`ml-2 font-medium ${isTalking ? 'text-green-400' : 'text-red-400'}`}>
                {isTalking ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div>
              <span className="text-gray-300">Connection:</span>
              <span className={`ml-2 font-medium ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
