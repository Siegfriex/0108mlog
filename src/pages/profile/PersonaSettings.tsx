/**
 * AI 페르소나 설정 페이지
 * 
 * PRD 경로: /profile/persona
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
 * PersonaSettings 컴포넌트
 */
export const PersonaSettings: React.FC = () => {
  const navigate = useNavigate();
  const { persona, setPersona } = useAppContext();

  const handleUpdate = async (newPersona: CoachPersona) => {
    try {
      await saveUserSettings({ persona: newPersona });
      setPersona(newPersona);
      navigate('/profile');
    } catch (error) {
      logError('PersonaSettings.handleUpdate', error);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4 px-4 pt-2">
        <button 
          onClick={() => navigate('/profile')} 
          className="p-2 hover:bg-slate-100 rounded-full transition-colors"
        >
          ←
        </button>
        <h3 className="font-bold text-slate-800">AI 페르소나 설정</h3>
      </div>
      <PersonaEditor persona={persona} onUpdate={handleUpdate} />
    </div>
  );
};
