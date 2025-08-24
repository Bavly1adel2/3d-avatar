import { useState, useCallback } from 'react';
import { ANN_THERAPIST_QA } from '../../app/lib/ann-therapist-qa';

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

    // Doctor asking about the problem
    if (message.includes('problem') || message.includes('issue') || message.includes('symptom') || message.includes('what') && message.includes('wrong')) {
      const response = ANN_THERAPIST_QA.initial_greeting.answer;
      
      setMemory(prev => ({
        ...prev,
        avatarResponses: [...prev.avatarResponses, response],
        topics: [...prev.topics, 'symptoms']
      }));

      return {
        response,
        mood: 'worried',
        shouldAnimate: true,
        animationType: 'concerned'
      };
    }

    // Doctor asking for more symptom details
    if (message.includes('detail') || message.includes('more') || message.includes('describe') || message.includes('when')) {
      const response = ANN_THERAPIST_QA.symptom_details.answer;
      
      setMemory(prev => ({
        ...prev,
        avatarResponses: [...prev.avatarResponses, response],
        topics: [...prev.topics, 'symptom_details']
      }));

      return {
        response,
        mood: 'frustrated',
        shouldAnimate: true,
        animationType: 'think'
      };
    }

    // Doctor asking about family history
    if (message.includes('family') || message.includes('mother') || message.includes('asthma') || message.includes('allergy')) {
      const response = ANN_THERAPIST_QA.family_history.answer;
      
      setMemory(prev => ({
        ...prev,
        avatarResponses: [...prev.avatarResponses, response],
        topics: [...prev.topics, 'family_history']
      }));

      return {
        response,
        mood: 'concerned',
        shouldAnimate: true,
        animationType: 'think'
      };
    }

    // Doctor asking about previous experience
    if (message.includes('before') || message.includes('previous') || message.includes('past') || message.includes('experience')) {
      const response = ANN_THERAPIST_QA.previous_experience.answer;
      
      setMemory(prev => ({
        ...prev,
        avatarResponses: [...prev.avatarResponses, response],
        topics: [...prev.topics, 'previous_experience']
      }));

      return {
        response,
        mood: 'frustrated',
        shouldAnimate: true,
        animationType: 'think'
      };
    }

    // Doctor asking about treatment concerns
    if (message.includes('treatment') || message.includes('concern') || message.includes('steroid') || message.includes('side effect')) {
      const response = ANN_THERAPIST_QA.treatment_concerns.answer;
      
      setMemory(prev => ({
        ...prev,
        avatarResponses: [...prev.avatarResponses, response],
        topics: [...prev.topics, 'treatment_concerns']
      }));

      return {
        response,
        mood: 'worried',
        shouldAnimate: true,
        animationType: 'concerned'
      };
    }

    // Doctor asking about long-term outlook
    if (message.includes('long') || message.includes('forever') || message.includes('manage') || message.includes('go away')) {
      const response = ANN_THERAPIST_QA.long_term_outlook.answer;
      
      setMemory(prev => ({
        ...prev,
        avatarResponses: [...prev.avatarResponses, response],
        topics: [...prev.topics, 'long_term_outlook']
      }));

      return {
        response,
        mood: 'worried',
        shouldAnimate: true,
        animationType: 'concerned'
      };
    }

    // Doctor asking about symptom description
    if (message.includes('skin') || message.includes('itch') || message.includes('dry') || message.includes('red')) {
      const response = ANN_THERAPIST_QA.symptom_description.answer;
      
      setMemory(prev => ({
        ...prev,
        avatarResponses: [...prev.avatarResponses, response],
        topics: [...prev.topics, 'symptom_description']
      }));

      return {
        response,
        mood: 'frustrated',
        shouldAnimate: true,
        animationType: 'concerned'
      };
    }

    // Doctor asking about treatment attempts
    if (message.includes('try') || message.includes('cream') || message.includes('moisturize') || message.includes('over the counter')) {
      const response = ANN_THERAPIST_QA.treatment_attempts.answer;
      
      setMemory(prev => ({
        ...prev,
        avatarResponses: [...prev.avatarResponses, response],
        topics: [...prev.topics, 'treatment_attempts']
      }));

      return {
        response,
        mood: 'frustrated',
        shouldAnimate: true,
        animationType: 'think'
      };
    }

    // Doctor asking about symptom progression
    if (message.includes('worse') || message.includes('progress') || message.includes('change') || message.includes('start')) {
      const response = ANN_THERAPIST_QA.symptom_progression.answer;
      
      setMemory(prev => ({
        ...prev,
        avatarResponses: [...prev.avatarResponses, response],
        topics: [...prev.topics, 'symptom_progression']
      }));

      return {
        response,
        mood: 'worried',
        shouldAnimate: true,
        animationType: 'concerned'
      };
    }

    // Doctor asking about impact on life
    if (message.includes('affect') || message.includes('daily') || message.includes('life') || message.includes('sleep')) {
      const response = ANN_THERAPIST_QA.impact_on_life.answer;
      
      setMemory(prev => ({
        ...prev,
        avatarResponses: [...prev.avatarResponses, response],
        topics: [...prev.topics, 'impact_on_life']
      }));

      return {
        response,
        mood: 'frustrated',
        shouldAnimate: true,
        animationType: 'think'
      };
    }

    // Doctor asking about emotional impact
    if (message.includes('emotional') || message.includes('feel') || message.includes('self conscious') || message.includes('embarrass')) {
      const response = ANN_THERAPIST_QA.emotional_impact.answer;
      
      setMemory(prev => ({
        ...prev,
        avatarResponses: [...prev.avatarResponses, response],
        topics: [...prev.topics, 'emotional_impact']
      }));

      return {
        response,
        mood: 'concerned',
        shouldAnimate: true,
        animationType: 'concerned'
      };
    }

    // Doctor asking about sleep issues
    if (message.includes('sleep') || message.includes('night') || message.includes('wake') || message.includes('rest')) {
      const response = ANN_THERAPIST_QA.sleep_issues.answer;
      
      setMemory(prev => ({
        ...prev,
        avatarResponses: [...prev.avatarResponses, response],
        topics: [...prev.topics, 'sleep_issues']
      }));

      return {
        response,
        mood: 'frustrated',
        shouldAnimate: true,
        animationType: 'think'
      };
    }

    // Doctor asking about clothing concerns
    if (message.includes('clothing') || message.includes('clothes') || message.includes('sleeve') || message.includes('cover')) {
      const response = ANN_THERAPIST_QA.clothing_concerns.answer;
      
      setMemory(prev => ({
        ...prev,
        avatarResponses: [...prev.avatarResponses, response],
        topics: [...prev.topics, 'clothing_concerns']
      }));

      return {
        response,
        mood: 'embarrassed',
        shouldAnimate: true,
        animationType: 'concerned'
      };
    }

    // Doctor asking about hopes for relief
    if (message.includes('hope') || message.includes('want') || message.includes('relief') || message.includes('help')) {
      const response = ANN_THERAPIST_QA.hope_for_relief.answer;
      
      setMemory(prev => ({
        ...prev,
        avatarResponses: [...prev.avatarResponses, response],
        topics: [...prev.topics, 'hope_for_relief']
      }));

      return {
        response,
        mood: 'hopeful',
        shouldAnimate: true,
        animationType: 'think'
      };
    }

    // Doctor giving diagnosis or treatment plan
    if (message.includes('diagnosis') || message.includes('eczema') || message.includes('atopic') || message.includes('dermatitis') || message.includes('treatment') || message.includes('plan')) {
      const response = ANN_THERAPIST_QA.relief_expression.answer;
      
      setMemory(prev => ({
        ...prev,
        avatarResponses: [...prev.avatarResponses, response],
        topics: [...prev.topics, 'relief']
      }));

      return {
        response,
        mood: 'relieved',
        shouldAnimate: true,
        animationType: 'nod'
      };
    }

    // Doctor asking general questions - Mariem responds as a concerned patient
    if (message.includes('how') || message.includes('what') || message.includes('why') || message.includes('when')) {
      const responses = [
        "I'm really not sure, doctor. That's why I came to see you - I need your help to figure this out.",
        "I've been wondering the same thing. I'm so frustrated because I can't seem to get any relief.",
        "I'm really hoping you can help me understand what's happening. I'm worried about this getting worse.",
        "I'm not a medical expert, so I really need your guidance. This has been so stressful for me."
      ];
      
      const response = responses[Math.floor(Math.random() * responses.length)];
      
      setMemory(prev => ({
        ...prev,
        avatarResponses: [...prev.avatarResponses, response],
        topics: [...prev.topics, 'general_concern']
      }));

      return {
        response,
        mood: 'worried',
        shouldAnimate: true,
        animationType: 'think'
      };
    }

    // Default responses - Mariem acts as a concerned patient
    const defaultResponses = [
      "I'm really not sure about that, doctor. I'm just so worried about my skin and I really need your help.",
      "I'm sorry, I don't understand. Could you explain that in simpler terms? I'm really anxious about all of this.",
      "I'm just so frustrated with this whole situation. I hope you can help me figure out what's going on.",
      "I'm really concerned about my skin condition. It's been affecting my life so much and I need answers.",
      "I'm not sure what you mean. I'm just a regular person dealing with these skin problems and I need your expertise.",
      "I'm really hoping you can help me understand this better. I'm so worried about what's happening to my skin."
    ];
    
    const response = defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
    
    setMemory(prev => ({
      ...prev,
      avatarResponses: [...prev.avatarResponses, response],
      topics: [...prev.topics, 'general_patient_concern']
    }));

    return {
      response,
      mood: 'worried',
      shouldAnimate: true,
      animationType: 'concerned'
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
