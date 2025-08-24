import React, { useRef, useEffect, useState, Suspense } from 'react';
import { Canvas, useLoader, useFrame } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls, Environment, PresentationControls } from '@react-three/drei';
import * as THREE from 'three';
import { ANN_THERAPIST_QA } from '../../app/lib/ann-therapist-qa';

/**
 * Enhanced 3D Avatar with Mariem Character System
 * Features:
 * - Mariem: 45-year-old patient with skin issues
 * - Much larger model size (10x scale) - centered on screen
 * - Lip-sync animation when talking
 * - Free camera controls (zoom in/out, pan, rotate)
 * - Character personality and conversation flow
 * - Integrated knowledge base for realistic responses
 */

interface ThreeDAvatarProps {
  isTalking: boolean;
  isConnected: boolean;
  className?: string;
}

// Mariem Character System
interface MariemCharacter {
  name: string;
  age: number;
  location: string;
  personality: {
    anxious: boolean;
    concerned: boolean;
    persistent: boolean;
    vulnerable: boolean;
  };
  symptoms: {
    skinCondition: string;
    duration: string;
    severity: string;
    triggers: string[];
    impact: string[];
  };
  familyHistory: string[];
  questions: string[];
  emotionalState: 'worried' | 'frustrated' | 'hopeful' | 'relieved' | 'neutral';
}

// Mariem Character Configuration
const MARIEM_CHARACTER: MariemCharacter = {
  name: "Mariem",
  age: 45,
  location: "United Arab Emirates",
  personality: {
    anxious: true,
    concerned: true,
    persistent: true,
    vulnerable: true,
  },
  symptoms: {
    skinCondition: "Dry, itchy, red, inflamed skin on arms and neck",
    duration: "A few months, getting progressively worse",
    severity: "Moderate to severe, affecting daily life",
    triggers: ["stress", "certain fabrics", "temperature changes"],
    impact: ["sleep disruption", "embarrassment", "daily activities affected", "itching at night"]
  },
  familyHistory: ["Mother has asthma", "Family history of allergies"],
  questions: [
    "What could be causing this?",
    "Is this something serious?",
    "How long will it take to get better?",
    "Are there things I should avoid?",
    "Will this come back?",
    "What can I do at home to help?"
  ],
  emotionalState: 'worried'
};

