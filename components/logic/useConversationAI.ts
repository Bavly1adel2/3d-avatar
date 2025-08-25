import { useState, useCallback } from 'react';
import { ANN_THERAPIST_QA } from '../../app/lib/ann-therapist-qa';
import { findBestAnswer } from '../../app/lib/mariem-knowledge-base';

interface ConversationMemory {
  userMessages: string[];
  avatarResponses: string[];
  topics: string[];
  mood: 'anxious' | 'worried' | 'frustrated' | 'hopeful' | 'relieved' | 'concerned';
  lastInteraction: Date;
  hasSharedSymptoms: boolean;
}

interface ConversationAIResponse {
  response: string;
  mood: string;
  shouldAnimate: boolean;
  animationType?: 'wave' | 'nod' | 'think' | 'concerned';
}

const MAX_MEMORY_SIZE = 50; // Limit memory arrays to prevent memory leaks

export const useConversationAI = () => {
  const [memory, setMemory] = useState<ConversationMemory>({
    userMessages: [],
    avatarResponses: [],
    topics: [],
    mood: 'anxious',
    lastInteraction: new Date(),
    hasSharedSymptoms: false
  });

  // Mariem's personality as a patient (like Maren from ANN system)
  const patientPersonality = {
    name: 'Mariem',
    age: 45,
    location: 'United Arab Emirates',
    condition: 'skin issues (dry, itchy, red, inflamed skin on arms and neck)',
    traits: ['anxious', 'concerned', 'frustrated', 'hopeful', 'genuine', 'vulnerable'],
    emotionalState: 'worried about skin condition affecting daily life and sleep'
  };

  // Helper function to limit array size
  const limitArraySize = (arr: string[], maxSize: number) => {
    return arr.length > maxSize ? arr.slice(-maxSize) : arr;
  };

  // Helper function to determine mood from response content
  const determineMood = (response: string): ConversationMemory['mood'] => {
    const lowerResponse = response.toLowerCase();
    
    if (lowerResponse.includes('hope') || lowerResponse.includes('relief') || lowerResponse.includes('better')) {
      return 'hopeful';
    } else if (lowerResponse.includes('frustrated') || lowerResponse.includes('embarrassed') || lowerResponse.includes('angry')) {
      return 'frustrated';
    } else if (lowerResponse.includes('worried') || lowerResponse.includes('concerned') || lowerResponse.includes('scared')) {
      return 'worried';
    } else if (lowerResponse.includes('relieved') || lowerResponse.includes('thankful')) {
      return 'relieved';
    } else if (lowerResponse.includes('anxious') || lowerResponse.includes('nervous')) {
      return 'anxious';
    }
    
    return 'concerned'; // default mood
  };

  // Generate contextual responses based on doctor's questions
  const generateResponse = useCallback((userMessage: string): ConversationAIResponse => {
    const message = userMessage.toLowerCase().trim();
    const now = new Date();
    
    // Debug: Log the incoming message
    console.log('🔍 Processing message:', message);
    
    let response: string;
    let mood: ConversationMemory['mood'] = 'concerned';
    let animationType: ConversationAIResponse['animationType'] = 'think';
    let topic = 'general';

    // Simple greetings - Mariem just says hi and waits for doctor to ask questions
    if (message.includes('hi') || message.includes('hello') || message.includes('hey')) {
      response = "Hi doctor.";
      mood = 'anxious';
      animationType = 'concerned';
      topic = 'greeting';
    } else {
      // Use the knowledge base to find the best answer
      try {
        console.log('🔍 Looking up answer in knowledge base...');
        response = findBestAnswer(userMessage);
        console.log('✅ Found answer:', response.substring(0, 50) + '...');
        
        mood = determineMood(response);
        topic = 'knowledge_base_response';
      } catch (error) {
        console.error('❌ Error finding answer:', error);
        response = "I'm sorry, I didn't understand that. Could you please repeat your question?";
        mood = 'worried';
        animationType = 'concerned';
        topic = 'error';
      }
    }

    // Update memory in a single operation to prevent race conditions
    setMemory(prev => {
      const newUserMessages = limitArraySize([...prev.userMessages, userMessage], MAX_MEMORY_SIZE);
      const newAvatarResponses = limitArraySize([...prev.avatarResponses, response], MAX_MEMORY_SIZE);
      const newTopics = limitArraySize([...prev.topics, topic], MAX_MEMORY_SIZE);
      
      return {
        ...prev,
        userMessages: newUserMessages,
        avatarResponses: newAvatarResponses,
        topics: newTopics,
        mood,
        lastInteraction: now,
        hasSharedSymptoms: prev.hasSharedSymptoms || message.includes('symptom') || message.includes('condition')
      };
    });

    return {
      response,
      mood,
      shouldAnimate: true,
      animationType
    };
  }, []);

  // Get conversation history
  const getConversationHistory = useCallback(() => {
    return memory;
  }, [memory]);

  // Clear conversation memory
  const clearMemory = useCallback(() => {
    setMemory({
      userMessages: [],
      avatarResponses: [],
      topics: [],
      mood: 'anxious',
      lastInteraction: new Date(),
      hasSharedSymptoms: false
    });
  }, []);

  return {
    generateResponse,
    getConversationHistory,
    clearMemory,
    memory
  };
};
