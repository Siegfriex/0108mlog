/**
 * 라우트 정의
 * 
 * PRD 사이트맵 기반 모든 경로 정의
 * Level 1 및 Level 2 하위 페이지 포함
 */

import React from 'react';
import { Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

// 페이지 컴포넌트 lazy loading
const ChatMain = lazy(() => import('../pages/chat/ChatMain').then(m => ({ default: m.ChatMain })));
const PersonaSetup = lazy(() => import('../pages/chat/PersonaSetup').then(m => ({ default: m.PersonaSetup })));
const BibliotherapySession = lazy(() => import('../pages/chat/BibliotherapySession').then(m => ({ default: m.BibliotherapySession })));

const JournalTimeline = lazy(() => import('../pages/journal/JournalTimeline').then(m => ({ default: m.JournalTimeline })));
const ConversationDetail = lazy(() => import('../pages/journal/ConversationDetail').then(m => ({ default: m.ConversationDetail })));
const JournalSearch = lazy(() => import('../pages/journal/JournalSearch').then(m => ({ default: m.JournalSearch })));
const JournalDiary = lazy(() => import('../pages/journal/JournalDiary').then(m => ({ default: m.JournalDiary })));
const JournalJourney = lazy(() => import('../pages/journal/JournalJourney').then(m => ({ default: m.JournalJourney })));

const WeeklyReport = lazy(() => import('../pages/reports/WeeklyReport').then(m => ({ default: m.WeeklyReport })));
const MonthlyReport = lazy(() => import('../pages/reports/MonthlyReport').then(m => ({ default: m.MonthlyReport })));
const MonthlyRetrospective = lazy(() => import('../pages/reports/MonthlyRetrospective').then(m => ({ default: m.MonthlyRetrospective })));
const MonitorDashboard = lazy(() => import('../pages/reports/MonitorDashboard').then(m => ({ default: m.MonitorDashboardPage })));

const ContentMain = lazy(() => import('../pages/content/ContentMain').then(m => ({ default: m.ContentMain })));
const ContentPoems = lazy(() => import('../pages/content/ContentPoems').then(m => ({ default: m.ContentPoems })));
const ContentMeditations = lazy(() => import('../pages/content/ContentMeditations').then(m => ({ default: m.ContentMeditations })));
const ContentMusic = lazy(() => import('../pages/content/ContentMusic').then(m => ({ default: m.ContentMusic })));
const ContentImmersion = lazy(() => import('../pages/content/ContentImmersion').then(m => ({ default: m.ContentImmersion })));

const ProfileMain = lazy(() => import('../pages/profile/ProfileMain').then(m => ({ default: m.ProfileMain })));
const PersonaSettings = lazy(() => import('../pages/profile/PersonaSettings').then(m => ({ default: m.PersonaSettings })));
const DayNightSettings = lazy(() => import('../pages/profile/DayNightSettings').then(m => ({ default: m.DayNightSettings })));
const Settings = lazy(() => import('../pages/profile/Settings').then(m => ({ default: m.Settings })));
const Privacy = lazy(() => import('../pages/profile/Privacy').then(m => ({ default: m.Privacy })));
const PrivacyPolicy = lazy(() => import('../pages/profile/PrivacyPolicy').then(m => ({ default: m.PrivacyPolicy })));
const Conversations = lazy(() => import('../pages/profile/Conversations').then(m => ({ default: m.Conversations })));

const SafetyMain = lazy(() => import('../pages/safety/SafetyMain').then(m => ({ default: m.SafetyMain })));
const CrisisSupport = lazy(() => import('../pages/safety/CrisisSupport').then(m => ({ default: m.CrisisSupport })));
const CopingTools = lazy(() => import('../pages/safety/CopingTools').then(m => ({ default: m.CopingTools })));

const GatePage = lazy(() => import('../pages/easterEgg/GatePage').then(m => ({ default: m.GatePage })));
const LetterPage = lazy(() => import('../pages/easterEgg/LetterPage').then(m => ({ default: m.LetterPage })));

const NotFound = lazy(() => import('../pages/NotFound').then(m => ({ default: m.NotFound })));

/**
 * 로딩 래퍼 컴포넌트
 */
const LoadingWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Suspense fallback={<LoadingSpinner />}>
    {children}
  </Suspense>
);