// 3D Model Component with Mariem Character and Lip-Sync
function AvatarModel({ isTalking, isConnected, onContinuousTalkingChange }: { 
  isTalking: boolean; 
  isConnected: boolean;
  onContinuousTalkingChange: (talking: boolean) => void;
}) {
  const modelRef = useRef<THREE.Group>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const headRef = useRef<THREE.Mesh | null>(null);
  const jawBoneRef = useRef<THREE.Bone | null>(null);
  const [mouthOpen, setMouthOpen] = useState(0);
  const [continuousTalking, setContinuousTalking] = useState(false);
  const talkingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastTalkingTimeRef = useRef<number>(0);

  // Load the GLTF model
  const gltf = useLoader(GLTFLoader, '/68a77506645c86eae5c0a6b1.glb');

  // Much more aggressive continuous talking state management
  useEffect(() => {
    const now = Date.now();
    
    if (isTalking) {
      setContinuousTalking(true);
      onContinuousTalkingChange(true);
      lastTalkingTimeRef.current = now;
      
      // Clear any existing timeout
      if (talkingTimeoutRef.current) {
        clearTimeout(talkingTimeoutRef.current);
      }
      
      // Keep talking state active for MUCH longer to prevent interruptions
      talkingTimeoutRef.current = setTimeout(() => {
        setContinuousTalking(false);
        onContinuousTalkingChange(false);
      }, 5000); // Keep talking for 5 seconds after voice stops
      
    } else {
      // Only stop talking if we've been quiet for a very long time
      if (talkingTimeoutRef.current) {
        clearTimeout(talkingTimeoutRef.current);
      }
      
      // Wait much longer before stopping
      talkingTimeoutRef.current = setTimeout(() => {
        // Only stop if we haven't talked recently
        if (now - lastTalkingTimeRef.current > 3000) {
          setContinuousTalking(false);
          onContinuousTalkingChange(false);
        }
      }, 3000); // Wait 3 seconds before stopping
    }

    return () => {
      if (talkingTimeoutRef.current) {
        clearTimeout(talkingTimeoutRef.current);
      }
    };
  }, [isTalking, onContinuousTalkingChange]);

  useEffect(() => {
    if (gltf) {
      try {
        // Center and scale the model
        const box = new THREE.Box3().setFromObject(gltf.scene);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        
        // Center the model
        gltf.scene.position.sub(center);
        
        // Scale to make avatar bigger and more prominent
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 10 / maxDim; // Bigger scale for more prominent avatar display
        gltf.scene.scale.setScalar(scale);

        // Set up animation mixer
        if (gltf.animations && gltf.animations.length > 0) {
          mixerRef.current = new THREE.AnimationMixer(gltf.scene);
        }

        // Find the main head/face mesh for guaranteed lip-sync
        let headFound = false;
        
        gltf.scene.traverse((child) => {
          if (child instanceof THREE.Mesh && !headFound) {
            const name = child.name.toLowerCase();
            // Look for any mesh that could be the head/face
            if (name.includes('head') || name.includes('face') || name.includes('body') || 
                name.includes('character') || name.includes('avatar') || name.includes('model')) {
              headRef.current = child;
              headFound = true;
              console.log('Found main mesh for lip-sync:', child.name);
            }
          }
          
          // Also look for bones
          if (child instanceof THREE.Bone) {
            const name = child.name.toLowerCase();
            if (name.includes('jaw') || name.includes('mouth') || name.includes('head')) {
              jawBoneRef.current = child;
              console.log('Found jaw bone:', child.name);
            }
          }
        });
        
        // If no specific head found, use the first large mesh
        if (!headFound) {
          gltf.scene.traverse((child) => {
            if (child instanceof THREE.Mesh && !headFound) {
              // Use the first mesh we find as fallback
              headRef.current = child;
              headFound = true;
              console.log('Using fallback mesh for lip-sync:', child.name);
            }
          });
        }

        // Log all available meshes and bones for debugging
        console.log('Available meshes and bones:');
        gltf.scene.traverse((child) => {
          if (child instanceof THREE.Mesh || child instanceof THREE.Bone) {
            console.log(`${child instanceof THREE.Mesh ? 'Mesh' : 'Bone'}: ${child.name}`);
          }
        });

        if (!headFound) {
          console.warn('No suitable mesh found for lip-sync animation');
        }

      } catch (error) {
        console.error('Error setting up 3D model:', error);
      }
    }
  }, [gltf]);

  // Super aggressive continuous lip-sync animation that NEVER stops
  useFrame((state, delta) => {
    // Update animation mixer if it exists
    if (mixerRef.current) {
      mixerRef.current.update(delta);
    }

    // Use continuous talking state for smoother animation
    const shouldTalk = isTalking || continuousTalking;
    
    if (shouldTalk) {
      const time = state.clock.elapsedTime;
      
      // Create more natural and continuous mouth movement
      const baseFrequency = 8; // Slightly slower for more natural speech
      const mouthOpenAmount = Math.sin(time * baseFrequency) * 0.4 + 0.2;
      
      // Add some variation to make it more realistic
      const variation = Math.sin(time * 3) * 0.1;
      const finalMouthAmount = mouthOpenAmount + variation;
      
      // Method 1: Animate jaw bone if available
      if (jawBoneRef.current) {
        jawBoneRef.current.rotation.x = finalMouthAmount * 0.3; // Smooth jaw movement
        jawBoneRef.current.rotation.z = finalMouthAmount * 0.05;
      }
      
      // Method 2: Animate the main head mesh (guaranteed to work)
      if (headRef.current) {
        // Use morph targets if available
        if (headRef.current.morphTargetDictionary && headRef.current.morphTargetInfluences) {
          const morphDict = headRef.current.morphTargetDictionary;
          const morphInfluences = headRef.current.morphTargetInfluences;
          
          // Try common morph target names
          const mouthMorphs = ['mouthOpen', 'mouthWide', 'jawOpen', 'jawDrop', 'mouth', 'jaw'];
          
          mouthMorphs.forEach((morphName) => {
            if (morphDict[morphName] !== undefined) {
              const index = morphDict[morphName];
              morphInfluences[index] = finalMouthAmount;
            }
          });
        } else {
          // Smooth scaling on the main mesh
          const scaleY = 1 + finalMouthAmount * 0.15; // Smoother scaling
          const scaleX = 1 + finalMouthAmount * 0.08;
          
          headRef.current.scale.setY(scaleY);
          headRef.current.scale.setX(scaleX);
        }
      }
      
      // Method 3: Subtle animation on all meshes for continuous effect
      gltf.scene.traverse((child) => {
        if (child instanceof THREE.Mesh && child !== headRef.current) {
          const scaleY = 1 + finalMouthAmount * 0.03; // Very subtle
          child.scale.setY(scaleY);
        }
      });
      
      // Debug: log that we're actively animating
      if (process.env.NODE_ENV === 'development' && Math.random() < 0.01) {
        console.log('Lip-sync active:', { 
          isTalking, 
          continuousTalking, 
          shouldTalk, 
          mouthOpenAmount: finalMouthAmount 
        });
      }
      
    } else {
      // Even when not talking, keep very subtle movement to prevent freezing
      const time = state.clock.elapsedTime;
      const subtleMovement = Math.sin(time * 2) * 0.02; // Very subtle breathing movement
      
      if (headRef.current) {
        // Keep very subtle scaling to prevent complete stillness
        const scaleY = 1 + subtleMovement;
        const scaleX = 1 + subtleMovement * 0.5;
        
        headRef.current.scale.setY(scaleY);
        headRef.current.scale.setX(scaleX);
      }
      
      // Reset other animations smoothly
      if (jawBoneRef.current) {
        jawBoneRef.current.rotation.x *= 0.95; // Smooth reset
        jawBoneRef.current.rotation.z *= 0.95;
      }
      
      // Reset morph targets smoothly
      if (headRef.current && headRef.current.morphTargetInfluences) {
        headRef.current.morphTargetInfluences.forEach((_, index) => {
          if (headRef.current && headRef.current.morphTargetInfluences) {
            headRef.current.morphTargetInfluences[index] *= 0.95;
          }
        });
      }
      
      // Smooth reset for all other meshes
      gltf.scene.traverse((child) => {
        if (child instanceof THREE.Mesh && child !== headRef.current) {
          const currentScaleY = child.scale.y;
          child.scale.setY(currentScaleY * 0.95 + 0.05);
        }
      });
    }
  });

  if (!gltf) {
    return (
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="gray" />
      </mesh>
    );
  }

  return (
    <group ref={modelRef}>
      <primitive object={gltf.scene} />
    </group>
  );
}

