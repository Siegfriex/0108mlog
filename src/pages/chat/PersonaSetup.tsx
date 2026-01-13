/**
 * AI 페르소나 설정 페이지
 * 
 * PRD 경로: /chat/persona
 * AI 페르소나 설정 화면
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PersonaEditor } from '../../../components/PersonaEditor';
import { CoachPersona } from '../../../types';
import { useAppContext } from '../../contexts';
import { saveUserSettings } from '../../services/firestore';
import { logError } from '../../utils/error';

/**
 * PersonaSetup 컴포넌트
 */
export const PersonaSetup: React.FC = () => {
  const navigate = useNavigate();
  const { persona, setPersona } = useAppContext();

  const handleUpdate = async (newPersona: CoachPersona) => {
    try {
      await saveUserSettings({ persona: newPersona });
      setPersona(newPersona);
    } catch (error) {
      logError('PersonaSetup.handleUpdate', error);
    }
  };

  return (
    <div className="h-full flex flex-col p-6">
      <div className="flex items-center gap-2 mb-4">
        <button 
          onClick={() => navigate('/chat')} 
          className="p-2 hover:bg-slate-100 rounded-full transition-colors"
        >
          ←
        </button>
        <h2 className="text-xl font-bold text-slate-800">AI 페르소나 설정</h2>
      </div>
      <PersonaEditor persona={persona} onUpdate={handleUpdate} />
    </div>
  );
};
