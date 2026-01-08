import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { X, TrendingUp, BarChart2, Zap, ArrowRight, PieChart as PieChartIcon } from 'lucide-react';
import { GlassCard, LoadingSpinner, Button } from './UI';
import { TimelineEntry } from '../types';
import { generateMonthlyNarrative } from '../services/geminiService';

const MOCK_DATA = [
  { name: 'Joy', value: 30, fill: '#FBBF24' }, // amber-400
  { name: 'Peace', value: 45, fill: '#38BDF8' }, // sky-400
  { name: 'Anxiety', value: 15, fill: '#FB923C' }, // orange-400
  { name: 'Sadness', value: 10, fill: '#A78BFA' }, // violet-400
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
        <header className="flex items-center justify-between mb-8 shrink-0">
             <div>
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <BarChart2 size={28} className="text-indigo-500" strokeWidth={1.5} /> Insights
                </h2>
                <p className="text-slate-500 text-sm mt-1 ml-1">Visualize your emotional patterns.</p>
             </div>
        </header>

        <div className="flex-1 overflow-y-auto scrollbar-hide pb-24 space-y-6">
            {/* Monthly Retrospective Card */}
            <div 
                className="
                    relative overflow-hidden rounded-[32px] p-8 cursor-pointer group
                    bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-xl shadow-indigo-200
                    transition-all duration-300 hover:shadow-2xl hover:scale-[1.01]
                "
                onClick={() => setShowModal(true)}
            >
                {/* Background Pattern */}
                <div className="absolute top-0 right-0 p-12 opacity-10 transform rotate-12 group-hover:scale-110 transition-transform duration-700">
                    <TrendingUp size={120} />
                </div>

                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-6">
                        <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider border border-white/20">
                            Monthly Review
                        </span>
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md group-hover:bg-white/20 transition-colors">
                            <TrendingUp size={20} />
                        </div>
                    </div>
                    
                    <h3 className="text-2xl font-serif font-bold mb-3 leading-tight">Your January<br/>Emotional Narrative</h3>
                    <p className="text-indigo-100 text-sm mb-6 max-w-sm font-medium leading-relaxed opacity-90">
                       AI has analyzed your emotional journey this month. See how you've grown and what patterns emerged.
                    </p>
                    
                    <div className="flex items-center gap-2 text-sm font-bold group-hover:translate-x-1 transition-transform">
                        Read Full Report <ArrowRight size={16} />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Distribution Chart */}
                <GlassCard className="!p-6 h-72">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 bg-indigo-50 rounded-xl text-indigo-500">
                             <PieChartIcon size={18} />
                        </div>
                        <h3 className="text-sm font-bold text-slate-700">Emotion Mix</h3>
                    </div>
                    <ResponsiveContainer width="100%" height="80%">
                        <PieChart>
                            <Pie
                                data={MOCK_DATA}
                                cx="50%"
                                cy="50%"
                                innerRadius={50}
                                outerRadius={70}
                                paddingAngle={6}
                                dataKey="value"
                            >
                                {MOCK_DATA.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} strokeWidth={0} />
                                ))}
                            </Pie>
                            <Tooltip 
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </GlassCard>

                {/* Resilience Score */}
                <GlassCard className="!p-6 h-72 flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-sky-100 rounded-full blur-3xl opacity-50" />
                    
                    <div className="flex items-center gap-2 relative z-10">
                        <div className="p-2 bg-sky-50 rounded-xl text-sky-500">
                             <Zap size={18} />
                        </div>
                        <h3 className="text-sm font-bold text-slate-700">Resilience Score</h3>
                    </div>

                    <div className="text-center relative z-10 my-4">
                         <div className="text-6xl font-bold text-sky-500 tracking-tighter mb-2">85</div>
                         <div className="inline-block px-3 py-1 bg-green-100 text-green-600 rounded-full text-xs font-bold">
                             +5 vs Last Month
                         </div>
                    </div>

                    <p className="text-slate-400 text-xs text-center leading-relaxed relative z-10">
                        You're showing great recovery speed from high-stress moments. Keep it up!
                    </p>
                </GlassCard>
            </div>
        </div>

        {/* Narrative Modal */}
        <AnimatePresence>
            {showModal && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
                    onClick={() => setShowModal(false)}
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="w-full max-w-lg bg-white rounded-[32px] overflow-hidden shadow-2xl relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-indigo-50 to-purple-50" />
                        
                        <div className="relative p-8 pt-10">
                            <button 
                                onClick={() => setShowModal(false)}
                                className="absolute top-6 right-6 p-2 rounded-full bg-white hover:bg-slate-50 transition-colors shadow-sm"
                            >
                                <X size={20} className="text-slate-400" />
                            </button>

                            <div className="mb-8">
                                <span className="px-3 py-1 rounded-full bg-white shadow-sm border border-slate-100 text-indigo-500 text-[10px] font-bold uppercase tracking-widest">
                                    January Review
                                </span>
                                <h2 className="text-2xl font-serif font-bold text-slate-800 mt-4 leading-tight">
                                    Your Emotional<br/>Narrative
                                </h2>
                            </div>

                            <div className="min-h-[200px] flex items-center justify-center">
                                {loading ? (
                                    <LoadingSpinner />
                                ) : (
                                    <div className="prose prose-p:text-slate-600 prose-p:leading-loose prose-p:font-medium max-h-[40vh] overflow-y-auto pr-2 scrollbar-hide">
                                        <p>{narrative}</p>
                                    </div>
                                )}
                            </div>

                            <Button
                                onClick={() => setShowModal(false)}
                                className="w-full mt-8 bg-slate-900 text-white"
                            >
                                Close Report
                            </Button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
  );
};