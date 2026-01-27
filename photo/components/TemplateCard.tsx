
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Template } from '../types';

interface Props {
  template: Template;
}

const TemplateCard: React.FC<Props> = ({ template }) => {
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);

  const handleClick = () => {
    const destination = template.targetPath || `/template/${template.id}`;
    if (destination.startsWith('http')) {
      window.location.href = destination;
    } else {
      navigate(destination);
    }
  };

  return (
    <div 
      onClick={handleClick}
      className="group relative bg-white rounded-[2rem] overflow-hidden cursor-pointer shadow-sm hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-transparent hover:border-indigo-100"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
        {/* Shimmer Effect Skeleton */}
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
          className={`w-full h-full object-cover transition-all duration-1000 ${isLoaded ? 'opacity-100 scale-100 group-hover:scale-110' : 'opacity-0 scale-105'}`}
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-70 group-hover:opacity-85 transition-opacity duration-500" />
        
        {/* Badges Container */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {/* Category Badge */}
          <div className="px-3 py-1 bg-white/20 backdrop-blur-md text-white text-[10px] font-black rounded-full border border-white/30 uppercase tracking-widest w-fit">
            {template.category}
          </div>
          
          <div className="flex gap-2">
            {template.isHot && (
              <span className="px-3 py-1 bg-gradient-to-r from-rose-500 to-orange-500 text-white text-[10px] font-bold rounded-lg shadow-lg flex items-center animate-pulse">
                HOT
              </span>
            )}
            {template.isNew && (
              <span className="px-3 py-1 bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-[10px] font-bold rounded-lg shadow-lg flex items-center">
                NEW
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-6 text-white translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
        <h3 className="text-xl font-black mb-1 leading-tight">{template.title}</h3>
        <p className="text-white/70 text-xs mb-4 font-medium line-clamp-1">{template.subtitle}</p>
        
        <div className="flex flex-wrap gap-2 mb-4 opacity-0 group-hover:opacity-100 transition-opacity delay-150 duration-500">
          {template.tags.map(tag => (
            <span key={tag} className="text-[9px] px-2 py-0.5 bg-white/10 rounded-md backdrop-blur-sm text-white/80 border border-white/10">
              #{tag}
            </span>
          ))}
        </div>

        <button className="w-full py-3.5 bg-white text-indigo-900 font-black text-sm rounded-xl flex items-center justify-center space-x-2 shadow-2xl hover:bg-indigo-50 transition-all active:scale-95">
          <span>立即生成</span>
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
