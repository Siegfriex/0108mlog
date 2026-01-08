/**
 * AI 페르소나 설정 페이지
 * 
 * PRD 경로: /profile/persona
 * AI 페르소나 설정 화면
 */

import React from 'react';
import { useNavigate, useOutletContext, Navigate } from 'react-router-dom';
import { PersonaEditor } from '../../../components/PersonaEditor';
import { CoachPersona } from '../../../types';

/**
 * Outlet Context 타입
 */
interface OutletContext {
  persona: CoachPersona;
}

/**
 * PersonaSettings 컴포넌트
 */
export const PersonaSettings: React.FC = () => {
  const navigate = useNavigate();
  const context = useOutletContext<OutletContext>();
  
  if (!context) {
    return <Navigate to="/" replace />;
  }
  
  const { persona } = context;

  const handleUpdate = (newPersona: CoachPersona) => {
    // TODO: Firestore 저장
    if (process.env.NODE_ENV === 'development') {
      console.log('Persona updated:', newPersona);
    }
    navigate('/profile');
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
