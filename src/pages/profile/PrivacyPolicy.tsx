/**
 * 개인정보 처리방침 상세 페이지
 * 
 * PRD 경로: /profile/privacy/policy
 * 개인정보 처리방침 상세 내용 표시
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassCard, Button } from '../../components/ui';
import { Shield, ArrowLeft } from 'lucide-react';

/**
 * PrivacyPolicy 컴포넌트
 */
export const PrivacyPolicy: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="h-full flex flex-col p-6">
      {/* 헤더 */}
      <div className="flex items-center gap-2 mb-6">
        <button 
          onClick={() => navigate('/profile/privacy')} 
          className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          aria-label="뒤로 가기"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center">
            <Shield size={20} className="text-brand-primary" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">개인정보 처리방침</h2>
        </div>
      </div>

      {/* 본문 */}
      <div className="flex-1 overflow-y-auto space-y-6">
        <GlassCard>
          <div className="space-y-6">
            {/* 개요 */}
            <section>
              <h3 className="text-lg font-bold text-slate-800 mb-3">1. 개요</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                MaumLog V5.0(이하 "서비스")는 사용자의 개인정보를 중요하게 생각하며, 
                개인정보 보호법 및 관련 법령을 준수합니다. 본 개인정보 처리방침은 서비스 이용 시 
                수집되는 개인정보의 항목, 수집 목적, 보관 기간, 삭제 권한 등에 대해 안내합니다.
              </p>
            </section>

            {/* 수집 목적 */}
            <section>
              <h3 className="text-lg font-bold text-slate-800 mb-3">2. 수집하는 개인정보 항목 및 수집 목적</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-slate-700 mb-2">2.1 필수 수집 항목</h4>
                  <ul className="list-disc list-inside text-sm text-slate-600 space-y-1 ml-4">
                    <li>감정 수치 및 태그: 체크인 시 입력한 감정 정보</li>
                    <li>기기 정보: 익명 인증을 위한 기기 식별자</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-700 mb-2">2.2 선택 수집 항목 (동의 시)</h4>
                  <ul className="list-disc list-inside text-sm text-slate-600 space-y-1 ml-4">
                    <li>대화 원문: 체크인 시 입력한 대화 내용</li>
                    <li>일기 원문: Night Mode에서 작성한 일기 내용</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-700 mb-2">2.3 수집 목적</h4>
                  <ul className="list-disc list-inside text-sm text-slate-600 space-y-1 ml-4">
                    <li>체크인/리포트/액션 추천 기능 제공</li>
                    <li>AI 인사이트 생성 및 개인화된 경험 제공</li>
                    <li>주간/월간 리포트 생성 및 분석</li>
                    <li>서비스 품질 개선 및 안정성 확보</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* 보관 기간 */}
            <section>
              <h3 className="text-lg font-bold text-slate-800 mb-3">3. 개인정보 보관 기간</h3>
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-slate-700 mb-2">3.1 기본 보관 기간</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    사용자의 삭제 요청 시까지 영구 보관합니다. 
                    단, 삭제 요청 후 30일간 복구 기간을 두어 실수로 삭제한 경우를 대비합니다.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-700 mb-2">3.2 동의 로그 보관</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    개인정보 처리방침 동의 및 철회 로그는 감사 목적으로 영구 보관됩니다.
                  </p>
                </div>
              </div>
            </section>

            {/* 삭제 권한 */}
            <section>
              <h3 className="text-lg font-bold text-slate-800 mb-3">4. 개인정보 삭제 권한</h3>
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-slate-700 mb-2">4.1 개별 메시지 삭제</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    대화 화면에서 롱프레스 또는 메뉴를 통해 개별 메시지를 삭제할 수 있습니다. 
                    삭제된 메시지는 30일간 복구 가능하며, 이후 영구 삭제됩니다.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-700 mb-2">4.2 대화 스레드 삭제</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    프로필 {'>'} 대화 관리에서 개별 대화를 삭제할 수 있습니다. 
                    삭제된 대화는 30일간 복구 가능하며, 이후 영구 삭제됩니다.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-700 mb-2">4.3 전체 데이터 삭제</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    프로필 {'>'} 개인정보 관리 {'>'} 전체 데이터 삭제에서 모든 데이터를 삭제할 수 있습니다. 
                    이 작업은 되돌릴 수 없으며, 모든 대화, 기록, 설정이 영구적으로 삭제됩니다.
                  </p>
                </div>
              </div>
            </section>

            {/* 데이터 내보내기 */}
            <section>
              <h3 className="text-lg font-bold text-slate-800 mb-3">5. 데이터 내보내기</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                프로필 {'>'} 개인정보 관리 {'>'} 데이터 내보내기에서 모든 데이터를 JSON 형식으로 내보낼 수 있습니다. 
                내보낸 데이터는 개인정보 보호를 위해 암호화되지 않은 상태로 제공되므로, 안전하게 보관해주세요.
              </p>
            </section>

            {/* 사용 제한 */}
            <section>
              <h3 className="text-lg font-bold text-slate-800 mb-3">6. 개인정보 사용 제한</h3>
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-slate-700 mb-2">6.1 목적 제한</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    수집한 개인정보는 명시된 목적(체크인/리포트/액션 추천, AI 인사이트 생성) 외의 용도로 사용하지 않습니다.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-700 mb-2">6.2 외부 공유 및 학습 금지</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    대화 데이터를 외부에 공유하거나 AI 모델 학습에 사용하지 않습니다. 
                    모든 데이터는 서비스 제공 목적으로만 사용됩니다.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-700 mb-2">6.3 접근 제한</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    개인정보는 운영자 및 리포트 생성 함수만 접근 가능하며, 
                    엄격한 접근 제어 정책을 따릅니다.
                  </p>
                </div>
              </div>
            </section>

            {/* 고지 사항 */}
            <section>
              <h3 className="text-lg font-bold text-slate-800 mb-3">7. 고지 사항</h3>
              <div className="bg-amber-50 rounded-lg p-4 border border-amber-200 space-y-2">
                <p className="text-sm text-amber-800 font-semibold">⚠️ 중요 안내</p>
                <ul className="list-disc list-inside text-sm text-amber-800 space-y-1 ml-4">
                  <li>본 서비스는 의료행위가 아니며, 위기 상황 시 전문 기관의 도움을 받으시기 바랍니다.</li>
                  <li>언제든 삭제/내보내기/저장 중지가 가능합니다.</li>
                  <li>AI 제공을 위해 데이터가 처리될 수 있으나, 모델 학습에 사용하지 않습니다.</li>
                  <li>대화 데이터는 영구 저장되며, 삭제 요청 시 30일 복구 기간 후 영구 삭제됩니다.</li>
                </ul>
              </div>
            </section>

            {/* 문의처 */}
            <section>
              <h3 className="text-lg font-bold text-slate-800 mb-3">8. 문의처</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                개인정보 처리방침에 대한 문의사항이 있으시면 프로필 {'>'} 설정 {'>'} 문의하기를 통해 연락해주세요.
              </p>
            </section>

            {/* 최종 업데이트 */}
            <section className="pt-4 border-t border-slate-200">
              <p className="text-xs text-slate-500">
                최종 업데이트: 2026년 1월 13일
              </p>
            </section>
          </div>
        </GlassCard>
      </div>

      {/* 하단 버튼 */}
      <div className="mt-6">
        <Button
          onClick={() => navigate('/profile/privacy')}
          variant="primary"
          className="w-full"
          aria-label="개인정보 관리로 돌아가기"
        >
          돌아가기
        </Button>
      </div>
    </div>
  );
};
