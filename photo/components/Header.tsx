// src/components/Header.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import PointsManager from './PointsManager'; 
import { PointsProfile } from './PointsManager';

// 定义完整的用户类型接口
interface UserProfile {
  userName: string;
  points: number;
  credits: number;
  isPlus: boolean;
  crystalRoses?: number;
  lastRoseClaimDate?: string;
  lastPointsClaimDate?: string;
  avatar?: string;
}

// 保留Props接口（仅增加数据传递，不改动）
interface HeaderProps {
  currentUser: any; 
  onLoginClick: () => void; 
  onLogoutClick: () => void;
  profile: PointsProfile; 
  profileLoading: boolean; 
  claimCredits: () => Promise<void>; 
  claimRose: () => Promise<void>; 
  deductCredits: (num?: number) => Promise<boolean>; 
}

// 组件接收Props
const Header: React.FC<HeaderProps> = ({
  currentUser,
  onLoginClick,
  onLogoutClick,
  profile, 
  profileLoading, 
  claimCredits, 
  claimRose, 
  deductCredits 
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [galleryCount, setGalleryCount] = useState(0);
  const [localProfile, setLocalProfile] = useState<UserProfile | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPlusModalOpen, setIsPlusModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // 监听 Esc 键关闭弹窗（原有逻辑不变）
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsPlusModalOpen(false);
        setIsMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  // 初始化用户数据（仅替换积分来源为后端，样式/逻辑不变）
  useEffect(() => {
    const updateHeaderData = () => {
      // 保留图库数量逻辑
      const savedGallery = JSON.parse(localStorage.getItem('ai-photo-gallery') || '[]');
      setGalleryCount(savedGallery.length);
      
      // 🔥 仅替换积分来源为后端，其他样式/字段逻辑完全不变
      if (currentUser) {
        setLocalProfile({
          userName: currentUser.username || "次元造像师",
          points: profile.points, // 后端数据
          credits: profile.credits, // 后端数据
          isPlus: profile.isPlusMember || false, // 后端数据
          crystalRoses: profile.crystalRoses, // 后端数据
          lastRoseClaimDate: profile.lastRoseClaimDate, // 后端数据
          lastPointsClaimDate: profile.lastCreditsClaimDate, // 后端数据
          avatar: currentUser.avatar || 'https://yixiaostudio.tos-cn-beijing.volces.com/github-pages-templates/yixiaostudio.cn/Yixiao-Photo/female-avatar.png'
        });
      } else {
        setLocalProfile({
          userName: "次元造像师",
          points: 0,
          credits: 0,
          isPlus: false,
          crystalRoses: 0,
          lastRoseClaimDate: '',
          lastPointsClaimDate: '',
          avatar: 'https://yixiaostudio.tos-cn-beijing.volces.com/github-pages-templates/yixiaostudio.cn/Yixiao-Photo/female-avatar.png'
        });
      }
    };
    
    // 原有定时逻辑不变
    updateHeaderData();
    const interval = setInterval(updateHeaderData, 500);
    return () => clearInterval(interval);
  }, [currentUser, profile]); // 仅增加profile依赖

  // 点击外部关闭菜单（原有逻辑不变）
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 退出登录（原有逻辑不变）
  const handleLocalLogout = () => {
    if (window.confirm('确定要退出登录并清除本地缓存吗？')) {
      onLogoutClick(); 
      setLocalProfile(null);
    }
  };

  // 订阅PLUS会员（原有样式/逻辑完全不变）
  const handleSubscribe = (planName: string) => {
    if (window.confirm(`确认订阅 ${planName}？（演示环境，点击确认模拟成功）`)) {
      setLocalProfile(prev => prev ? { ...prev, isPlus: true } : null);
      setIsPlusModalOpen(false);
      alert('尊贵的 PLUS 会员，欢迎加入！您的专属特权已即刻生效。');
    }
  };

  const closeModal = () => {
    setIsPlusModalOpen(false);
  };

  // 🔥 以下渲染部分完全保留你的原有样式，仅传递PointsManager的props
  return (
    <header className="sticky top-0 z-50 glass-effect border-b">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center ">
            <img
              src="https://yixiaostudio.tos-cn-beijing.volces.com/github-pages-templates/yixiaostudio.cn/Yixiao-Photo/icon-yixiao-photo.png"
              alt="逸潇次元拍图标"
              className="w-8.8 h-8.8 object-contain"
            />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
            逸潇次元拍
          </span>
        </Link>

        {/* Desktop Nav（原有样式完全不变） */}
        <nav className="hidden lg:flex items-center space-x-6 text-gray-600 font-black text-sm flex-grow justify-center">
          <Link to="/" className={`transition-colors py-2 border-b-2 ${location.pathname === '/' ? 'text-indigo-600 border-indigo-600' : 'border-transparent hover:text-indigo-600'}`}>
            首页
          </Link>
          <Link to="/map" className={`flex items-center space-x-1.5 transition-colors py-2 border-b-2 ${location.pathname === '/map' ? 'text-indigo-600 border-indigo-600' : 'border-transparent hover:text-indigo-600'}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.3} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7l5-2.5 5.553 2.776a1 1 0 01.447.894v10.764a1 1 0 01-1.447.894L14 17l-5 3z" /></svg>
            <span>旅行地图</span>
          </Link>
          <Link to="/gallery" className={`relative transition-colors py-2 border-b-2 ${location.pathname === '/gallery' ? 'text-indigo-600 border-indigo-600' : 'border-transparent hover:text-indigo-600'}`}>
            我的图库
            {galleryCount > 0 && <span className="absolute -top-1 -right-4 px-1.5 py-0.5 bg-rose-500 text-white text-[9px] font-black rounded-full shadow-lg shadow-rose-200">{galleryCount}</span>}
          </Link>
          <Link to="/community" className={`transition-colors py-2 border-b-2 ${location.pathname === '/community' ? 'text-indigo-600 border-indigo-600' : 'border-transparent hover:text-indigo-600'}`}>
            灵感社区
          </Link>
          <Link to="/tasks" className={`flex items-center space-x-1.5 transition-colors py-2 border-b-2 ${location.pathname === '/tasks' ? 'text-indigo-600 border-indigo-600' : 'border-transparent hover:text-indigo-600'}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.3} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
            <span>每日任务</span>
          </Link>
        </nav>

        {/* User Area（原有样式完全不变，仅传递PointsManager props） */}
        <div className="flex items-center space-x-2 md:space-x-3 flex-shrink-0">
          {!currentUser ? (
            <button
              onClick={onLoginClick}
              className="px-4 py-1.5 bg-indigo-600 text-white rounded-full text-sm font-black hover:bg-indigo-700 transition-all"
            >
              登录/注册
            </button>
          ) : (
            <>
              {/* 🔥 仅传递props，样式完全不变 */}
              <PointsManager 
                profile={profile}
                profileLoading={profileLoading}
                claimCredits={claimCredits}
                claimRose={claimRose}
                deductCredits={deductCredits}
              />

              {/* PLUS Button（原有样式完全不变） */}
              <button
                onClick={() => setIsPlusModalOpen(true)}
                className="relative group overflow-hidden px-4 py-1.5 bg-gray-900 text-white rounded-full transition-all hover:ring-2 hover:ring-amber-400">
                <div className="flex items-center space-x-1">
                  <span className="text-[10px] font-black tracking-tighter italic bg-clip-text text-transparent bg-gradient-to-r from-amber-200 to-yellow-500">
                    PLUS+
                  </span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1s_infinite]" />
              </button>

              {/* 用户名与头像区域（原有样式完全不变） */}
              <div className="relative flex items-center space-x-2 md:space-x-3 pl-2 border-l border-gray-100" ref={menuRef}>
                <span className="hidden md:block text-xs font-black text-gray-700 max-w-[80px] truncate">
                  {localProfile?.userName}
                </span>
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="w-9 h-9 rounded-full overflow-hidden border-2 border-white shadow-sm ring-1 ring-gray-100 transition-transform active:scale-90"
                >
                  <img src={localProfile?.avatar || 'https://yixiaostudio.tos-cn-beijing.volces.com/github-pages-templates/yixiaostudio.cn/Yixiao-Photo/female-avatar.png'} className="w-full h-full object-cover" alt="avatar" />
                </button>

                {isMenuOpen && (
                  <div className="absolute right-0 top-full mt-3 w-56 bg-white border border-gray-100 rounded-2xl shadow-xl py-2 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="px-5 py-3 border-b border-gray-50 mb-1 text-center">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Hi, {localProfile?.userName}</p>
                      <p className={`text-[10px] font-bold mt-1 ${localProfile?.isPlus ? 'text-amber-600' : 'text-indigo-600'}`}>
                        {localProfile?.isPlus ? '👑 尊享会员' : '普通用户'}
                      </p>
                    </div>
                    <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="block px-5 py-2.5 text-sm font-black text-gray-700 hover:bg-gray-50">个人中心</Link>
                    <Link to="/gallery" onClick={() => setIsMenuOpen(false)} className="block px-5 py-2.5 text-sm font-black text-gray-700 hover:bg-gray-50">我的画廊</Link>
                    <Link to="/tasks" onClick={() => setIsMenuOpen(false)} className="block px-5 py-2.5 text-sm font-black text-gray-700 hover:bg-gray-50">任务与奖励</Link>
                    <button onClick={handleLocalLogout} className="w-full text-left px-5 py-2.5 text-sm font-black text-rose-600 hover:bg-rose-50">退出登录</button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* PLUS SUBSCRIPTION MODAL（原有样式/逻辑完全不变） */}
      {isPlusModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-12 overflow-hidden">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-xl animate-in fade-in duration-500 cursor-pointer"
            onClick={closeModal}
          />
          <div
            className="relative w-full max-w-xl bg-[#0F1014] border border-white/10 rounded-[3rem] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.7)] animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeModal}
              className="absolute top-8 right-8 z-50 p-4 bg-white/5 hover:bg-white/10 text-slate-500 hover:text-white rounded-2xl transition-all active:scale-90"
              aria-label="关闭弹窗"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="relative p-10 text-center">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-40 bg-amber-500/10 blur-[100px] rounded-full" />
              <div className="relative z-10 w-24 h-24 bg-gradient-to-br from-amber-400 via-amber-200 to-amber-600 rounded-[2rem] mx-auto flex items-center justify-center shadow-lg mb-8">
                <svg className="w-12 h-12 text-amber-900" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <h2 className="text-4xl font-black text-white tracking-tighter leading-none">AI写真馆 PLUS</h2>
              <p className="text-slate-500 mt-3 text-sm font-medium tracking-wide">解锁前所未有的智能创作体验</p>
            </div>

            <div className="px-10 pb-12 space-y-3">
              {[
                { id: 'year', name: '年度黄金会员', price: '¥168', tag: '省 ¥180', best: true },
                { id: 'month', name: '月度体验会员', price: '¥19', tag: '灵活之选', best: false },
              ].map(plan => (
                <div
                  key={plan.id}
                  onClick={() => handleSubscribe(plan.name)}
                  className={`relative cursor-pointer p-6 rounded-[2rem] border-2 transition-all flex items-center justify-between group ${plan.best ? 'bg-amber-400 border-amber-300 shadow-xl' : 'bg-slate-900 border-white/5 hover:border-amber-400/30'}`}
                >
                  <div>
                    <p className={`text-sm font-black ${plan.best ? 'text-amber-950' : 'text-white'}`}>{plan.name}</p>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${plan.best ? 'bg-amber-950 text-amber-400' : 'bg-white/10 text-slate-400'}`}>{plan.tag}</span>
                  </div>
                  <div className="text-right">
                    <p className={`text-xl font-black ${plan.best ? 'text-amber-950' : 'text-white'}`}>{plan.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 原有样式完全保留 */}
      <style>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes zoom-in-95 { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .animate-in { animation-duration: 400ms; animation-fill-mode: both; }
        .fade-in { animation-name: fade-in; }
        .zoom-in-95 { animation-name: zoom-in-95; }
        @keyframes shimmer { to { transform: translateX(100%); } }
      `}</style>
    </header>
  );
};

export default Header;