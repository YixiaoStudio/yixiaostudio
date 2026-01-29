
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { TEMPLATES } from '../constants';
import { Template, UserProfile } from '../types';

// 简化的经纬度转 SVG 坐标逻辑
const mapCoords = (lat: number, lng: number, width: number, height: number) => {
  // 简单的墨卡托投影近似
  const x = (lng + 180) * (width / 360);
  const y = (90 - lat) * (height / 180);
  return { x, y };
};

const TravelMap: React.FC = () => {
  const navigate = useNavigate();
  const travelTemplates = TEMPLATES.filter(t => t.category === '旅拍');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [selectedLoc, setSelectedLoc] = useState<Template | null>(null);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('ai-user-profile') || '{}');
    setProfile(user);
    // 默认选中第一个未打卡的地点作为引导
    const nextLoc = travelTemplates.find(t => !user.visitedLocations?.includes(t.id));
    if (nextLoc) setSelectedLoc(nextLoc);
    else setSelectedLoc(travelTemplates[0]);
  }, []);

  const visitedCount = useMemo(() => profile?.visitedLocations?.length || 0, [profile]);
  const progress = (visitedCount / travelTemplates.length) * 100;

  const isVisited = (id: string) => profile?.visitedLocations?.includes(id) || false;

  return (
    <div className="min-h-screen bg-[#050810] pb-32 overflow-hidden relative font-sans text-slate-200">
      {/* 极光背景装饰 */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-teal-500/10 blur-[100px] rounded-full pointer-events-none" />

      {/* 顶部状态栏 */}
      <section className="relative z-20 pt-28 px-6 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="text-center md:text-left">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full mb-4">
            <span className="flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-teal-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest text-teal-400">Mission: Global Discovery</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter italic">
            足迹<span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-indigo-400">星图</span>
          </h1>
          <p className="mt-4 text-slate-400 text-sm font-medium">每前往一个目的地，点亮一颗属于你的艺术之星。</p>
        </div>

        <div className="flex items-center space-x-6 bg-white/5 backdrop-blur-xl p-6 rounded-[2.5rem] border border-white/10 shadow-2xl">
          <div className="relative w-20 h-20">
            <svg className="w-full h-full -rotate-90">
              <circle cx="40" cy="40" r="36" fill="none" stroke="currentColor" strokeWidth="4" className="text-white/5" />
              <circle 
                cx="40" cy="40" r="36" fill="none" stroke="currentColor" strokeWidth="4" 
                className="text-teal-500 transition-all duration-1000" 
                strokeDasharray={`${progress * 2.26} 226`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
               <span className="text-lg font-black text-white">{visitedCount}</span>
               <span className="text-[8px] text-slate-500 font-bold uppercase">Locations</span>
            </div>
          </div>
          <div className="space-y-1">
             <p className="text-xs font-black text-slate-300">全球探索进度</p>
             <p className="text-[10px] text-slate-500 font-medium">集齐 {travelTemplates.length} 个地点解锁“环球勋章”</p>
             <div className="flex space-x-1 pt-2">
                {travelTemplates.map(t => (
                  <div key={t.id} className={`w-1.5 h-1.5 rounded-full ${isVisited(t.id) ? 'bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.6)]' : 'bg-white/10'}`} />
                ))}
             </div>
          </div>
        </div>
      </section>

      {/* 视图切换 */}
      <div className="flex justify-center mt-12 mb-8 relative z-20">
         <div className="bg-white/5 backdrop-blur-md p-1 rounded-2xl border border-white/10">
            <button 
              onClick={() => setViewMode('map')}
              className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${viewMode === 'map' ? 'bg-teal-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
              星图模式
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${viewMode === 'list' ? 'bg-teal-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
              卡片模式
            </button>
         </div>
      </div>

      {/* 地图核心区域 */}
      <div className="max-w-7xl mx-auto px-6 relative min-h-[600px] flex flex-col items-center">
        {viewMode === 'map' ? (
          <div className="relative w-full aspect-video bg-white/[0.02] border border-white/5 rounded-[4rem] shadow-inner overflow-hidden flex items-center justify-center group">
            {/* SVG 世界背景 */}
            <svg viewBox="0 0 1000 500" className="w-full h-full opacity-20 pointer-events-none">
              <rect width="1000" height="500" fill="none" />
              {Array.from({ length: 150 }).map((_, i) => (
                <circle key={i} cx={Math.random() * 1000} cy={Math.random() * 500} r="1" fill="white" className="animate-pulse" style={{animationDelay: i*0.1+'s'}} />
              ))}
            </svg>

            {/* 地点连接线 */}
            <svg viewBox="0 0 1000 500" className="absolute inset-0 pointer-events-none z-10">
               {travelTemplates.filter(t => isVisited(t.id)).map((t, i, arr) => {
                 if (i === 0) return null;
                 const prev = mapCoords(arr[i-1].coordinates!.lat, arr[i-1].coordinates!.lng, 1000, 500);
                 const curr = mapCoords(t.coordinates!.lat, t.coordinates!.lng, 1000, 500);
                 return (
                   <line 
                    key={t.id} x1={prev.x} y1={prev.y} x2={curr.x} y2={curr.y} 
                    stroke="url(#lineGradient)" strokeWidth="0.5" strokeDasharray="4 4" 
                   />
                 );
               })}
               <defs>
                 <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0" />
                    <stop offset="50%" stopColor="#2dd4bf" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#2dd4bf" stopOpacity="0" />
                 </linearGradient>
               </defs>
            </svg>

            {/* 地点点位与常显城市名 */}
            {travelTemplates.map((loc) => {
              const { x, y } = mapCoords(loc.coordinates!.lat, loc.coordinates!.lng, 1000, 500);
              const visited = isVisited(loc.id);
              const isActive = selectedLoc?.id === loc.id;

              return (
                <div 
                  key={loc.id}
                  className="absolute cursor-pointer group/pin z-20"
                  style={{ left: `${(x / 1000) * 100}%`, top: `${(y / 500) * 100}%` }}
                  onClick={() => setSelectedLoc(loc)}
                >
                  <div className="relative -translate-x-1/2 -translate-y-1/2">
                    {/* 基础点 */}
                    <div className={`
                      w-3 h-3 rounded-full transition-all duration-500 border-2
                      ${visited ? 'bg-teal-400 border-white shadow-[0_0_10px_rgba(45,212,191,0.8)] scale-110' : 'bg-slate-800 border-slate-600 group-hover/pin:bg-slate-700'}
                      ${isActive ? 'ring-4 ring-teal-500/30 bg-teal-300' : ''}
                    `} />
                    
                    {/* 常显城市名标签 - 修改为永久显示 */}
                    <div className={`
                      absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-0.5 bg-slate-900/40 backdrop-blur-sm border border-white/5 rounded-md whitespace-nowrap transition-all pointer-events-none
                      ${isActive ? 'bg-teal-500/80 scale-110 border-teal-400/50 shadow-lg' : ''}
                    `}>
                       <p className={`text-[9px] font-black tracking-tight ${isActive ? 'text-white' : 'text-slate-400'}`}>
                         {loc.locationName?.split(' · ')[1] || loc.locationName}
                       </p>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* 地点详情卡 (当前选中的) */}
            {selectedLoc && (
              <div className="absolute bottom-10 right-10 w-80 bg-slate-900/80 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-6 shadow-2xl animate-[fadeInRight_0.5s_ease-out] z-30">
                 <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-4 shadow-lg">
                    <img src={selectedLoc.coverImage} className="w-full h-full object-cover" alt="cover" />
                    {isVisited(selectedLoc.id) ? (
                      <div className="absolute inset-0 bg-teal-500/20 flex items-center justify-center">
                         <div className="bg-white text-teal-600 px-3 py-1 rounded-full text-[10px] font-black uppercase shadow-lg">已点亮足迹</div>
                      </div>
                    ) : (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                         <div className="bg-indigo-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase">尚未抵达</div>
                      </div>
                    )}
                 </div>
                 <h3 className="text-xl font-black text-white">{selectedLoc.title}</h3>
                 <p className="text-xs text-slate-400 font-medium mb-6 line-clamp-2 mt-1">{selectedLoc.description}</p>
                 <button 
                  onClick={() => navigate(`/template/${selectedLoc.id}`)}
                  className="w-full py-3 bg-teal-500 hover:bg-teal-400 text-white font-black rounded-xl text-xs transition-all active:scale-95 shadow-lg shadow-teal-900/20"
                 >
                   {isVisited(selectedLoc.id) ? '再次前往生成' : '立即打卡该地'}
                 </button>
              </div>
            )}
          </div>
        ) : (
          <div className="w-full grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {travelTemplates.map((loc) => (
              <div 
                key={loc.id}
                onClick={() => navigate(`/template/${loc.id}`)}
                className="group relative bg-white/5 border border-white/10 rounded-[3rem] p-6 hover:bg-white/[0.08] transition-all cursor-pointer"
              >
                <div className="aspect-[4/3] rounded-[2rem] overflow-hidden mb-6 relative">
                  <img src={loc.coverImage} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={loc.title} />
                  {isVisited(loc.id) && (
                    <div className="absolute top-4 right-4 bg-teal-500 text-white p-2 rounded-full shadow-lg">
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    </div>
                  )}
                </div>
                <h3 className="text-xl font-black text-white">{loc.title}</h3>
                <p className="text-slate-400 text-xs mt-2">{loc.locationName}</p>
                <div className="mt-6 flex items-center justify-between">
                   <span className="text-[10px] font-black uppercase text-teal-400">View Destination</span>
                   <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                   </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeInRight {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};

export default TravelMap;
