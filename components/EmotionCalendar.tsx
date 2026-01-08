
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { TimelineEntry, EmotionType } from '../types';

interface EmotionCalendarProps {
  data: TimelineEntry[];
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
}

// Visual Assets for Emotions (Simulating the 'Dapda' Blobs)
const EmotionBlob = ({ type, size = 'sm' }: { type: EmotionType, size?: 'sm' | 'md' | 'lg' }) => {
    const sizeClasses = {
        sm: 'w-8 h-8 text-xs',
        md: 'w-10 h-10 text-sm',
        lg: 'w-16 h-16 text-2xl'
    };

    const styles = {
        [EmotionType.JOY]: 'bg-[#FFD954] text-amber-900', // Yellow
        [EmotionType.PEACE]: 'bg-[#A3E635] text-lime-900', // Green/Lime
        [EmotionType.ANXIETY]: 'bg-[#FB923C] text-orange-900', // Orange
        [EmotionType.SADNESS]: 'bg-[#818CF8] text-indigo-900', // Periwinkle Blue
        [EmotionType.ANGER]: 'bg-[#F87171] text-red-900', // Red
    };

    const faces = {
        [EmotionType.JOY]: '◡‿◡',
        [EmotionType.PEACE]: '•ᴗ•',
        [EmotionType.ANXIETY]: '⊙﹏⊙',
        [EmotionType.SADNESS]: 'ㅠ_ㅠ',
        [EmotionType.ANGER]: '`Д´',
    };

    return (
        <div className={`${sizeClasses[size]} ${styles[type]} rounded-[40%] flex items-center justify-center font-bold shadow-sm transition-transform hover:scale-110 relative`}>
             {/* Glossy effect */}
             <div className="absolute top-[15%] left-[15%] w-[25%] h-[25%] bg-white/40 rounded-full blur-[1px]" />
             <span className="relative z-10 font-mono tracking-tighter">{faces[type]}</span>
        </div>
    );
};

export const EmotionCalendar: React.FC<EmotionCalendarProps> = ({ data, selectedDate, onSelectDate }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const paddingArray = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const getEntryForDay = (day: number) => {
      return data.find(entry => {
          const d = new Date(entry.date);
          return d.getDate() === day && d.getMonth() === month && d.getFullYear() === year;
      });
  };

  const isSelected = (day: number) => {
      if (!selectedDate) return false;
      return selectedDate.getDate() === day && selectedDate.getMonth() === month && selectedDate.getFullYear() === year;
  };

  return (
    <div className="w-full flex flex-col items-center">
        {/* Calendar Header */}
        <div className="flex items-center gap-4 mb-6">
            <button onClick={prevMonth} className="p-2 rounded-full hover:bg-slate-100 text-slate-400">
                <ChevronLeft size={20} />
            </button>
            <h2 className="text-xl font-bold text-slate-800">
                {year}.{String(month + 1).padStart(2, '0')}
            </h2>
            <button onClick={nextMonth} className="p-2 rounded-full hover:bg-slate-100 text-slate-400">
                <ChevronRight size={20} />
            </button>
        </div>

        {/* Days Header */}
        <div className="w-full grid grid-cols-7 gap-1 mb-2 px-2">
            {['일','월','화','수','목','금','토'].map((d, i) => (
                <div key={d} className={`text-center text-xs font-medium ${i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-slate-400'}`}>
                    {d}
                </div>
            ))}
        </div>

        {/* Calendar Grid */}
        <div className="w-full grid grid-cols-7 gap-y-4 gap-x-1 px-2">
            {paddingArray.map(i => <div key={`pad-${i}`} />)}
            
            {daysArray.map(day => {
                const entry = getEntryForDay(day);
                const selected = isSelected(day);
                
                return (
                    <div 
                        key={day} 
                        className="flex flex-col items-center gap-1 cursor-pointer"
                        onClick={() => {
                            const newDate = new Date(year, month, day);
                            onSelectDate(newDate);
                        }}
                    >
                        <div className="h-6 flex items-center justify-center">
                             <span className={`text-xs ${selected ? 'font-bold text-slate-900' : 'text-slate-500'}`}>
                                 {day}
                             </span>
                        </div>
                        
                        <div className={`
                            w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300
                            ${selected ? 'bg-slate-100 ring-2 ring-indigo-200 ring-offset-2' : ''}
                        `}>
                            {entry ? (
                                <EmotionBlob type={entry.emotion} size="md" />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-slate-50 border border-dashed border-slate-200" />
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    </div>
  );
};