/**
 * 라우트 정의 배열
 * PRD 사이트맵 기반 경로 매핑
 */
export const routes = (
  <>
    {/* 채팅 라우트 */}
    <Route path="chat" element={<LoadingWrapper><ChatMain /></LoadingWrapper>} />
    <Route path="chat/persona" element={<LoadingWrapper><PersonaSetup /></LoadingWrapper>} />
    <Route path="chat/bibliotherapy" element={<LoadingWrapper><BibliotherapySession /></LoadingWrapper>} />
    
    {/* 기록 라우트 */}
    <Route path="journal" element={<LoadingWrapper><JournalTimeline /></LoadingWrapper>} />
    <Route path="journal/detail/:id" element={<LoadingWrapper><ConversationDetail /></LoadingWrapper>} />
    <Route path="journal/search" element={<LoadingWrapper><JournalSearch /></LoadingWrapper>} />
    <Route path="journal/diary" element={<LoadingWrapper><JournalDiary /></LoadingWrapper>} />
    <Route path="journal/journey" element={<LoadingWrapper><JournalJourney /></LoadingWrapper>} />
    
    {/* 리포트 라우트 */}
    <Route path="reports/weekly" element={<LoadingWrapper><WeeklyReport /></LoadingWrapper>} />
    <Route path="reports/monthly" element={<LoadingWrapper><MonthlyReport /></LoadingWrapper>} />
    <Route path="reports/monthly-retrospective" element={<LoadingWrapper><MonthlyRetrospective /></LoadingWrapper>} />
    <Route path="reports/monitor" element={<LoadingWrapper><MonitorDashboard /></LoadingWrapper>} />
    <Route path="reports" element={<LoadingWrapper><WeeklyReport /></LoadingWrapper>} />
    
    {/* 콘텐츠 라우트 */}
    <Route path="content" element={<LoadingWrapper><ContentMain /></LoadingWrapper>} />
    <Route path="content/poems" element={<LoadingWrapper><ContentPoems /></LoadingWrapper>} />
    <Route path="content/meditations" element={<LoadingWrapper><ContentMeditations /></LoadingWrapper>} />
    <Route path="content/music" element={<LoadingWrapper><ContentMusic /></LoadingWrapper>} />
    <Route path="content/immersion" element={<LoadingWrapper><ContentImmersion /></LoadingWrapper>} />
    
    {/* 프로필 라우트 */}
    <Route path="profile" element={<LoadingWrapper><ProfileMain /></LoadingWrapper>} />
    <Route path="profile/persona" element={<LoadingWrapper><PersonaSettings /></LoadingWrapper>} />
    <Route path="profile/daynight" element={<LoadingWrapper><DayNightSettings /></LoadingWrapper>} />
    <Route path="profile/settings" element={<LoadingWrapper><Settings /></LoadingWrapper>} />
    <Route path="profile/privacy" element={<LoadingWrapper><Privacy /></LoadingWrapper>} />
    <Route path="profile/privacy/policy" element={<LoadingWrapper><PrivacyPolicy /></LoadingWrapper>} />
    <Route path="profile/conversations" element={<LoadingWrapper><Conversations /></LoadingWrapper>} />
    
    {/* 안전망 라우트 */}
    <Route path="safety" element={<LoadingWrapper><SafetyMain /></LoadingWrapper>} />
    <Route path="safety/crisis" element={<LoadingWrapper><CrisisSupport /></LoadingWrapper>} />
    <Route path="safety/tools" element={<LoadingWrapper><CopingTools /></LoadingWrapper>} />
    
    {/* 이스터에그 라우트 */}
    <Route path="easter-egg/gate" element={<LoadingWrapper><GatePage /></LoadingWrapper>} />
    <Route path="easter-egg/letter" element={<LoadingWrapper><LetterPage /></LoadingWrapper>} />
    
    {/* 404 페이지 */}
    <Route path="*" element={<LoadingWrapper><NotFound /></LoadingWrapper>} />
  </>
);
