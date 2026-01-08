import React from 'react';
import { TimelineView } from './TimelineView';
import { TimelineEntry } from '../types';

interface JournalViewProps {
  timelineData: TimelineEntry[];
}

export const JournalView: React.FC<JournalViewProps> = ({ timelineData }) => {
  return (
    <div className="h-full w-full max-w-3xl mx-auto px-4 md:px-0 py-4 md:py-6">
       <TimelineView data={timelineData} />
    </div>
  );
};