// Main 3D Avatar Component
// Error Boundary Component
class ThreeDAvatarErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('3D Avatar Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-gray-800 rounded-lg">
          <div className="text-center text-red-400">
            <div className="text-2xl mb-2">❌</div>
            <div className="text-sm">Failed to load 3D model</div>
            <div className="text-xs text-gray-500 mt-1">
              {this.state.error?.message || 'Unknown error'}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export const ThreeDAvatar: React.FC<ThreeDAvatarProps> = ({ 
  isTalking, 
  isConnected, 
  className = "" 
}) => {
  const [testTalking, setTestTalking] = useState(false);
  const [continuousTalking, setContinuousTalking] = useState(false);
  const [forceContinuous, setForceContinuous] = useState(false);
  
  // Mariem Character Interface
  const [doctorInput, setDoctorInput] = useState('');
  const [mariemResponse, setMariemResponse] = useState('');
  const [showCharacterPanel, setShowCharacterPanel] = useState(false);
  
  // Mariem Character State
  const [mariemState, setMariemState] = useState<MariemCharacter>(MARIEM_CHARACTER);
  const [conversationPhase, setConversationPhase] = useState<'greeting' | 'waiting' | 'sharing' | 'questioning' | 'relieved'>('greeting');
  const [hasBeenAsked, setHasBeenAsked] = useState(false);

  // Mariem Character Interaction Methods
  const mariemRespond = (input: string): string => {
    const lowerInput = input.toLowerCase();
    
    // Personal questions - Mariem will answer naturally (CHECK THESE FIRST)
    if (lowerInput.includes('name') || lowerInput.includes('call')) {
      return `My name is Mariem. I'm 45 years old and I live in the UAE with my family.`;
    }
    
    if (lowerInput.includes('age') || lowerInput.includes('old')) {
      return `I'm 45 years old, doctor.`;
    }
    
    if (lowerInput.includes('where') && lowerInput.includes('live')) {
      return `I live in the United Arab Emirates with my family.`;
    }
    
    if (lowerInput.includes('family') || lowerInput.includes('children') || lowerInput.includes('husband')) {
      return `I have a family here in the UAE. My mother has asthma, and there's a family history of allergies.`;
    }
    
    if (lowerInput.includes('work') || lowerInput.includes('job') || lowerInput.includes('profession')) {
      return `I work in an office, but this skin problem is making it difficult to focus sometimes because of the itching.`;
    }
    
    // Use knowledge base for specific scenarios
    if (lowerInput.includes('start') && (lowerInput.includes('consultation') || lowerInput.includes('begin'))) {
      return ANN_THERAPIST_QA.initial_greeting.answer;
    }
    
    if (lowerInput.includes('symptom') && (lowerInput.includes('detail') || lowerInput.includes('describe'))) {
      return ANN_THERAPIST_QA.symptom_description.answer;
    }
    
    if (lowerInput.includes('start') && (lowerInput.includes('month') || lowerInput.includes('ago'))) {
      return ANN_THERAPIST_QA.symptom_progression.answer;
    }
    
    if (lowerInput.includes('family') && (lowerInput.includes('asthma') || lowerInput.includes('allergy'))) {
      return ANN_THERAPIST_QA.family_history.answer;
    }
    
    if (lowerInput.includes('before') && (lowerInput.includes('similar') || lowerInput.includes('previous'))) {
      return ANN_THERAPIST_QA.previous_experience.answer;
    }
    
    if (lowerInput.includes('treatment') && (lowerInput.includes('concern') || lowerInput.includes('option'))) {
      return ANN_THERAPIST_QA.treatment_concerns.answer;
    }
    
    if (lowerInput.includes('long term') || lowerInput.includes('permanent') || lowerInput.includes('forever')) {
      return ANN_THERAPIST_QA.long_term_outlook.answer;
    }
    
    if (lowerInput.includes('relief') || lowerInput.includes('better') || lowerInput.includes('hope')) {
      return ANN_THERAPIST_QA.relief_expression.answer;
    }
    
    if (lowerInput.includes('try') && (lowerInput.includes('so far') || lowerInput.includes('attempt'))) {
      return ANN_THERAPIST_QA.treatment_attempts.answer;
    }
    
    if (lowerInput.includes('affect') && (lowerInput.includes('daily') || lowerInput.includes('life'))) {
      return ANN_THERAPIST_QA.impact_on_life.answer;
    }
    
    if (lowerInput.includes('emotional') || lowerInput.includes('feel') && lowerInput.includes('emotion')) {
      return ANN_THERAPIST_QA.emotional_impact.answer;
    }
    
    if (lowerInput.includes('sleep') && (lowerInput.includes('night') || lowerInput.includes('wake'))) {
      return ANN_THERAPIST_QA.sleep_issues.answer;
    }
    
    if (lowerInput.includes('clothing') || lowerInput.includes('clothes') || lowerInput.includes('wear')) {
      return ANN_THERAPIST_QA.clothing_concerns.answer;
    }
    
    if (lowerInput.includes('hope') && (lowerInput.includes('visit') || lowerInput.includes('get'))) {
      return ANN_THERAPIST_QA.hope_for_relief.answer;
    }
    
    // Main problem questions
    if (lowerInput.includes('what') && (lowerInput.includes('problem') || lowerInput.includes('issue') || lowerInput.includes('wrong') || lowerInput.includes('bother'))) {
      setHasBeenAsked(true);
      setConversationPhase('sharing');
      setMariemState(prev => ({ ...prev, emotionalState: 'worried' }));
      
      return `Oh doctor, I'm really worried about my skin. I have this dry, itchy, red skin on my arms and neck that's been getting worse for months. The itching gets really bad, especially at night, and I can't sleep properly. I've tried moisturizing but it doesn't help much. I'm so frustrated and embarrassed by this.`;
    }
    
    if (lowerInput.includes('tell') && (lowerInput.includes('more') || lowerInput.includes('about'))) {
      setHasBeenAsked(true);
      setConversationPhase('sharing');
      setMariemState(prev => ({ ...prev, emotionalState: 'worried' }));
      
      return `Well, it started about a few months ago with just a little dry skin, but now it's much worse. My skin is very dry and itchy, and it gets red and inflamed. The worst part is the itching at night - it keeps me awake and I can't sleep properly. I also feel embarrassed to wear short sleeves because of how it looks. It's really affecting my daily life and work.`;
    }
    
    if (lowerInput.includes('what') && lowerInput.includes('happen')) {
      setHasBeenAsked(true);
      setConversationPhase('sharing');
      setMariemState(prev => ({ ...prev, emotionalState: 'worried' }));
      
      return `It started gradually - just some dry patches on my arms. But over the past few months, it's gotten much worse. Now I have red, inflamed areas that itch constantly, especially at night. I've tried different moisturizers and creams, but nothing seems to help much. The itching is so bad sometimes that I can't concentrate on my work.`;
    }
    
    // Symptom questions
    if (lowerInput.includes('symptom') || lowerInput.includes('feel') || lowerInput.includes('experience') || lowerInput.includes('look')) {
      return `My skin is very dry and itchy, and it gets red and inflamed. The worst part is the itching at night - it keeps me awake. I also feel embarrassed to wear short sleeves because of how it looks. It's really affecting my daily life. The affected areas are mostly on my arms and neck.`;
    }
    
    if (lowerInput.includes('itch') || lowerInput.includes('pain') || lowerInput.includes('hurt')) {
      return `Yes, the itching is really bad, especially at night. It's not exactly painful, but the constant itching is very uncomfortable and it keeps me awake. Sometimes I scratch without realizing it, and that makes it worse.`;
    }
    
    if (lowerInput.includes('red') || lowerInput.includes('color') || lowerInput.includes('appearance')) {
      return `Yes, the affected areas are red and inflamed. They look dry and scaly, and sometimes they crack. It's very noticeable, which is why I feel embarrassed to wear short sleeves or show my arms.`;
    }
    
    // Duration and timeline questions
    if (lowerInput.includes('how long') || lowerInput.includes('when') || lowerInput.includes('start') || lowerInput.includes('begin')) {
      return `It started about a few months ago, and it's been getting progressively worse. At first it was just a little dry skin, but now it's really bad. I thought it would go away on its own, but it's just getting worse.`;
    }
    
    if (lowerInput.includes('worse') || lowerInput.includes('better') || lowerInput.includes('improve')) {
      return `It's definitely getting worse, not better. When it first started, it was just small dry patches. But now the areas are larger, more red, and the itching is much more intense. I'm really worried it will keep getting worse.`;
    }
    
    // Family history questions
    if (lowerInput.includes('family') || lowerInput.includes('mother') || lowerInput.includes('asthma') || lowerInput.includes('history')) {
      return `Yes, my mother has asthma, and there's a family history of allergies. Could that be related to my skin problem? I've never had skin issues before, but I do have some seasonal allergies.`;
    }
    
    if (lowerInput.includes('allergy') || lowerInput.includes('allergic')) {
      return `I do have some seasonal allergies, especially to pollen. But I've never had skin allergies before. Do you think this could be an allergic reaction to something?`;
    }
    
    // Trigger and cause questions
    if (lowerInput.includes('trigger') || lowerInput.includes('worse') || lowerInput.includes('avoid') || lowerInput.includes('cause')) {
      return `I notice it gets worse when I'm stressed, and sometimes certain fabrics make it itch more. Temperature changes seem to affect it too. I've tried to avoid wool and synthetic fabrics, but it doesn't seem to make much difference.`;
    }
    
    if (lowerInput.includes('stress') || lowerInput.includes('anxiety')) {
      return `Yes, I think stress makes it worse. I've been under a lot of stress at work lately, and I notice the itching gets more intense during stressful periods. But I'm not sure if that's the cause or just makes it worse.`;
    }
    
    // Impact on daily life questions
    if (lowerInput.includes('affect') || lowerInput.includes('sleep') || lowerInput.includes('daily') || lowerInput.includes('work')) {
      return `It's really affecting my sleep because the itching gets so bad at night. I'm also embarrassed about how it looks, so I avoid wearing certain clothes. It's frustrating because it's interfering with my daily activities and work. I can't concentrate properly when I'm constantly itching.`;
    }
    
    if (lowerInput.includes('sleep') || lowerInput.includes('night')) {
      return `The itching is worst at night, which makes it very hard to sleep. I wake up several times during the night because of the itching. I'm exhausted during the day, which affects my work and daily activities.`;
    }
    
    if (lowerInput.includes('clothes') || lowerInput.includes('wear') || lowerInput.includes('embarrass')) {
      return `Yes, I'm embarrassed about how it looks, so I avoid wearing short sleeves or anything that shows my arms. I have to be careful about what fabrics I wear because some make the itching worse. It's affecting my confidence and how I dress.`;
    }
    
    // Treatment and help questions
    if (lowerInput.includes('try') || lowerInput.includes('cream') || lowerInput.includes('medicine') || lowerInput.includes('treatment')) {
      return `I've tried several moisturizers and over-the-counter creams, but nothing seems to help much. I've also tried some natural remedies like aloe vera and coconut oil, but they don't seem to make a difference. I'm really hoping you can help me find something that works.`;
    }
    
    if (lowerInput.includes('help') || lowerInput.includes('cure') || lowerInput.includes('fix')) {
      return `I really hope you can help me, doctor. This is really affecting my quality of life. I'm willing to try anything that might help. Do you think this is something that can be cured, or will I have to live with it?`;
    }
    
    // Diagnosis and explanation questions
    if (lowerInput.includes('diagnosis') || lowerInput.includes('condition') || lowerInput.includes('treatment') || lowerInput.includes('what is it')) {
      setConversationPhase('questioning');
      setMariemState(prev => ({ ...prev, emotionalState: 'hopeful' }));
      
      return `Oh, that makes me feel better to understand what's happening. But I have some questions - is this something serious? How long will it take to get better? And what can I do at home to help?`;
    }
    
    // Advice and recommendations questions
    if (lowerInput.includes('advice') || lowerInput.includes('recommend') || lowerInput.includes('suggest') || lowerInput.includes('should')) {
      setConversationPhase('relieved');
      setMariemState(prev => ({ ...prev, emotionalState: 'relieved' }));
      
      return `Thank you for explaining that, doctor. I feel much better now. I'll follow your advice and I hope this helps. Will this condition come back, or can we prevent it from happening again?`;
    }
    
    // Questions about the future
    if (lowerInput.includes('future') || lowerInput.includes('long term') || lowerInput.includes('permanent')) {
      return `I'm really worried about whether this is permanent or if it will keep getting worse. I hope it's something that can be treated and won't affect me for the rest of my life.`;
    }
    
    if (lowerInput.includes('prevent') || lowerInput.includes('avoid') || lowerInput.includes('stop')) {
      return `I want to know what I can do to prevent this from getting worse or coming back. I'm willing to make any lifestyle changes if it will help.`;
    }
    
    // General conversation and greetings (CHECK THESE LAST)
    if (lowerInput.includes('hi') || lowerInput.includes('hello') || lowerInput.includes('greet') || lowerInput.includes('good')) {
      if (!hasBeenAsked) {
        return `Hello doctor. I'm Mariem. I'm here because I'm having some skin problems that are really worrying me.`;
      } else {
        return `Hello doctor. Thank you for seeing me today.`;
      }
    }
    
    if (lowerInput.includes('how') && lowerInput.includes('you')) {
      return `I'm okay, but I'm really worried about my skin condition. It's been affecting my sleep and daily life. I'm hoping you can help me figure out what's going on.`;
    }
    
    if (lowerInput.includes('thank') || lowerInput.includes('thanks')) {
      return `You're welcome, doctor. I really appreciate you taking the time to help me with this.`;
    }
    
    // If not sure what to say, ask for clarification
    if (!hasBeenAsked) {
      return `I'm not sure I understand your question, doctor. Could you explain what you'd like to know about my skin problem? I'm here to get help and I want to make sure I understand everything.`;
    }
    
    // Default response for other questions
    return `I'm not sure I understand. Could you explain that in simpler terms? I'm really concerned about my skin and want to make sure I understand everything. I'm here to get help and I want to be completely honest about my symptoms.`;
  };

  // Character State Display
  const getCharacterStatus = (): string => {
    switch (mariemState.emotionalState) {
      case 'worried': return '😟 Worried';
      case 'frustrated': return '😤 Frustrated';
      case 'hopeful': return '😌 Hopeful';
      case 'relieved': return '😊 Relieved';
      default: return '😐 Neutral';
    }
  };

  const getConversationPhase = (): string => {
    switch (conversationPhase) {
      case 'greeting': return '👋 Greeting';
      case 'waiting': return '⏳ Waiting';
      case 'sharing': return '💬 Sharing Symptoms';
      case 'questioning': return '❓ Asking Questions';
      case 'relieved': return '😌 Feeling Better';
      default: return '💭 Thinking';
    }
  };

  // Handle doctor input and get Mariem's response
  const handleDoctorInput = () => {
    if (doctorInput.trim()) {
      const response = mariemRespond(doctorInput);
      setMariemResponse(response);
      setDoctorInput('');
    }
  };

  return (
    <div className={`w-full h-full bg-gradient-to-br from-gray-900 to-black rounded-lg overflow-hidden ${className}`}>
      <ThreeDAvatarErrorBoundary>
        <Canvas
          camera={{ position: [0, 0, 6], fov: 70 }} // Closer camera and wider FOV for bigger avatar
          style={{ background: 'transparent' }}
        >
        {/* Lighting */}
        <ambientLight intensity={0.6} />
        <directionalLight 
          position={[10, 10, 5]} 
          intensity={1} 
          castShadow 
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        
        {/* Environment for better reflections */}
        <Environment preset="city" />
        
        {/* 3D Model - Centered */}
        <Suspense fallback={
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="#4a90e2" />
            <meshStandardMaterial attach="material" color="#4a90e2" transparent opacity={0.5} />
          </mesh>
        }>
          <group position={[0, 0, 0]}>
            <AvatarModel 
              isTalking={isTalking || testTalking || forceContinuous} 
              isConnected={isConnected} 
              onContinuousTalkingChange={setContinuousTalking}
            />
          </group>
        </Suspense>
        
        {/* Controls - Centered, No Panning */}
        <PresentationControls
          global
          rotation={[0, 0, 0]}
          polar={[-Math.PI / 6, Math.PI / 6]}
          azimuth={[-Math.PI / 6, Math.PI / 6]}
          snap
          speed={0.5}
        >
          <OrbitControls 
            enableZoom={true}
            enablePan={true}
            enableRotate={true}
            minDistance={0.1}
            maxDistance={100}
            autoRotate={false}
            autoRotateSpeed={0.5}
            target={[0, 0, 0]}
          />
        </PresentationControls>
              </Canvas>
      </ThreeDAvatarErrorBoundary>
      
      {/* Mariem Character Panel Toggle */}
      <button
        onClick={() => setShowCharacterPanel(!showCharacterPanel)}
        className={`absolute top-4 right-4 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
          showCharacterPanel 
            ? 'bg-purple-600 hover:bg-purple-700 text-white' 
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
      >
        {showCharacterPanel ? 'Hide' : 'Show'} Mariem
      </button>

      {/* Mariem Character Panel */}
      {showCharacterPanel && (
        <div className="absolute top-16 right-4 bg-black/90 text-white p-4 rounded-lg max-w-sm text-sm">
          <div className="mb-3">
            <h3 className="font-bold text-lg mb-2">👩‍⚕️ Mariem - Patient</h3>
            <div className="space-y-1 text-xs">
              <div><strong>Age:</strong> 45 years old</div>
              <div><strong>Location:</strong> UAE</div>
              <div><strong>Main Issue:</strong> Skin problems</div>
            </div>
          </div>
          
          <div className="mb-3">
            <div className="text-xs text-gray-300 mb-1">Emotional State:</div>
            <div className="bg-purple-600/30 px-2 py-1 rounded text-center">
              {getCharacterStatus()}
            </div>
          </div>
          
          <div className="mb-3">
            <div className="text-xs text-gray-300 mb-1">Conversation Phase:</div>
            <div className="bg-blue-600/30 px-2 py-1 rounded text-center">
              {getConversationPhase()}
            </div>
          </div>
          
          <div className="mb-3">
            <div className="text-xs text-gray-300 mb-1">Key Symptoms:</div>
            <div className="text-xs space-y-1">
              <div>• Dry, itchy, red skin on arms & neck</div>
              <div>• Worse at night, affects sleep</div>
              <div>• Getting progressively worse</div>
              <div>• Family history of allergies</div>
            </div>
          </div>
          
          <div className="mb-3">
            <div className="text-xs text-gray-300 mb-1">Personality Traits:</div>
            <div className="text-xs space-y-1">
              <div>• 😰 Anxious & concerned</div>
              <div>• 💬 Asks many questions</div>
              <div>• 😤 Persistent about answers</div>
              <div>• 😔 Vulnerable & worried</div>
            </div>
          </div>
          
          {/* Doctor Input Interface */}
          <div className="mb-3">
            <div className="text-xs text-gray-300 mb-2">💬 Test Doctor Input:</div>
            <div className="flex gap-2">
              <input
                type="text"
                value={doctorInput}
                onChange={(e) => setDoctorInput(e.target.value)}
                placeholder="Type as doctor..."
                className="flex-1 px-2 py-1 text-xs bg-gray-800 rounded border border-gray-600 text-white placeholder-gray-400"
                onKeyPress={(e) => e.key === 'Enter' && handleDoctorInput()}
              />
              <button
                onClick={handleDoctorInput}
                className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 rounded text-white"
              >
                Send
              </button>
            </div>
            
            {/* Example Questions */}
            <div className="mt-2">
              <div className="text-xs text-gray-400 mb-1">💡 Try these questions:</div>
              <div className="space-y-1">
                <button
                  onClick={() => {
                    setDoctorInput("What is your name?");
                    handleDoctorInput();
                  }}
                  className="block w-full text-left text-xs text-blue-300 hover:text-blue-200 px-2 py-1 rounded hover:bg-blue-600/20"
                >
                  • What is your name?
                </button>
                <button
                  onClick={() => {
                    setDoctorInput("Tell me more about your issue");
                    handleDoctorInput();
                  }}
                  className="block w-full text-left text-xs text-blue-300 hover:text-blue-200 px-2 py-1 rounded hover:bg-blue-600/20"
                >
                  • Tell me more about your issue
                </button>
                <button
                  onClick={() => {
                    setDoctorInput("What happened?");
                    handleDoctorInput();
                  }}
                  className="block w-full text-left text-xs text-blue-300 hover:text-blue-200 px-2 py-1 rounded hover:bg-blue-600/20"
                >
                  • What happened?
                </button>
                <button
                  onClick={() => {
                    setDoctorInput("How long have you had this problem?");
                    handleDoctorInput();
                  }}
                  className="block w-full text-left text-xs text-blue-300 hover:text-blue-200 px-2 py-1 rounded hover:bg-blue-600/20"
                >
                  • How long have you had this problem?
                </button>
                <button
                  onClick={() => {
                    setDoctorInput("How does it affect your daily life?");
                    handleDoctorInput();
                  }}
                  className="block w-full text-left text-xs text-blue-300 hover:text-blue-200 px-2 py-1 rounded hover:bg-blue-600/20"
                >
                  • How does it affect your daily life?
                </button>
                
                {/* New Knowledge Base Questions */}
                <div className="mt-2 pt-2 border-t border-gray-600">
                  <div className="text-xs text-gray-400 mb-1">🧠 Knowledge Base Questions:</div>
                  <button
                    onClick={() => {
                      setDoctorInput("Describe your symptoms in detail");
                      handleDoctorInput();
                    }}
                    className="block w-full text-left text-xs text-green-300 hover:text-green-200 px-2 py-1 rounded hover:bg-green-600/20"
                  >
                    • Describe your symptoms in detail
                  </button>
                  <button
                    onClick={() => {
                      setDoctorInput("Do you have family history of asthma or allergies?");
                      handleDoctorInput();
                    }}
                    className="block w-full text-left text-xs text-green-300 hover:text-green-200 px-2 py-1 rounded hover:bg-green-600/20"
                  >
                    • Family history of asthma/allergies?
                  </button>
                  <button
                    onClick={() => {
                      setDoctorInput("What are your concerns about treatment options?");
                      handleDoctorInput();
                    }}
                    className="block w-full text-left text-xs text-green-300 hover:text-green-200 px-2 py-1 rounded hover:bg-green-600/20"
                  >
                    • Concerns about treatment options?
                  </button>
                  <button
                    onClick={() => {
                      setDoctorInput("How does this affect your sleep?");
                      handleDoctorInput();
                    }}
                    className="block w-full text-left text-xs text-green-300 hover:text-green-200 px-2 py-1 rounded hover:bg-green-600/20"
                  >
                    • How does this affect your sleep?
                  </button>
                  <button
                    onClick={() => {
                      setDoctorInput("What are you hoping to get from this visit?");
                      handleDoctorInput();
                    }}
                    className="block w-full text-left text-xs text-green-300 hover:text-green-200 px-2 py-1 rounded hover:bg-green-600/20"
                  >
                    • What do you hope to get from this visit?
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Mariem's Response */}
          {mariemResponse && (
            <div className="mb-3">
              <div className="text-xs text-gray-300 mb-1">👩‍⚕️ Mariem's Response:</div>
              <div className="bg-purple-600/30 px-3 py-2 rounded text-xs">
                "{mariemResponse}"
              </div>
            </div>
          )}
        </div>
      )}
      
             {/* Test Lip-Sync Button */}
       <button
         onClick={() => setTestTalking(!testTalking)}
         className={`absolute top-20 left-4 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
           testTalking 
             ? 'bg-red-600 hover:bg-red-700 text-white' 
             : 'bg-green-600 hover:bg-green-700 text-white'
         }`}
       >
         {testTalking ? 'Stop' : 'Test'} Lip-Sync
       </button>

       {/* Force Continuous Mode Button */}
       <button
         onClick={() => setForceContinuous(!forceContinuous)}
         className={`absolute top-32 left-4 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
           forceContinuous 
             ? 'bg-purple-600 hover:bg-purple-700 text-white' 
             : 'bg-gray-600 hover:bg-gray-700 text-white'
         }`}
       >
         {forceContinuous ? 'Disable' : 'Enable'} Continuous
       </button>
      
      {/* Status Indicator */}
      <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-xs font-medium">
        {isConnected ? (
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            3D Avatar Active
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
            3D Avatar Ready
          </span>
        )}
      </div>
      
             {/* Talking Indicator with Lip-Sync Status */}
      {(isTalking || testTalking) && (
        <div className="absolute top-4 right-4 bg-blue-600/80 text-white px-3 py-1 rounded-full text-xs font-medium animate-pulse">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 bg-white rounded-full animate-bounce"></span>
            Lip-Sync Active
          </span>
        </div>
      )}

      {/* Continuous Talking Indicator */}
      {continuousTalking && !isTalking && (
        <div className="absolute top-16 right-4 bg-purple-600/80 text-white px-3 py-1 rounded-full text-xs font-medium">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
            Continuous Mode
          </span>
        </div>
      )}

      {/* Force Continuous Mode Indicator */}
      {forceContinuous && (
        <div className="absolute top-28 right-4 bg-purple-800/90 text-white px-3 py-1 rounded-full text-xs font-medium">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
            Force Continuous
          </span>
        </div>
      )}

      {/* Debug Info - Only show in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute bottom-4 right-4 bg-gray-800/80 text-white px-3 py-1 rounded-full text-xs font-medium">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
            Debug Mode
          </span>
        </div>
      )}

      {/* Audio Status */}
      <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-xs font-medium">
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
          Audio Active
        </span>
      </div>
    </div>
  );
};
