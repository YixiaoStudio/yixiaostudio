
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Template, UserProfile } from '../types';

interface Props {
  template: Template;
}

const TemplateCard: React.FC<Props> = ({ template }) => {
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [usage, setUsage] = useState(template.usageCount || 0);

  useEffect(() => {
    const user: UserProfile = JSON.parse(localStorage.getItem('ai-user-profile') || '{}');
    if (!template.isLimited || (user.unlockedTemplates && user.unlockedTemplates.includes(template.id))) {
      setIsUnlocked(true);
    }
    
    // 从本地存储获取实时使用次数
    const stats = JSON.parse(localStorage.getItem('ai-template-usage-stats') || '{}');
    if (stats[template.id]) {
      setUsage(template.usageCount! + stats[template.id]);
    }
  }, [template]);

  const handleClick = () => {
    const destination = template.targetPath || `/template/${template.id}`;
    if (destination.startsWith('http')) {
      window.location.href = destination;
    } else {
      navigate(destination);
    }
  };

  // 格式化数字
  const formatNumber = (num: number) => {
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toString();
  };

  return (
    <div 
      onClick={handleClick}
      className={`
        group relative bg-white rounded-[2rem] overflow-hidden cursor-pointer shadow-sm hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-2
        ${template.isLimited && !isUnlocked ? 'border-amber-200' : 'border-transparent hover:border-indigo-100'}
      `}
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
        {!isLoaded && (
          <div className="absolute inset-0 z-0 overflow-hidden">
            <div className="w-full h-full bg-gray-200 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
            </div>
          </div>
        )}

        <img 
          src={template.coverImage} 
          alt={template.title}
          loading="lazy"
          onLoad={() => setIsLoaded(true)}
          className={`w-full h-full object-cover transition-all duration-1000 ${isLoaded ? 'opacity-100 scale-100 group-hover:scale-110' : 'opacity-0 scale-105'} ${template.isLimited && !isUnlocked ? 'grayscale-[0.3]' : ''}`}
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-70 group-hover:opacity-85 transition-opacity duration-500" />
        
        {/* Badges Container */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {template.isLimited ? (
            <div className={`px-3 py-1 text-[10px] font-black rounded-full flex items-center space-x-1 shadow-lg ${isUnlocked ? 'bg-emerald-500 text-white' : 'bg-amber-400 text-black'}`}>
               {isUnlocked ? (
                  <>
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    <span>已解锁</span>
                  </>
               ) : (
                  <>
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                    <span>限定 · {template.pointCost} pts</span>
                  </>
               )}
            </div>
          ) : (
            <div className="px-3 py-1 bg-white/20 backdrop-blur-md text-white text-[10px] font-black rounded-full border border-white/30 uppercase tracking-widest w-fit">
              {template.category}
            </div>
          )}
        </div>

        {/* 实时使用次数/热度显示 */}
        <div className="absolute top-4 right-4 px-2 py-1 bg-black/30 backdrop-blur-md rounded-lg border border-white/10 flex items-center space-x-1.5 transition-transform group-hover:scale-110">
          <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse shadow-[0_0_8px_#f43f5e]" />
          <span className="text-[9px] font-black text-white/90 tabular-nums">
            {formatNumber(usage)} 人已玩
          </span>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-6 text-white translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
        <h3 className="text-xl font-black mb-1 leading-tight">{template.title}</h3>
        <p className="text-white/70 text-xs mb-4 font-medium line-clamp-1">{template.subtitle}</p>
        
        <button className={`w-full py-3.5 font-black text-sm rounded-xl flex items-center justify-center space-x-2 shadow-2xl transition-all active:scale-95 ${template.isLimited && !isUnlocked ? 'bg-amber-400 text-black hover:bg-amber-500' : 'bg-white text-indigo-900 hover:bg-indigo-50'}`}>
          <span>{template.isLimited && !isUnlocked ? '解锁并生成' : '立即生成'}</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </div>
      
      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default TemplateCard;
