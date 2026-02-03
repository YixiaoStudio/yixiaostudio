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

// 保留Props接口
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
  // 🔥 核心修改：将原galleryCount改为【未读数量】unreadGalleryCount
  const [unreadGalleryCount, setUnreadGalleryCount] = useState(0);
  const [localProfile, setLocalProfile] = useState<UserProfile | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPlusModalOpen, setIsPlusModalOpen] = useState(false);
  const [claimLoading, setClaimLoading] = useState({ credits: false, rose: false });
  const menuRef = useRef<HTMLDivElement>(null);

  // 邀请码/令牌相关状态（下拉框内使用）
  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteMessage, setInviteMessage] = useState('');
  const [inviteMessageType, setInviteMessageType] = useState<'success' | 'error'>('error');

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

  // 🔥 新增：计算图库未读数量（核心逻辑）
  const getUnreadGalleryCount = () => {
    // 获取图库原数据和上次查看的数量（本地存储持久化，刷新不丢失）
    const savedGallery = JSON.parse(localStorage.getItem('ai-photo-gallery') || '[]');
    const lastReadCount = Number(localStorage.getItem('ai-photo-gallery-last-read-count') || 0);
    const currentTotalCount = savedGallery.length;
    // 未读数量 = 当前总数量 - 上次查看数量（确保非负，避免负数角标）
    const unread = Math.max(0, currentTotalCount - lastReadCount);
    return unread;
  };

  // 🔥 新增：标记图库为已读（进入图库时自动调用）
  const markGalleryAsRead = () => {
    const savedGallery = JSON.parse(localStorage.getItem('ai-photo-gallery') || '[]');
    const currentTotalCount = savedGallery.length;
    // 将「上次查看数量」更新为当前总数量
    localStorage.setItem('ai-photo-gallery-last-read-count', currentTotalCount.toString());
    // 未读数量置0，角标立即消失
    setUnreadGalleryCount(0);
  };

  // 封装更新用户数据的函数（原有逻辑修改：替换为未读数量计算）
  const updateHeaderData = () => {
    // 🔥 替换：获取未读数量而非总数量
    const unread = getUnreadGalleryCount();
    setUnreadGalleryCount(unread);
    
    if (currentUser) {
      setLocalProfile({
        userName: currentUser.username || "次元造像师",
        points: profile.points, 
        credits: profile.credits, 
        isPlus: profile.isPlusMember || false, 
        crystalRoses: profile.crystalRoses, 
        lastRoseClaimDate: profile.lastRoseClaimDate, 
        lastPointsClaimDate: profile.lastCreditsClaimDate, 
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

  // 初始化用户数据 + 监听profile变化（原有逻辑不变）
  useEffect(() => {
    updateHeaderData();
    const interval = setInterval(updateHeaderData, 1000);
    return () => clearInterval(interval);
  }, [currentUser, profile]); 

  // 🔥 新增：监听路由变化，进入/gallery页面时自动标记为已读
  useEffect(() => {
    if (location.pathname === '/gallery') {
      markGalleryAsRead();
    }
  }, [location.pathname]);

  // 点击外部关闭菜单（原有逻辑不变）
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
        resetInviteState();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 退出登录（原有逻辑不变，可选清空未读标记）
  const handleLocalLogout = () => {
    if (window.confirm('确定要退出登录并清除本地缓存吗？')) {
      onLogoutClick(); 
      setLocalProfile(null);
      // 🔥 可选：退出登录时清空未读标记（取消注释即可）
      // localStorage.removeItem('ai-photo-gallery-last-read-count');
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

  // 封装领取Credits的函数（原有逻辑不变）
  const handleClaimCredits = async () => {
    if (claimLoading.credits) return;
    setClaimLoading(prev => ({ ...prev, credits: true }));
    try {
      await claimCredits();
      updateHeaderData();
      alert('每日Credits领取成功！');
    } catch (error) {
      console.error('领取Credits失败:', error);
      alert('领取失败，请稍后重试');
    } finally {
      setClaimLoading(prev => ({ ...prev, credits: false }));
    }
  };

  // 封装领取玫瑰的函数（原有逻辑不变）
  const handleClaimRose = async () => {
    if (claimLoading.rose) return;
    setClaimLoading(prev => ({ ...prev, rose: true }));
    try {
      await claimRose();
      updateHeaderData();
      alert('每日玫瑰领取成功！');
    } catch (error) {
      console.error('领取玫瑰失败:', error);
      alert('领取失败，请稍后重试');
    } finally {
      setClaimLoading(prev => ({ ...prev, rose: false }));
    }
  };

  const closeModal = () => {
    setIsPlusModalOpen(false);
  };

  // 重置邀请码/令牌状态
  const resetInviteState = () => {
    setInviteCodeInput('');
    setInviteMessage('');
  };

  // 处理令牌输入
  const handleInviteCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInviteCodeInput(e.target.value.trim());
    setInviteMessage('');
  };

  // 令牌兑换接口（原有逻辑不变）
  const handleExchangeInviteCode = async () => {
    if (!inviteCodeInput) {
      setInviteMessage('请输入兑换令牌！');
      setInviteMessageType('error');
      return;
    }
    if (!currentUser?.id || isNaN(Number(currentUser.id))) {
      setInviteMessage('用户ID无效！');
      setInviteMessageType('error');
      return;
    }

    setInviteLoading(true);
    try {
      const API_BASE_URL = 'https://sd5r3ie17n7a7iuta91j0.apigateway-cn-beijing.volceapi.com';
      const response = await fetch(`${API_BASE_URL}/api/token/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          token: inviteCodeInput.toUpperCase(),
          userId: currentUser.id.toString()
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        if (data.success) {
          setInviteMessage(data.message || '令牌验证成功！已发放credits');
          setInviteMessageType('success');
          setInviteCodeInput('');
          await handleClaimCredits();
          setTimeout(() => setInviteMessage(''), 3000);
        } else {
          setInviteMessage(data.message || '令牌无效或已过期');
          setInviteMessageType('error');
        }
      } else {
        setInviteMessage(`请求失败：${data.message || '服务器错误'}`);
        setInviteMessageType('error');
      }
    } catch (error) {
      console.error('令牌兑换接口调用失败:', error);
      setInviteMessage('网络错误，请重试！');
      setInviteMessageType('error');
    } finally {
      setInviteLoading(false);
    }
  };

  // 渲染部分（🔥 仅修改角标显示条件：unreadGalleryCount > 0）
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

        {/* Desktop Nav（🔥 仅修改角标显示条件，显示未读数量） */}
        <nav className="hidden lg:flex items-center space-x-6 text-gray-600 font-black text-sm flex-grow justify-center">
          <Link to="/" className={`transition-colors py-2 border-b-2 ${location.pathname === '/' ? 'text-indigo-600 border-indigo-600' : 'border-transparent hover:text-indigo-600'}`}>
            首页
          </Link>
          <Link to="/map" className={`flex items-center space-x-1.5 transition-colors py-2 border-b-2 ${location.pathname === '/map' ? 'text-indigo-600 border-indigo-600' : 'border-transparent hover:text-indigo-600'}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.3} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7l5-2.5 5.553 2.776a1 1 0 01.447.894v10.764a1 1 0 01-1.447.894L14 17l-5 3z" /></svg>
            <span>旅行地图</span>
          </Link>
          {/* 🔥 核心修改：角标仅在未读数量>0时显示，显示未读数量 */}
          <Link to="/gallery" className={`relative transition-colors py-2 border-b-2 ${location.pathname === '/gallery' ? 'text-indigo-600 border-indigo-600' : 'border-transparent hover:text-indigo-600'}`}>
            我的图库
            {unreadGalleryCount > 0 && <span className="absolute -top-1 -right-4 px-1.5 py-0.5 bg-rose-500 text-white text-[9px] font-black rounded-full shadow-lg shadow-rose-200">{unreadGalleryCount}</span>}
          </Link>
          <Link to="/community" className={`transition-colors py-2 border-b-2 ${location.pathname === '/community' ? 'text-indigo-600 border-indigo-600' : 'border-transparent hover:text-indigo-600'}`}>
            灵感社区
          </Link>
          <Link to="/tasks" className={`flex items-center space-x-1.5 transition-colors py-2 border-b-2 ${location.pathname === '/tasks' ? 'text-indigo-600 border-indigo-600' : 'border-transparent hover:text-indigo-600'}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.3} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
            <span>每日任务</span>
          </Link>
        </nav>

        {/* User Area（原有逻辑完全不变） */}
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
              <PointsManager 
                profile={profile}
                profileLoading={profileLoading}
                claimCredits={handleClaimCredits}
                claimRose={handleClaimRose}
                deductCredits={deductCredits}
                claimLoading={claimLoading}
              />

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
                    
                    <Link to="/profile" onClick={() => {
                      setIsMenuOpen(false);
                      resetInviteState();
                    }} className="block px-5 py-2.5 text-sm font-black text-gray-700 hover:bg-gray-50">个人中心</Link>
                    
                    <Link to="/gallery" onClick={() => {
                      setIsMenuOpen(false);
                      resetInviteState();
                    }} className="block px-5 py-2.5 text-sm font-black text-gray-700 hover:bg-gray-50">我的画廊</Link>
                    
                    <div className="px-5 py-3 border-t border-gray-50">
                      <p className="text-sm font-black text-gray-700 mb-3">令牌兑换</p>
                      
                      <input
                        type="text"
                        value={inviteCodeInput}
                        onChange={handleInviteCodeChange}
                        placeholder="请输入兑换令牌"
                        className="w-full px-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent mb-3"
                        disabled={inviteLoading}
                      />
                      
                      <button
                        onClick={handleExchangeInviteCode}
                        disabled={inviteLoading}
                        className="w-full py-2 bg-indigo-600 text-white text-sm font-black rounded-lg hover:bg-indigo-700 transition-all disabled:opacity-70 flex items-center justify-center"
                      >
                        {inviteLoading ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            验证中...
                          </>
                        ) : (
                          '确认兑换'
                        )}
                      </button>
                      
                      {inviteMessage && (
                        <p className={`text-xs text-center mt-2 ${inviteMessageType === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                          {inviteMessage}
                        </p>
                      )}
                    </div>
                    
                    <Link to="/tasks" onClick={() => {
                      setIsMenuOpen(false);
                      resetInviteState();
                    }} className="block px-5 py-2.5 text-sm font-black text-gray-700 hover:bg-gray-50">任务与奖励</Link>
                    
                    <button onClick={() => {
                      handleLocalLogout();
                      resetInviteState();
                    }} className="w-full text-left px-5 py-2.5 text-sm font-black text-rose-600 hover:bg-rose-50">退出登录</button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* PLUS SUBSCRIPTION MODAL（原有逻辑完全不变） */}
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

      {/* 样式保留 */}
      <style>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes zoom-in-95 { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .animate-in { animation-duration: 400ms; animation-fill-mode: both; }
        .fade-in { animation-name: fade-in; }
        .zoom-in-95 { animation-name: zoom-in-95; }
        @keyframes shimmer { to { transform: translateX(100%); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }
      `}</style>
    </header>
  );
};

export default Header;