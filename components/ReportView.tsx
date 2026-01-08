import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
import { X, TrendingUp, BarChart2, Zap, ArrowRight, PieChart as PieChartIcon, Activity, Hexagon } from 'lucide-react';
import { GlassCard, LoadingSpinner, Button } from './UI';
import { TimelineEntry } from '../types';
import { generateMonthlyNarrative } from '../services/geminiService';

const PIE_DATA = [
  { name: 'Joy', value: 30, fill: '#FBBF24' }, // amber-400
  { name: 'Peace', value: 45, fill: '#38BDF8' }, // sky-400
  { name: 'Anxiety', value: 15, fill: '#FB923C' }, // orange-400
  { name: 'Sadness', value: 10, fill: '#A78BFA' }, // violet-400
];

const RADAR_DATA = [
  { subject: 'Self-Care', A: 120, fullMark: 150 },
  { subject: 'Social', A: 98, fullMark: 150 },
  { subject: 'Work', A: 86, fullMark: 150 },
  { subject: 'Sleep', A: 99, fullMark: 150 },
  { subject: 'Mindfulness', A: 85, fullMark: 150 },
  { subject: 'Physical', A: 65, fullMark: 150 },
];

const AREA_DATA = [
  { name: '1', joy: 40, peace: 24, anxiety: 24 },
  { name: '5', joy: 30, peace: 13, anxiety: 22 },
  { name: '10', joy: 20, peace: 58, anxiety: 22 },
  { name: '15', joy: 27, peace: 39, anxiety: 20 },
  { name: '20', joy: 18, peace: 48, anxiety: 21 },
  { name: '25', joy: 23, peace: 38, anxiety: 25 },
  { name: '30', joy: 34, peace: 43, anxiety: 21 },
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
                <p className="text-slate-500 text-sm mt-1 ml-1">Data driven art of your mind.</p>
             </div>
        </header>

        <div className="flex-1 overflow-y-auto scrollbar-hide pb-24 space-y-6">
            {/* Monthly Retrospective Card */}
            <div 
                className="
                    relative overflow-hidden rounded-[32px] p-8 cursor-pointer group
                    bg-gradient-to-br from-indigo-600 via-purple-600 to-fuchsia-600 text-white shadow-xl shadow-indigo-200
                    transition-all duration-500 hover:shadow-2xl hover:scale-[1.01]
                "
                onClick={() => setShowModal(true)}
            >
                {/* Background Pattern */}
                <div className="absolute top-0 right-0 p-12 opacity-10 transform rotate-12 group-hover:scale-110 transition-transform duration-700">
                    <TrendingUp size={120} />
                </div>
                <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/20 to-transparent" />

                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-6">
                        <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider border border-white/20 shadow-sm">
                            Monthly Review
                        </span>
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md group-hover:bg-white/20 transition-colors">
                            <TrendingUp size={20} />
                        </div>
                    </div>
                    
                    <h3 className="text-2xl font-serif font-bold mb-3 leading-tight tracking-wide">Your January<br/>Emotional Narrative</h3>
                    <p className="text-indigo-100 text-sm mb-6 max-w-sm font-medium leading-relaxed opacity-90">
                       AI has analyzed your emotional journey this month. See how you've grown and what patterns emerged.
                    </p>
                    
                    <div className="flex items-center gap-2 text-sm font-bold group-hover:translate-x-1 transition-transform">
                        Read Full Report <ArrowRight size={16} />
                    </div>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Mood Flow (Area Chart) */}
                <GlassCard className="!p-0 h-80 overflow-hidden relative col-span-1 md:col-span-2">
                     <div className="absolute top-6 left-6 z-10">
                        <div className="flex items-center gap-2 mb-1">
                             <div className="p-1.5 bg-indigo-50 rounded-lg text-indigo-500">
                                 <Activity size={16} />
                             </div>
                             <h3 className="text-sm font-bold text-slate-700">Mood Flow</h3>
                        </div>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold ml-1">30 Days Trend</p>
                     </div>
                     <div className="w-full h-full pt-16">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={AREA_DATA} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorPeace" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#38BDF8" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorJoy" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#FBBF24" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#FBBF24" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <Area type="monotone" dataKey="peace" stroke="#38BDF8" strokeWidth={3} fillOpacity={1} fill="url(#colorPeace)" />
                                <Area type="monotone" dataKey="joy" stroke="#FBBF24" strokeWidth={3} fillOpacity={1} fill="url(#colorJoy)" />
                            </AreaChart>
                        </ResponsiveContainer>
                     </div>
                </GlassCard>

                {/* Balance Radar */}
                <GlassCard className="!p-6 h-80 flex flex-col items-center justify-center">
                    <div className="w-full flex justify-start mb-2">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-purple-50 rounded-lg text-purple-500">
                                <Hexagon size={16} />
                            </div>
                            <h3 className="text-sm font-bold text-slate-700">Life Balance</h3>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={RADAR_DATA}>
                            <PolarGrid stroke="#e2e8f0" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }} />
                            <Radar name="My Balance" dataKey="A" stroke="#8b5cf6" strokeWidth={3} fill="#8b5cf6" fillOpacity={0.3} />
                            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}/>
                        </RadarChart>
                    </ResponsiveContainer>
                </GlassCard>

                {/* Emotion Mix Pie */}
                <GlassCard className="!p-6 h-80 flex flex-col">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-1.5 bg-amber-50 rounded-lg text-amber-500">
                             <PieChartIcon size={16} />
                        </div>
                        <h3 className="text-sm font-bold text-slate-700">Emotion Mix</h3>
                    </div>
                    <div className="flex-1">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={PIE_DATA}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                    cornerRadius={8}
                                >
                                    {PIE_DATA.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} strokeWidth={0} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
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