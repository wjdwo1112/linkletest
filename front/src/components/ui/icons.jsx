// front/src/components/ui/icons.jsx
import {
  HeartIcon as HeartOutline,
  ChatBubbleOvalLeftIcon as ChatOutline,
} from '@heroicons/react/24/outline';

import {
  HeartIcon as HeartSolid,
  ChatBubbleOvalLeftIcon as ChatSolid,
} from '@heroicons/react/24/solid';

/**
 * Heart 아이콘 컴포넌트
 * @param {boolean} filled - true면 채워진 아이콘, false면 아웃라인
 * @param {string} className - 추가 CSS 클래스
 */
export const Heart = ({ filled = false, className = 'w-5 h-5', ...props }) => {
  const Icon = filled ? HeartSolid : HeartOutline;
  return <Icon className={className} {...props} />;
};

/**
 * ChatIcon (댓글) 아이콘 컴포넌트
 * @param {boolean} filled - true면 채워진 아이콘, false면 아웃라인
 * @param {string} className - 추가 CSS 클래스
 */
export const ChatIcon = ({ filled = false, className = 'w-5 h-5', ...props }) => {
  const Icon = filled ? ChatSolid : ChatOutline;
  return <Icon className={className} {...props} />;
};

// 개별 export도 추가 (named export)
export { Heart as HeartIcon };
export { ChatIcon as CommentIcon };
