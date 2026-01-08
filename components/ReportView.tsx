import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { X, TrendingUp } from 'lucide-react';
import { GlassCard, LoadingSpinner } from './UI';
import { TimelineEntry } from '../types';
import { generateMonthlyNarrative } from '../services/geminiService';

const MOCK_DATA = [
  { name: '기쁨', value: 30, fill: '#FFD700' }, // joy-400
  { name: '평온', value: 45, fill: '#4FC3F7' }, // peace-400
  { name: '불안', value: 15, fill: '#FF8A65' }, // anxiety-400
  { name: '슬픔', value: 10, fill: '#BA68C8' }, // sadness-400
];

interface ReportViewProps {
  timelineData: TimelineEntry[]; // Kept for future real data integration
}

export const ReportView: React.FC<ReportViewProps> = ({ timelineData }) => {
  const [showModal, setShowModal] = useState(false);
  const [narrative, setNarrative] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNarrative = async () => {
        const text = await generateMonthlyNarrative();
        setNarrative(text);
        setLoading(false);
    };
    fetchNarrative();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 h-full flex flex-col">
        <header className="flex items-center justify-between mb-6 shrink-0">
             <div>
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <span className="text-2xl">📊</span> Insights
                </h2>
                <p className="text-slate-500 text-sm">데이터로 보는 마음의 흐름</p>
             </div>
        </header>

        <div className="flex-1 overflow-y-auto scrollbar-hide pb-24 space-y-6">
            {/* Monthly Retrospective Card */}
            <GlassCard 
                className="bg-gradient-to-br from-indigo-500 to-purple-600 !border-white/10 !text-white cursor-pointer group"
                onClick={() => setShowModal(true)}
            >
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <span className="px-2 py-1 bg-white/20 rounded-lg text-xs font-bold mb-2 inline-block">MONTHLY REVIEW</span>
                        <h3 className="text-2xl font-bold">1월의 회고록</h3>
                    </div>
                    <div className="p-3 bg-white/20 rounded-full group-hover:bg-white/30 transition-colors">
                        <TrendingUp size={24} />
                    </div>
                </div>
                <p className="text-indigo-100 mb-4 line-clamp-2">
                   지난 한 달간 당신의 감정 여정이 AI 서사로 기록되었습니다. 지금 확인해보세요.
                </p>
                <div className="text-sm font-semibold underline opacity-80 group-hover:opacity-100">
                    회고록 읽기 &rarr;
                </div>
            </GlassCard>

            {/* Distribution Chart */}
            <GlassCard className="h-80">
                <h3 className="text-lg font-semibold text-slate-700 mb-4">이번 달 감정 분포</h3>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={MOCK_DATA}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {MOCK_DATA.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
            </GlassCard>

            {/* Resilience Score */}
            <GlassCard className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-slate-700">회복 탄력성 지수</h3>
                    <p className="text-slate-400 text-sm">지난 달 대비 +5 상승</p>
                </div>
                <div className="text-4xl font-bold text-peace-600">85</div>
            </GlassCard>
        </div>

        {/* Narrative Modal */}
        <AnimatePresence>
            {showModal && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    onClick={() => setShowModal(false)}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-purple-100 to-pink-100" />
                        
                        <div className="relative p-8 pt-12">
                            <button 
                                onClick={() => setShowModal(false)}
                                className="absolute top-4 right-4 p-2 rounded-full bg-white/50 hover:bg-white transition-colors"
                            >
                                <X size={20} />
                            </button>

                            <div className="mb-6">
                                <span className="px-3 py-1 rounded-full bg-white/80 text-purple-600 text-xs font-bold uppercase tracking-wider">
                                    Monthly Review
                                </span>
                                <h2 className="text-3xl font-serif font-bold text-slate-800 mt-4">
                                    1월의 감정 여정
                                </h2>
                            </div>

                            <div className="min-h-[200px] flex items-center justify-center">
                                {loading ? (
                                    <LoadingSpinner />
                                ) : (
                                    <div className="prose prose-lg text-slate-600 leading-relaxed max-h-[40vh] overflow-y-auto">
                                        <p>{narrative}</p>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => setShowModal(false)}
                                className="w-full mt-8 py-4 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors"
                            >
                                닫기
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
  );
};