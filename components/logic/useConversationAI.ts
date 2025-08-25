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

  // Generate contextual responses based on doctor's questions
  const generateResponse = useCallback((userMessage: string): ConversationAIResponse => {
    const message = userMessage.toLowerCase().trim();
    const now = new Date();
    
    // Debug: Log the incoming message
    console.log('🔍 Processing message:', message);
    
    // Update memory
    setMemory(prev => ({
      ...prev,
      userMessages: [...prev.userMessages, userMessage],
      lastInteraction: now
    }));

    // Simple greetings - Mariem just says hi and waits for doctor to ask questions
    if (message.includes('hi') || message.includes('hello') || message.includes('hey')) {
      const response = "Hi doctor.";
      
      setMemory(prev => ({
        ...prev,
        avatarResponses: [...prev.avatarResponses, response],
        topics: [...prev.topics, 'greeting'],
        hasSharedSymptoms: false
      }));

      return {
        response,
        mood: 'anxious',
        shouldAnimate: true,
        animationType: 'concerned'
      };
    }

    // Use the knowledge base to find the best answer
    console.log('🔍 Looking up answer in knowledge base...');
    const response = findBestAnswer(userMessage);
    console.log('✅ Found answer:', response.substring(0, 50) + '...');
    
    // Determine mood based on response content
    let mood = 'worried';
    if (response.includes('hope') || response.includes('relief')) {
      mood = 'hopeful';
    } else if (response.includes('frustrated') || response.includes('embarrassed')) {
      mood = 'frustrated';
    } else if (response.includes('worried') || response.includes('concerned')) {
      mood = 'worried';
    }
    
    setMemory(prev => ({
      ...prev,
      avatarResponses: [...prev.avatarResponses, response],
      topics: [...prev.topics, 'knowledge_base_response']
    }));

    return {
      response,
      mood,
      shouldAnimate: true,
      animationType: 'think'
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
