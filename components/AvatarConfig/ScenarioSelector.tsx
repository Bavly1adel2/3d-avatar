import React from 'react';

export type VisitScenario = 'initial-consultation' | 'follow-up-session';

interface ScenarioSelectorProps {
  selectedScenario: VisitScenario;
  onScenarioChange: (scenario: VisitScenario) => void;
  isVisible: boolean;
}

export const ScenarioSelector: React.FC<ScenarioSelectorProps> = ({
  selectedScenario,
  onScenarioChange,
  isVisible
}) => {
  if (!isVisible) return null;

  return (
    <div className="mb-6 p-4 bg-gradient-to-r from-gray-700/50 to-gray-800/50 rounded-2xl border-2 border-gray-600/50">
      <h3 className="text-lg font-semibold text-white mb-4 text-center">
        🏥 Select Medical Consultation Type
      </h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={() => onScenarioChange('initial-consultation')}
          className={`p-4 rounded-xl border-2 transition-all duration-300 ${
            selectedScenario === 'initial-consultation'
              ? 'border-blue-400 bg-blue-500/20 text-blue-100 shadow-lg'
              : 'border-gray-500 bg-gray-600/30 text-gray-200 hover:border-gray-400 hover:bg-gray-500/40'
          }`}
        >
          <div className="text-center">
            <div className="text-2xl mb-2">🆕</div>
            <div className="font-semibold">Initial Consultation</div>
            <div className="text-sm opacity-80 mt-1">
              First meeting with new patient
            </div>
          </div>
        </button>

        <button
          onClick={() => onScenarioChange('follow-up-session')}
          className={`p-4 rounded-xl border-2 transition-all duration-300 ${
            selectedScenario === 'follow-up-session'
              ? 'border-green-400 bg-green-500/20 text-green-100 shadow-lg'
              : 'border-gray-500 bg-gray-600/30 text-gray-200 hover:border-gray-400 hover:bg-gray-500/40'
          }`}
        >
          <div className="text-center">
            <div className="text-2xl mb-2">🔄</div>
            <div className="font-semibold">Follow-up Session</div>
            <div className="text-sm opacity-80 mt-1">
              Continuing care with existing patient
            </div>
          </div>
        </button>
      </div>

      <div className="mt-4 p-3 bg-gray-600/30 rounded-lg border border-gray-500/50">
        <p className="text-sm text-gray-300 text-center">
          <strong>Current Session Type:</strong> {selectedScenario === 'initial-consultation' ? 'Initial Consultation' : 'Follow-up Session'}
        </p>
        <p className="text-xs text-gray-400 text-center mt-1">
          You are the doctor, Mariem is your patient
        </p>
      </div>
    </div>
  );
};
