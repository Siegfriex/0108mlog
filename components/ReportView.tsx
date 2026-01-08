
import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Radar, RadarChart, 
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, AreaChart, Area, XAxis, YAxis, 
  CartesianGrid, Defs, LinearGradient, Stop 
} from 'recharts';
import { X, TrendingUp, BarChart2, Zap, ArrowRight, PieChart as PieChartIcon, Activity, Hexagon } from 'lucide-react';
import { GlassCard, LoadingSpinner, Button } from './UI';
import { TimelineEntry, EmotionType } from '../types';
import { generateMonthlyNarrative } from '../services/geminiService';

// Mock Data for Radar (Life Balance) - Simulating holistic analysis
const RADAR_DATA = [
  { subject: 'Self-Care', A: 120, fullMark: 150 },
  { subject: 'Social', A: 98, fullMark: 150 },
  { subject: 'Work', A: 86, fullMark: 150 },
  { subject: 'Sleep', A: 99, fullMark: 150 },
  { subject: 'Mindfulness', A: 85, fullMark: 150 },
  { subject: 'Physical', A: 65, fullMark: 150 },
];

// Mock Data for Area (Mood Flow) - Simulating a month of data
const AREA_DATA = [
  { name: 'Wk 1', positive: 40, energy: 24, stress: 24 },
  { name: 'Wk 2', positive: 50, energy: 35, stress: 20 },
  { name: 'Wk 3', positive: 35, energy: 60, stress: 45 },
  { name: 'Wk 4', positive: 65, energy: 45, stress: 15 },
];

interface ReportViewProps {
  timelineData: TimelineEntry[];
}

