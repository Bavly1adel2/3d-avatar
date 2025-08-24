import React, { useState, useEffect } from 'react';
import { ThreeDAvatar } from './ThreeDAvatar';
import { Input } from '../Input';
import { Button } from '../Button';
import { useElevenLabs } from '../logic/useElevenLabs';
import { useConversationAI } from '../logic/useConversationAI';
import { ELEVENLABS_CONFIG } from '../../app/lib/elevenlabs-config';

interface ThreeDAvatarCardProps {
  isTalking: boolean;
  isConnected: boolean;
  className?: string;
  title?: string;
  description?: string;
  showControls?: boolean;
  onSendMessage?: (message: string) => void;
  showTextChat?: boolean;
}

export const ThreeDAvatarCard: React.FC<ThreeDAvatarCardProps> = ({
  isTalking,
  isConnected,
  className = "",
  title = "Mariem - Patient with Skin Issues",
  description = "45-year-old patient from UAE seeking help for persistent skin problems",
  showControls = true,
  onSendMessage,
  showTextChat = true
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [message, setMessage] = useState("");
  const [messageHistory, setMessageHistory] = useState<Array<{text: string, type: 'user' | 'avatar'}>>([]);
  const [isSending, setIsSending] = useState(false);
  const [isWebSpeechActive, setIsWebSpeechActive] = useState(false);
  
  // Initialize ElevenLabs TTS
  const elevenLabs = useElevenLabs({
    apiKey: ELEVENLABS_CONFIG.API_KEY,
    voiceId: ELEVENLABS_CONFIG.DEFAULT_VOICE_ID,
    modelId: ELEVENLABS_CONFIG.MODELS.MONOLINGUAL
  });

  // Initialize Conversation AI
  const conversationAI = useConversationAI();

  // Add welcome message on first load
  useEffect(() => {
    if (messageHistory.length === 0 && isConnected) {
      setMessageHistory([{ text: "Hi doctor.", type: 'avatar' }]);
    }
  }, [isConnected, messageHistory.length]);

  const handleSendMessage = async () => {
    if (!message.trim() || !isConnected || isSending) return;
    
    setIsSending(true);
    try {
      // Generate AI response first
      const aiResponse = conversationAI.generateResponse(message.trim());
      console.log('🤖 AI Response:', aiResponse);
      
      // Add user message to history
      setMessageHistory(prev => [...prev, { text: message.trim(), type: 'user' }]);
      
      // Add AI response to history
      setMessageHistory(prev => [...prev, { text: aiResponse.response, type: 'avatar' }]);
      
      // Try ElevenLabs TTS for the AI response
      const result = await elevenLabs.speak(aiResponse.response);
      
      if (result.success) {
        console.log('✅ TTS Success with ElevenLabs');
      } else {
        console.error("❌ TTS failed with ElevenLabs, trying Web Speech API...", result.error);
        // Fallback to Web Speech API
        await speakWithWebSpeech(aiResponse.response);
      }
      
      // If external message handler exists, call it too
      if (onSendMessage) {
        await onSendMessage(message.trim());
      }
      
      setMessage(""); // Clear input after sending
    } catch (error) {
      console.error("💥 TTS error with ElevenLabs, trying Web Speech API...", error);
      // Fallback to Web Speech API
      try {
        // Generate AI response again in case of error
        const aiResponse = conversationAI.generateResponse(message.trim());
        await speakWithWebSpeech(aiResponse.response);
      } catch (webSpeechError) {
        console.error("💥 Web Speech API also failed:", webSpeechError);
      }
      
      // If external message handler exists, call it too
      if (onSendMessage) {
        await onSendMessage(message.trim());
      }
      
      setMessage(""); // Clear input after sending
    } finally {
      setIsSending(false);
    }
  };

  const speakWithWebSpeech = (text: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 1;
        
        utterance.onstart = () => {
          console.log('✅ Web Speech API Started!');
          setIsWebSpeechActive(true);
        };
        
        utterance.onend = () => {
          console.log('✅ Web Speech API Finished!');
          setIsWebSpeechActive(false);
          resolve();
        };
        
        utterance.onerror = (event) => {
          console.error('❌ Web Speech API Error:', event);
          setIsWebSpeechActive(false);
          reject(new Error(`Web Speech Error: ${event.error}`));
        };
        
        speechSynthesis.speak(utterance);
      } else {
        reject(new Error('Web Speech API not supported in this browser'));
      }
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className={`bg-gradient-to-br from-gray-800/90 via-gray-900/95 to-black rounded-2xl border border-gray-600/50 shadow-2xl overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 px-6 py-4 border-b border-gray-600/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white text-lg">🎭</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{title}</h3>
              <p className="text-sm text-gray-300">{description}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Status Indicator */}
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
              isConnected 
                ? 'bg-green-600/20 text-green-400 border border-green-500/30' 
                : 'bg-gray-600/20 text-gray-400 border border-gray-500/30'
            }`}>
              {isConnected ? '🟢 Connected' : '⚪ Disconnected'}
            </div>
            
            {/* TTS Status */}
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
              elevenLabs.isPlaying 
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' 
                : isWebSpeechActive
                ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30'
                : 'bg-gray-600/20 text-gray-400 border border-gray-500/30'
            }`}>
              {elevenLabs.isPlaying ? '🔊 ElevenLabs' : isWebSpeechActive ? '🔊 Web Speech' : '🔇 Silent'}
            </div>
            
            {/* Settings Button */}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all"
              title="Settings"
            >
              ⚙️
            </button>
            
            {/* Info Button */}
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all"
              title="Show Info"
            >
              ℹ️
            </button>
            
            {/* Clear Conversation Button */}
            {messageHistory.length > 0 && (
              <button
                onClick={() => {
                  setMessageHistory([]);
                  conversationAI.clearMemory();
                }}
                className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-all"
                title="Clear Conversation"
              >
                🗑️
              </button>
            )}
            
            {/* Expand Button */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all"
              title={isExpanded ? "Collapse" : "Expand"}
            >
              {isExpanded ? '📉' : '📈'}
            </button>
          </div>
        </div>
      </div>

             {/* Info Panel */}
       {showInfo && (
         <div className="bg-gray-800/50 px-6 py-4 border-b border-gray-600/50">
           <div className="grid grid-cols-2 gap-4 text-sm">
             <div>
               <span className="text-gray-400">Model:</span>
               <span className="ml-2 text-white font-medium">GLB 3D Model</span>
             </div>
             <div>
               <span className="text-gray-400">Format:</span>
               <span className="ml-2 text-white font-medium">GLTF/GLB</span>
             </div>
             <div>
               <span className="text-gray-400">Animation:</span>
               <span className="ml-2 text-white font-medium">Real-time</span>
             </div>
             <div>
               <span className="text-gray-400">Sync:</span>
               <span className="ml-2 text-white font-medium">Avatar State</span>
             </div>
           </div>
         </div>
       )}

               {/* Settings Panel */}
        {showSettings && (
          <div className="bg-gray-800/50 px-6 py-4 border-b border-gray-600/50">
            <div className="space-y-4">
              <h4 className="text-white font-medium">Patient Information</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Name:</span>
                  <span className="ml-2 text-white font-medium">Mariem</span>
                </div>
                <div>
                  <span className="text-gray-400">Age:</span>
                  <span className="ml-2 text-white font-medium">45 years</span>
                </div>
                <div>
                  <span className="text-gray-400">Location:</span>
                  <span className="ml-2 text-white font-medium">UAE</span>
                </div>
                <div>
                  <span className="text-gray-400">Condition:</span>
                  <span className="ml-2 text-white font-medium">Skin Issues</span>
                </div>
                <div>
                  <span className="text-gray-400">Current Mood:</span>
                  <span className="ml-2 text-white font-medium capitalize">{conversationAI.memory.mood}</span>
                </div>
                <div>
                  <span className="text-gray-400">Topics Discussed:</span>
                  <span className="ml-2 text-white font-medium">
                    {conversationAI.memory.topics.length} topics
                  </span>
                </div>
              </div>
              <div className="pt-2">
                <button
                  onClick={() => {
                    setMessageHistory([]);
                    conversationAI.clearMemory();
                  }}
                  className="px-3 py-1 bg-red-600/20 text-red-400 border border-red-500/30 rounded text-xs hover:bg-red-600/30 transition-all"
                >
                  Reset Patient Session
                </button>
              </div>
            </div>
          </div>
        )}

             {/* 3D Avatar Container */}
       <div className={`relative transition-all duration-300 ${
         isExpanded ? 'h-[700px]' : 'h-[500px]'
       }`}>
         
         {/* Conversation History Overlay */}
         {messageHistory.length > 0 && (
           <div className="absolute top-4 left-4 right-4 max-h-32 overflow-y-auto bg-black/70 backdrop-blur-sm rounded-lg p-3 border border-gray-600/50">
             <div className="space-y-2">
               {messageHistory.slice(-4).map((msg, index) => (
                 <div key={index} className={`text-xs ${
                   msg.type === 'user' 
                     ? 'text-blue-300 text-right' 
                     : 'text-green-300 text-left'
                 }`}>
                   <span className="font-medium">
                     {msg.type === 'user' ? 'You' : 'Mariem'}: 
                   </span>
                   <span className="ml-2">{msg.text}</span>
                 </div>
               ))}
             </div>
           </div>
         )}
        <ThreeDAvatar
          isTalking={isTalking}
          isConnected={isConnected}
          className="w-full h-full"
        />
        
        {/* Overlay Controls */}
        {showControls && (
          <div className="absolute bottom-4 right-4 flex gap-2">
            <button
              className="p-2 bg-black/70 text-white rounded-lg hover:bg-black/90 transition-all"
              title="Reset Camera"
              onClick={() => {
                // This would reset the camera in the 3D scene
                console.log('Reset camera');
              }}
            >
              🔄
            </button>
            <button
              className="p-2 bg-black/70 text-white rounded-lg hover:bg-black/90 transition-all"
              title="Take Screenshot"
              onClick={() => {
                // This would capture the 3D scene
                console.log('Take screenshot');
              }}
            >
              📸
            </button>
          </div>
        )}
      </div>

      {/* Text Chat Bar */}
      {showTextChat && (
        <div className="bg-gray-800/50 px-6 py-4 border-t border-gray-600/50">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Input
                value={message}
                onChange={setMessage}
                                 placeholder={isConnected ? "Ask Mariem about her symptoms..." : "Connect to start the consultation"}
                onKeyPress={handleKeyPress}
                disabled={!isConnected || isSending}
                className="w-full pr-20"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                {isSending && (
                  <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                )}
                <span className="text-xs text-gray-400">
                  {message.length}/500
                </span>
              </div>
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={!message.trim() || !isConnected || isSending}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                !message.trim() || !isConnected || isSending
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
              }`}
            >
              {isSending ? '⏳' : '📤'}
            </Button>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="bg-gray-800/50 px-6 py-3 border-t border-gray-600/50">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <span className="text-gray-400">Status:</span>
            <span className={`font-medium ${
              isTalking ? 'text-blue-400' : 'text-gray-300'
            }`}>
              {isTalking ? '🗣️ Talking' : '🤐 Silent'}
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-gray-400">
            <span>🎮 Mouse: Rotate | Scroll: Zoom</span>
          </div>
        </div>
      </div>
    </div>
  );
};
