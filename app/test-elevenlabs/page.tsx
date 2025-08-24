'use client';

import { useState, useEffect } from 'react';
import { useElevenLabs } from '@/components/logic/useElevenLabs';
import { ELEVENLABS_CONFIG } from '@/app/lib/elevenlabs-config';

export default function TestElevenLabsPage() {
  const [testMessage, setTestMessage] = useState("Hello! This is a test.");
  const [apiStatus, setApiStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [debugInfo, setDebugInfo] = useState<any>({});

  const elevenLabs = useElevenLabs({
    apiKey: ELEVENLABS_CONFIG.API_KEY,
    voiceId: ELEVENLABS_CONFIG.DEFAULT_VOICE_ID,
    modelId: ELEVENLABS_CONFIG.MODELS.MONOLINGUAL
  });

  // Debug environment variables on component mount
  useEffect(() => {
    const debug = {
      hasKey: !!ELEVENLABS_CONFIG.API_KEY,
      keyLength: ELEVENLABS_CONFIG.API_KEY?.length || 0,
      keyPreview: ELEVENLABS_CONFIG.API_KEY?.substring(0, 10) + '...' || 'none',
      envVar: process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY ? 'found' : 'missing',
      fullKey: ELEVENLABS_CONFIG.API_KEY || 'none',
      configSource: 'ELEVENLABS_CONFIG.API_KEY',
      timestamp: new Date().toISOString()
    };
    
    console.log('🔍 Environment Debug:', debug);
    setDebugInfo(debug);
  }, []);

  const testAPI = async () => {
    if (!testMessage.trim()) return;
    
    setApiStatus('testing');
    setErrorMessage('');
    
    try {
      console.log('🚀 Testing API with key:', ELEVENLABS_CONFIG.API_KEY?.substring(0, 10) + '...');
      
      const result = await elevenLabs.speak(testMessage);
      
      if (result.success) {
        setApiStatus('success');
        console.log('✅ TTS Success!');
      } else {
        setApiStatus('error');
        setErrorMessage(result.error || 'Unknown error occurred');
        console.error('❌ TTS Failed:', result.error);
      }
    } catch (error) {
      setApiStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error');
      console.error('💥 TTS Exception:', error);
    }
  };

  const testDirectAPI = async () => {
    if (!testMessage.trim()) return;
    
    setApiStatus('testing');
    setErrorMessage('');
    
    try {
      console.log('🔍 Testing ElevenLabs API directly...');
      
      const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM', {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_CONFIG.API_KEY || ''
        },
        body: JSON.stringify({
          text: testMessage,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5
          }
        })
      });
      
      console.log('📡 Direct API Response:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });
      
      if (response.ok) {
        const audioBlob = await response.blob();
        console.log('✅ Direct API Success! Audio size:', audioBlob.size, 'bytes');
        setApiStatus('success');
        setErrorMessage('');
        
        // Play the audio
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.play();
      } else {
        const errorText = await response.text();
        console.error('❌ Direct API Failed:', response.status, errorText);
        setApiStatus('error');
        setErrorMessage(`Direct API Error: ${response.status} ${response.statusText} - ${errorText}`);
      }
    } catch (error) {
      console.error('💥 Direct API Exception:', error);
      setApiStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const testWebSpeechAPI = async () => {
    if (!testMessage.trim()) return;
    
    setApiStatus('testing');
    setErrorMessage('');
    
    try {
      console.log('🎤 Testing Web Speech API...');
      
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(testMessage);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 1;
        
        utterance.onstart = () => {
          console.log('✅ Web Speech API Started!');
          setApiStatus('success');
          setErrorMessage('');
        };
        
        utterance.onend = () => {
          console.log('✅ Web Speech API Finished!');
        };
        
        utterance.onerror = (event) => {
          console.error('❌ Web Speech API Error:', event);
          setApiStatus('error');
          setErrorMessage(`Web Speech Error: ${event.error}`);
        };
        
        speechSynthesis.speak(utterance);
      } else {
        throw new Error('Web Speech API not supported in this browser');
      }
    } catch (error) {
      console.error('💥 Web Speech API Exception:', error);
      setApiStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const checkAPIKey = () => {
    return ELEVENLABS_CONFIG.API_KEY && ELEVENLABS_CONFIG.API_KEY.length > 0;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            🎤 ElevenLabs API Test
          </h1>
          <p className="text-lg text-gray-300">
            Simple test to check if your API key is working
          </p>
        </div>

        {/* Debug Information */}
        <div className="mb-6 p-6 bg-gray-800/50 rounded-lg border border-gray-600/50">
          <h3 className="text-xl font-semibold text-white mb-4">🔍 Debug Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Has API Key:</span>
                <span className={debugInfo.hasKey ? 'text-green-400' : 'text-red-400'}>
                  {debugInfo.hasKey ? '✅ Yes' : '❌ No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Key Length:</span>
                <span className="text-white">{debugInfo.keyLength}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Key Preview:</span>
                <span className="text-white font-mono">{debugInfo.keyPreview}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Environment Var:</span>
                <span className={debugInfo.envVar === 'found' ? 'text-green-400' : 'text-red-400'}>
                  {debugInfo.envVar === 'found' ? '✅ Found' : '❌ Missing'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Config Source:</span>
                <span className="text-white">{debugInfo.configSource}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Timestamp:</span>
                <span className="text-white text-xs">{debugInfo.timestamp}</span>
              </div>
            </div>
          </div>
        </div>

        {/* API Key Status */}
        <div className="mb-6 p-6 rounded-lg border">
          <h3 className="text-xl font-semibold text-white mb-4">🔑 API Key Status</h3>
          <div className={`text-center p-4 rounded-lg ${
            checkAPIKey() ? 'bg-green-900/30 border border-green-600/30' : 'bg-red-900/30 border border-red-600/30'
          }`}>
            {checkAPIKey() ? (
              <div className="text-green-400">
                <div className="text-2xl mb-2">✅ API Key Found</div>
                <div className="text-sm text-gray-300">
                  Key: <span className="font-mono">{ELEVENLABS_CONFIG.API_KEY.substring(0, 15)}...</span>
                </div>
              </div>
            ) : (
              <div className="text-red-400">
                <div className="text-2xl mb-2">❌ API Key Missing</div>
                <div className="text-sm text-gray-300">
                  Check your .env file and restart the server
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Test Message */}
        <div className="mb-6 p-6 bg-gray-800/50 rounded-lg border border-gray-600/50">
          <h3 className="text-xl font-semibold text-white mb-4">📝 Test Message</h3>
          <textarea
            value={testMessage}
            onChange={(e) => setTestMessage(e.target.value)}
            className="w-full h-20 bg-gray-700 text-white rounded-lg p-4 border border-gray-600 focus:border-blue-500 focus:outline-none resize-none text-center text-lg"
            placeholder="Type a message to test..."
            maxLength={200}
          />
          <div className="flex justify-center gap-3 mt-4 flex-wrap">
            <button
              onClick={testAPI}
              disabled={!checkAPIKey() || !testMessage.trim() || elevenLabs.isLoading}
              className={`px-4 py-3 rounded-lg font-bold text-lg transition-all ${
                !checkAPIKey() || !testMessage.trim() || elevenLabs.isLoading
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
              }`}
            >
              {elevenLabs.isLoading ? '⏳ Testing...' : '🎤 Test Hook'}
            </button>
            
            <button
              onClick={testDirectAPI}
              disabled={!checkAPIKey() || !testMessage.trim() || apiStatus === 'testing'}
              className={`px-4 py-3 rounded-lg font-bold text-lg transition-all ${
                !checkAPIKey() || !testMessage.trim() || apiStatus === 'testing'
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700 active:scale-95'
              }`}
            >
              {apiStatus === 'testing' ? '⏳ Testing...' : '🔍 Test Direct API'}
            </button>

            <button
              onClick={testWebSpeechAPI}
              disabled={!testMessage.trim() || apiStatus === 'testing'}
              className={`px-4 py-3 rounded-lg font-bold text-lg transition-all ${
                !testMessage.trim() || apiStatus === 'testing'
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-purple-600 text-white hover:bg-purple-700 active:scale-95'
              }`}
            >
              {apiStatus === 'testing' ? '⏳ Testing...' : '🌐 Test Web Speech'}
            </button>
          </div>
        </div>

        {/* Status Display */}
        <div className="mb-6 p-6 bg-gray-800/50 rounded-lg border border-gray-600/50">
          <h3 className="text-xl font-semibold text-white mb-4">📊 Test Status</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className={`p-4 rounded-lg text-center ${
              elevenLabs.isLoading ? 'bg-yellow-900/30 border border-yellow-600/30' : 'bg-gray-700/50'
            }`}>
              <div className="text-yellow-400 font-bold text-lg">Loading</div>
              <div className="text-sm text-gray-300">
                {elevenLabs.isLoading ? '⏳ Processing...' : '⚪ Idle'}
              </div>
            </div>
            
            <div className={`p-4 rounded-lg text-center ${
              elevenLabs.isPlaying ? 'bg-blue-900/30 border border-blue-600/30' : 'bg-gray-700/50'
            }`}>
              <div className="text-blue-400 font-bold text-lg">Playing</div>
              <div className="text-sm text-gray-300">
                {elevenLabs.isPlaying ? '🔊 Speaking...' : '🔇 Silent'}
              </div>
            </div>
            
            <div className={`p-4 rounded-lg text-center ${
              apiStatus === 'success' ? 'bg-green-900/30 border border-green-600/30' :
              apiStatus === 'error' ? 'bg-red-900/30 border border-red-600/30' :
              'bg-gray-700/50'
            }`}>
              <div className={`font-bold text-lg ${
                apiStatus === 'success' ? 'text-green-400' :
                apiStatus === 'error' ? 'text-red-400' :
                'text-gray-400'
              }`}>
                Status
              </div>
              <div className="text-sm text-gray-300">
                {apiStatus === 'success' && '✅ Success'}
                {apiStatus === 'error' && '❌ Error'}
                {apiStatus === 'testing' && '⏳ Testing'}
                {apiStatus === 'idle' && '⚪ Ready'}
              </div>
            </div>
          </div>

          {errorMessage && (
            <div className="p-4 bg-red-900/30 border border-red-600/30 rounded-lg">
              <div className="text-red-400 font-bold mb-2">❌ Error Details:</div>
              <div className="text-red-300 font-mono text-sm">{errorMessage}</div>
            </div>
          )}
        </div>

        {/* Setup Instructions */}
        {!checkAPIKey() && (
          <div className="p-6 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
            <h3 className="text-xl font-semibold text-yellow-400 mb-4">📋 Setup Required</h3>
            <div className="space-y-3 text-gray-300">
              <p className="text-lg">To fix the API key issue:</p>
              <ol className="list-decimal list-inside space-y-2 ml-4 text-sm">
                <li>Create a <code className="bg-gray-800 px-2 py-1 rounded">.env</code> file in your project root</li>
                <li>Add this line: <code className="bg-gray-800 px-2 py-1 rounded text-green-400">NEXT_PUBLIC_ELEVENLABS_API_KEY=your_new_api_key</code></li>
                <li>Save the file and restart the dev server</li>
                <li>Refresh this page</li>
              </ol>
            </div>
          </div>
        )}

        {/* Permission Error Help */}
        {errorMessage && errorMessage.includes('missing_permissions') && (
          <div className="p-6 bg-red-900/20 border border-red-600/30 rounded-lg">
            <h3 className="text-xl font-semibold text-red-400 mb-4">🚨 Permission Issue Detected</h3>
            <div className="space-y-3 text-gray-300">
              <p className="text-lg">Your API key is missing the <code className="bg-gray-800 px-2 py-1 rounded">text_to_speech</code> permission.</p>
              <div className="bg-gray-800/50 p-4 rounded-lg">
                <h4 className="font-semibold text-white mb-2">🔧 How to Fix:</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Go to <a href="https://elevenlabs.io/" target="_blank" className="text-blue-400 hover:underline">https://elevenlabs.io/</a></li>
                  <li>Log in to your account</li>
                  <li>Check <strong>Profile → Subscription</strong> for your tier</li>
                  <li>Go to <strong>Profile → API Key</strong></li>
                  <li><strong>Delete the current key</strong> and generate a new one</li>
                  <li>Update your <code className="bg-gray-700 px-1 rounded">.env</code> file with the new key</li>
                  <li>Restart the dev server and test again</li>
                </ol>
              </div>
              <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-600/30">
                <h4 className="font-semibold text-blue-400 mb-2">💡 Why This Happens:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Free accounts may have limited permissions</li>
                  <li>Account not fully verified or activated</li>
                  <li>Billing or payment method issues</li>
                  <li>API key generated before permissions were granted</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