export const ReportView: React.FC<ReportViewProps> = ({ timelineData }) => {
  const [showModal, setShowModal] = useState(false);
  const [narrative, setNarrative] = useState('');
  const [loading, setLoading] = useState(true);

  // Dynamic Pie Data Calculation
  const pieData = useMemo(() => {
    const counts: Record<string, number> = {
      [EmotionType.JOY]: 0,
      [EmotionType.PEACE]: 0,
      [EmotionType.ANXIETY]: 0,
      [EmotionType.SADNESS]: 0,
      [EmotionType.ANGER]: 0,
    };

    timelineData.forEach(entry => {
      if (counts[entry.emotion] !== undefined) {
        counts[entry.emotion]++;
      }
    });

    // If no data, provide a placeholder to avoid empty chart
    if (timelineData.length === 0) {
       return [
         { name: 'Peace', value: 1, fill: '#2A8E9E' }, // Brand Primary
         { name: 'Joy', value: 1, fill: '#FCD34D' }, // Amber
         { name: 'Rest', value: 1, fill: '#E2E8F0' }, // Slate
       ];
    }

    // Map to chart format
    return Object.entries(counts)
      .filter(([_, value]) => value > 0)
      .map(([key, value]) => {
        let fill = '#CBD5E1';
        let name = key;
        switch(key) {
           case EmotionType.JOY: fill = '#FCD34D'; name = 'Joy'; break; // Amber 300
           case EmotionType.PEACE: fill = '#2A8E9E'; name = 'Peace'; break; // Brand Primary
           case EmotionType.ANXIETY: fill = '#FDA4AF'; name = 'Anxiety'; break; // Brand Accent (Pink)
           case EmotionType.SADNESS: fill = '#94A3B8'; name = 'Sadness'; break; // Slate 400
           case EmotionType.ANGER: fill = '#F87171'; name = 'Anger'; break; // Red 400
        }
        return { name, value, fill };
      });
  }, [timelineData]);

  useEffect(() => {
    const fetchNarrative = async () => {
        const text = await generateMonthlyNarrative();
        setNarrative(text);
        setLoading(false);
    };
    fetchNarrative();
  }, []);

  // Custom Tooltip for Recharts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/90 backdrop-blur-md p-3 rounded-xl border border-white/50 shadow-xl text-xs">
          <p className="font-bold text-slate-700 mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="font-medium">
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 h-full flex flex-col">
        <header className="flex items-center justify-between mb-8 shrink-0">
             <div>
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <BarChart2 size={28} className="text-brand-primary" strokeWidth={1.5} /> Insights
                </h2>
                <p className="text-slate-500 text-sm mt-1 ml-1">Your emotional landscape, visualized.</p>
             </div>
        </header>

        <div className="flex-1 overflow-y-auto scrollbar-hide pb-24 space-y-6">
            {/* Monthly Retrospective Card */}
            <div 
                className="
                    relative overflow-hidden rounded-[32px] p-8 cursor-pointer group
                    bg-gradient-to-br from-brand-primary via-teal-600 to-brand-dark text-white shadow-xl shadow-brand-primary/30
                    transition-all duration-500 hover:shadow-2xl hover:scale-[1.01] border border-white/10
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
                    <p className="text-teal-50 text-sm mb-6 max-w-sm font-medium leading-relaxed opacity-90">
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
                             <div className="p-1.5 bg-brand-light rounded-lg text-brand-primary">
                                 <Activity size={16} />
                             </div>
                             <h3 className="text-sm font-bold text-slate-700">Mood Flow</h3>
                        </div>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold ml-1">Weekly Trends</p>
                     </div>
                     <div className="w-full h-full pt-16 pr-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={AREA_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorPositive" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#2A8E9E" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#2A8E9E" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorStress" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#FDA4AF" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#FDA4AF" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10}} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10}} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area 
                                    type="monotone" 
                                    dataKey="positive" 
                                    stackId="1" 
                                    stroke="#2A8E9E" 
                                    fill="url(#colorPositive)" 
                                    strokeWidth={3}
                                    animationDuration={1500}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="stress" 
                                    stackId="2" 
                                    stroke="#FDA4AF" 
                                    fill="url(#colorStress)" 
                                    strokeWidth={3}
                                    animationDuration={1500}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                     </div>
                </GlassCard>

                {/* Balance Radar */}
                <GlassCard className="!p-6 h-80 flex flex-col items-center justify-center relative">
                    <div className="absolute top-6 left-6 flex items-center gap-2 mb-2">
                        <div className="p-1.5 bg-purple-50 rounded-lg text-purple-500">
                            <Hexagon size={16} />
                        </div>
                        <h3 className="text-sm font-bold text-slate-700">Life Balance</h3>
                    </div>
                    <div className="w-full h-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="55%" outerRadius="70%" data={RADAR_DATA}>
                                <PolarGrid stroke="#E2E8F0" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }} />
                                <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                                <Radar 
                                    name="Balance" 
                                    dataKey="A" 
                                    stroke="#2A8E9E" 
                                    strokeWidth={3} 
                                    fill="#2A8E9E" 
                                    fillOpacity={0.4} 
                                />
                                <Tooltip content={<CustomTooltip />} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </GlassCard>

                {/* Emotion Mix Pie */}
                <GlassCard className="!p-6 h-80 flex flex-col relative">
                    <div className="absolute top-6 left-6 flex items-center gap-2 mb-2">
                        <div className="p-1.5 bg-amber-50 rounded-lg text-amber-500">
                             <PieChartIcon size={16} />
                        </div>
                        <h3 className="text-sm font-bold text-slate-700">Emotion Mix</h3>
                    </div>
                    <div className="flex-1 mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="55%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                    cornerRadius={8}
                                    stroke="none"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                        
                        {/* Legend for Pie */}
                        <div className="flex flex-wrap justify-center gap-2 mt-[-10px]">
                            {pieData.slice(0, 3).map((entry, i) => (
                                <div key={i} className="flex items-center gap-1">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.fill }} />
                                    <span className="text-[10px] text-slate-500">{entry.name}</span>
                                </div>
                            ))}
                        </div>
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
                        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-brand-secondary to-brand-light opacity-50" />
                        
                        <div className="relative p-8 pt-10">
                            <button 
                                onClick={() => setShowModal(false)}
                                className="absolute top-6 right-6 p-2 rounded-full bg-white hover:bg-slate-50 transition-colors shadow-sm"
                            >
                                <X size={20} className="text-slate-400" />
                            </button>

                            <div className="mb-8">
                                <span className="px-3 py-1 rounded-full bg-white shadow-sm border border-slate-100 text-brand-primary text-[10px] font-bold uppercase tracking-widest">
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
                                variant="primary"
                                className="w-full mt-8"
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
