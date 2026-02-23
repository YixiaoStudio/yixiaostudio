import React, { useState, useEffect, useRef, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import PointsManager from './PointsManager'; 
import { PointsProfile } from './PointsManager';
// 🔥 新增：导入积分刷新Context
import { PointsRefreshContext } from '../App';

// 定义完整的用户类型接口
interface UserProfile {
  userName: string;
  points: number;
  credits: number;
  isPlus: boolean;
  crystalRoses?: number; // 明确为数字类型（支持小数）
  lastRoseClaimDate?: string;
  lastPointsClaimDate?: string;
  avatar?: string;
}

// 保留Props接口（新增onPlusButtonClick，可选，补充deductRose）
interface HeaderProps {
  currentUser: any; 
  onLoginClick: () => void; 
  onLogoutClick: () => void;
  profile: PointsProfile; 
  profileLoading: boolean; 
  claimCredits: () => Promise<void>; 
  claimRose: () => Promise<void>; 
  deductCredits: (num?: number) => Promise<boolean>; 
  // 🔥 新增：补充deductRose Props定义（关键修复）
  deductRose: (num?: number) => Promise<boolean>;
  onPlusButtonClick?: () => void; // 新增：接收跳转函数（可选）
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
  deductCredits,
  deductRose, // 🔥 新增：接收扣减玫瑰方法
  onPlusButtonClick // 接收跳转函数
}) => {
  const location = useLocation();
  const navigate = useNavigate(); // 路由跳转钩子
  // 🔥 核心修改：移除PLUS模态框相关状态
  const [unreadGalleryCount, setUnreadGalleryCount] = useState(0);
  const [localProfile, setLocalProfile] = useState<UserProfile | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [claimLoading, setClaimLoading] = useState({ credits: false, rose: false });
  const menuRef = useRef<HTMLDivElement>(null);

  // 🔥 新增：获取刷新积分的函数（添加类型判断，避免undefined）
  const pointsRefreshContext = useContext(PointsRefreshContext);
  const refreshPoints = pointsRefreshContext?.refreshPoints;

  // 邀请码/令牌相关状态（新增兑换类型选择）
  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteMessage, setInviteMessage] = useState('');
  const [inviteMessageType, setInviteMessageType] = useState<'success' | 'error'>('error');
  // 新增：兑换类型选择（默认积分）
  const [exchangeType, setExchangeType] = useState<'credits' | 'rose'>('credits');

  // 监听 Esc 键关闭菜单（移除模态框相关）
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
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

  // 封装更新用户数据的函数（核心修改：玫瑰数量保留1位小数，避免取整）
  const updateHeaderData = () => {
    // 🔥 替换：获取未读数量而非总数量
    const unread = getUnreadGalleryCount();
    setUnreadGalleryCount(unread);
    
    if (currentUser) {
      // 🔥 核心修改1：玫瑰数量保留1位小数，确保0.5正确显示
      const crystalRoses = typeof profile.crystalRoses === 'number' 
        ? parseFloat(profile.crystalRoses.toFixed(1)) // 保留1位小数
        : 0;
      
      setLocalProfile({
        userName: currentUser.username || "次元造像师",
        points: profile.points, 
        credits: profile.credits, // credits保持整数显示
        isPlus: profile.isPlusMember || false, 
        crystalRoses: crystalRoses, // 使用处理后的小数玫瑰数
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
        crystalRoses: 0, // 默认0朵
        lastRoseClaimDate: '',
        lastPointsClaimDate: '',
        avatar: 'https://yixiaostudio.tos-cn-beijing.volces.com/github-pages-templates/yixiaostudio.cn/Yixiao-Photo/female-avatar.png'
      });
    }
  };

  // 🔥 核心修复1：删掉1秒定时器，只在currentUser/profile变化时更新
  useEffect(() => {
    updateHeaderData();
    // ❌ 删掉这行定时轮询：导致数据覆盖的元凶
    // const interval = setInterval(updateHeaderData, 1000);
    // return () => clearInterval(interval);
  }, [currentUser, profile]); // 只有依赖变化时才更新

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

  // 🔥 核心修改：移除PLUS订阅弹窗函数，改为跳转逻辑
  const handlePlusButtonClick = () => {
    // 优先使用父组件传递的跳转函数，没有则直接使用navigate
    if (onPlusButtonClick) {
      onPlusButtonClick();
    } else {
      navigate('/subscribe'); // 直接跳转到订阅页面
    }
  };

  // 封装领取Credits的函数（精简弹窗：移除重复的alert提示）
  const handleClaimCredits = async () => {
    if (claimLoading.credits) return;
    setClaimLoading(prev => ({ ...prev, credits: true }));
    try {
      await claimCredits(); // 核心领取逻辑（提示语移到PointsManager中）
      updateHeaderData(); // 领取后更新
    } catch (error) {
      console.error('领取Credits失败:', error);
      alert('领取失败，请稍后重试');
    } finally {
      setClaimLoading(prev => ({ ...prev, credits: false }));
    }
  };

  // 封装领取玫瑰的函数（核心修改2：领取0.5朵玫瑰后正确更新数值）
  const handleClaimRose = async () => {
    if (claimLoading.rose) return;
    setClaimLoading(prev => ({ ...prev, rose: true }));
    try {
      await claimRose(); // 核心领取逻辑（所有提示移到PointsManager中）
      updateHeaderData(); // 领取后强制更新
    } catch (error) {
      console.error('领取玫瑰失败:', error);
    } finally {
      setClaimLoading(prev => ({ ...prev, rose: false }));
    }
  };

  // 重置邀请码/令牌状态（新增重置兑换类型）
  const resetInviteState = () => {
    setInviteCodeInput('');
    setInviteMessage('');
    setExchangeType('credits'); // 重置为默认的积分兑换
  };

  // 处理令牌输入
  const handleInviteCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInviteCodeInput(e.target.value.trim());
    setInviteMessage('');
  };

  // 处理兑换类型变更
  const handleExchangeTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setExchangeType(e.target.value as 'credits' | 'rose');
    setInviteMessage(''); // 切换类型时清空提示
  };

  // 🔥 核心修复2：兑换令牌成功后，不仅更新本地，还要从后端拉取最新玫瑰数
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
      const API_BASE_URL = 'https://sd5j17d5mg7k3v1e7vu60.apigateway-cn-beijing.volceapi.com';
      const response = await fetch(`${API_BASE_URL}/api/token/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          token: inviteCodeInput.toUpperCase(),
          userId: currentUser.id.toString(),
          type: exchangeType // 新增：传递兑换类型
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        if (data.success) {
          // 根据兑换类型显示不同的成功提示
          const typeText = exchangeType === 'credits' ? '积分' : '玫瑰';
          setInviteMessage(data.message || `令牌验证成功！已发放${typeText}`);
          setInviteMessageType('success');
          setInviteCodeInput('');
          
          // 🔥 关键修复：兑换成功后，主动从后端拉取最新数据
          if (refreshPoints) {
            await refreshPoints(); // 从后端重新获取玫瑰/积分
          }
          updateHeaderData(); // 再更新本地显示
          
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

  // 渲染部分（🔥 补全所有截断代码，修复PointsManager调用）
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
            逸潇次元拍・体验版
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
                    <Link to="/create-template" className={`flex items-center space-x-1.5 transition-colors py-2 border-b-2 ${location.pathname === '/create-template' ? 'text-indigo-600 border-indigo-600' : 'border-transparent hover:text-indigo-600'}`}>
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.3} d="M12 4v16m8-8H4" /></svg>
             <span>制作模版</span>
          </Link>
        </nav>

        {/* User Area（🔥 修改PLUS按钮点击事件，补全截断代码） */}
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
              {/* 🔥 核心修复：完整传递PointsManager所需的所有Props */}
              <PointsManager 
                profile={{
                  ...profile,
                  crystalRoses: localProfile?.crystalRoses || 0
                }}
                profileLoading={profileLoading}
                claimCredits={handleClaimCredits}
                claimRose={handleClaimRose}
                deductCredits={deductCredits}
                deductRose={deductRose} // 传递扣减玫瑰方法
                claimLoading={claimLoading}
                refreshPoints={refreshPoints || (() => Promise.resolve())} // 兜底处理，避免undefined
              />

              {/* 🔥 核心修改：PLUS按钮点击跳转到订阅页面 */}
              <button
                onClick={handlePlusButtonClick}
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
                  <img 
                    src={localProfile?.avatar || 'https://yixiaostudio.tos-cn-beijing.volces.com/github-pages-templates/yixiaostudio.cn/Yixiao-Photo/female-avatar.png'} 
                    className="w-full h-full object-cover" 
                    alt="avatar" 
                  />
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
                                    <Link to="/create-template" onClick={() => setIsMenuOpen(false)} className="block px-5 py-2.5 text-sm font-black text-indigo-600 hover:bg-indigo-50">制作模版</Link>
                    
                    <Link to="/gallery" onClick={() => {
                      setIsMenuOpen(false);
                      resetInviteState();
                    }} className="block px-5 py-2.5 text-sm font-black text-gray-700 hover:bg-gray-50">我的画廊</Link>
                    
                    <div className="px-5 py-3 border-t border-gray-50">
                      <p className="text-sm font-black text-gray-700 mb-3">令牌兑换</p>
                      
                      {/* 新增：兑换类型选择下拉框 */}
                      <div className="mb-3">
                        <select
                          value={exchangeType}
                          onChange={handleExchangeTypeChange}
                          disabled={inviteLoading}
                          className="w-full px-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        >
                          <option value="credits">积分令牌</option>
                          <option value="rose">玫瑰令牌</option>
                        </select>
                      </div>
                      
                      <input
                        type="text"
                        value={inviteCodeInput}
                        onChange={handleInviteCodeChange}
                        placeholder={`请输入${exchangeType === 'credits' ? '积分' : '玫瑰'}兑换令牌`}
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
                          `兑换${exchangeType === 'credits' ? '积分' : '玫瑰'}`
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

      {/* 🔥 移除PLUS订阅模态框代码 */}

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
        .glass-effect {
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
        }
      `}</style>
    </header>
  );
};

export default Header;