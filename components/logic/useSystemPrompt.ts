import { useCallback } from 'react';
import { TaskMode, TaskType } from "@heygen/streaming-avatar";
import { useStreamingAvatarContext } from './context';
import { AVATAR_SYSTEM_PROMPTS } from '@/app/lib/constants';
import { VisitScenario } from '../AvatarConfig/ScenarioSelector';

export const useSystemPrompt = () => {
  const { avatarRef } = useStreamingAvatarContext();

  const applySystemPrompt = useCallback(
    async (avatarId: string, scenario: VisitScenario) => {
      if (!avatarRef.current) return;

      const systemPrompt = AVATAR_SYSTEM_PROMPTS[avatarId as keyof typeof AVATAR_SYSTEM_PROMPTS];
      
      if (!systemPrompt) return;

      try {
        // Apply the system prompt silently for context without speaking
        await avatarRef.current.speak({
          text: `System: ${systemPrompt}`,
          taskType: TaskType.TALK,
          taskMode: TaskMode.SYNC,
        });

        console.log(`System prompt applied for ${avatarId} with ${scenario} scenario`);
      } catch (error) {
        console.error('Error applying system prompt:', error);
      }
    },
    [avatarRef]
  );

  const getSystemPrompt = useCallback(
    (avatarId: string, scenario: VisitScenario) => {
      const basePrompt = AVATAR_SYSTEM_PROMPTS[avatarId as keyof typeof AVATAR_SYSTEM_PROMPTS];
      
      if (!basePrompt) return '';

      // Add scenario-specific context
      const scenarioContext = scenario === 'initial-consultation'
        ? '\n\nCURRENT SCENARIO: Initial Consultation - You are a new patient meeting your doctor for the first time. Share your skin concerns and what brings you to the doctor.'
        : '\n\nCURRENT SCENARIO: Follow-up Session - You are continuing medical care with your existing doctor, reviewing progress and discussing ongoing skin issues.';

      return basePrompt + scenarioContext;
    },
    []
  );

  return {
    applySystemPrompt,
    getSystemPrompt,
  };
};
