/**
 * 시/문학 카드 컴포넌트
 */

import React from "react";
import {ExternalLink} from "lucide-react";

export interface PoemCardProps {
  title: string;
  link: string;
  snippet: string;
  source: string;
  reason?: string;
  onClick?: () => void;
}

/**
 * PoemCard 컴포넌트
 *
 * 시/문학 검색 결과를 카드 형태로 표시
 */
export const PoemCard: React.FC<PoemCardProps> = ({
  title,
  link,
  snippet,
  source,
  reason,
  onClick,
}) => {
  return (
    <div
      className={`bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow ${
        onClick ? 'cursor-pointer' : ''
      }`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      } : undefined}
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-lg font-semibold text-gray-800 flex-1">
          {title}
        </h3>
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-2 text-blue-600 hover:text-blue-800 flex-shrink-0"
          aria-label="원문 보기"
        >
          <ExternalLink size={18} />
        </a>
      </div>

      <p className="text-sm text-gray-600 mb-2 line-clamp-3">{snippet}</p>

      {reason && (
        <p className="text-xs text-gray-500 italic mb-2">💡 {reason}</p>
      )}

      <p className="text-xs text-gray-400">출처: {source}</p>
    </div>
  );
};
