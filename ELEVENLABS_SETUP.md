# 🎤 ElevenLabs TTS Integration Setup

## 🚀 **Quick Start**

### 1. **Get ElevenLabs API Key**
- Visit: https://elevenlabs.io/
- Sign up for a free account
- Go to Profile → API Key
- Copy your API key

### 2. **Create Environment File**
Create `.env.local` in your project root:

```bash
# ElevenLabs API Configuration
NEXT_PUBLIC_ELEVENLABS_API_KEY=your_actual_api_key_here

# Optional: Choose a different voice
NEXT_PUBLIC_ELEVENLABS_VOICE_ID=21m00Tcm4TlvDq8ikWAM
```

### 3. **Popular Voice IDs**
```bash
# Female Voices
RACHEL: 21m00Tcm4TlvDq8ikWAM    # Clear, professional
DOMI: AZnzlk1XvdvUeBnXmlld      # Warm, friendly
BELLA: EXAVITQu4vr4xnSDxMaL     # Soft, gentle

# Male Voices
ANTONI: ErXwobaYiN1P8YdB9Qj     # Deep, authoritative
THOMAS: GBv7mTt0atIp3Br8iCZE    # Clear, professional
JOSH: TxGEqnHWrfWFTfGW9XjX      # Warm, friendly
ARNOLD: VR6AewLTigWG4xSOukaG    # Deep, strong
```

### 4. **Test the Integration**
1. Start your dev server: `npm run dev`
2. Visit: `/test-3d`
3. Type a message and click send
4. You should hear the avatar speak!

## 🔧 **How It Works**

### **Text-to-Speech Flow:**
1. **User types message** → Text input in 3D avatar card
2. **ElevenLabs API** → Converts text to speech
3. **Audio playback** → Plays through browser audio
4. **3D model sync** → Shows talking animation

### **Features:**
- ✅ **Real-time TTS** with ElevenLabs quality
- ✅ **Multiple voice options** (change in config)
- ✅ **Audio controls** (play, stop, volume)
- ✅ **Visual feedback** (speaking status, loading)
- ✅ **Error handling** (API failures, audio issues)

## 🎯 **Customization**

### **Change Voice:**
```typescript
// In .env.local
NEXT_PUBLIC_ELEVENLABS_VOICE_ID=AZnzlk1XvdvUeBnXmlld

// Or in code
const elevenLabs = useElevenLabs({
  apiKey: 'your_key',
  voiceId: 'AZnzlk1XvdvUeBnXmlld', // Domi voice
  modelId: 'eleven_monolingual_v1'
});
```

### **Voice Settings:**
```typescript
// Adjust voice characteristics
voice_settings: {
  stability: 0.7,        // 0-1: Higher = more stable
  similarity_boost: 0.8, // 0-1: Higher = more similar to original
  style: 0.3,            // 0-1: Higher = more expressive
  use_speaker_boost: true
}
```

## 🆓 **Free Tier Limits**

- **10,000 characters per month**
- **Perfect for testing and development**
- **Upgrade for production use**

## 🐛 **Troubleshooting**

### **No Sound:**
1. Check API key in `.env.local`
2. Verify voice ID is valid
3. Check browser console for errors
4. Ensure audio permissions are granted

### **API Errors:**
1. Verify API key is correct
2. Check character limit (free tier: 10k/month)
3. Ensure voice ID exists in your account

### **Audio Issues:**
1. Check browser audio settings
2. Try different browsers (Chrome/Edge recommended)
3. Check system volume and audio drivers

## 🎉 **Enjoy Your Talking 3D Avatar!**

Your 3D model now speaks with ElevenLabs quality! 🎭🔊
