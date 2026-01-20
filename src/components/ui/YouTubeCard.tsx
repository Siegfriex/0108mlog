/**
 * YouTube 비디오 카드 컴포넌트
 *
 * 명상/힐링 음악 영상을 표시하는 카드 UI
 */

import React from 'react';
import { Play, ExternalLink } from 'lucide-react';

interface YouTubeCardProps {
  video: {
    id: string;
    title: string;
    channel: string;
    thumbnail: string;
    url: string;
  };
}

export const YouTubeCard: React.FC<YouTubeCardProps> = ({ video }) => {
  return (
    <a
      href={video.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="relative aspect-video">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Play className="w-12 h-12 text-white" fill="white" />
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-medium text-slate-800 line-clamp-2 group-hover:text-brand-primary transition-colors">
          {video.title}
        </h3>
        <p className="text-sm text-slate-500 mt-1 flex items-center gap-1">
          {video.channel}
          <ExternalLink className="w-3 h-3" />
        </p>
      </div>
    </a>
  );
};
