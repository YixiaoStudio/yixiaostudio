import React, { useState, useMemo, useEffect } from 'react';
import { TabType } from './types';
import Navigation from './components/Navigation';
import ToolGrid from './components/ToolGrid';
import UserPoolView from './components/UserPoolView';
import ForumView from './components/ForumView';
import NewsView from './components/NewsView';
import FavoritesView from './components/FavoritesView';
import FeaturedArtifactsView from './components/FeaturedArtifactsView';
import { POPULAR_TOOLS, FEATURED_ARTIFACTS_TOOLS } from './constants';

const getHandDrawnIcon = (slug: string) => `https://img.icons8.com/doodle/96/${slug}.png`;
// 后端接口地址（替换成你的Flask服务地址，生产环境改线上地址）
const API_BASE_URL = 'http://127.0.0.1:5000';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>(TabType.HOME);
  const [searchQuery, setSearchQuery] = useState('');
  const [showRankingModal, setShowRankingModal] = useState(false);
  const [clickCounts, setClickCounts] = useState<Record<string, number>>({});
  const [userPoints] = useState(1250);

  // 新增：登录/注册相关状态
  const [showAuthModal, setShowAuthModal] = useState(false); // 登录注册模态框显示状态
  const [isRegisterMode, setIsRegisterMode] = useState(false); // 切换登录/注册模式
  const [authForm, setAuthForm] = useState({
    // 注册表单
    username: '',
    email: '',
    password: '',
    // 登录表单
    account: '',
    loginPassword: ''
  });
  const [authMessage, setAuthMessage] = useState(''); // 登录注册提示信息
  const [authMessageType, setAuthMessageType] = useState<'success' | 'error'>('error'); // 提示类型（成功/失败）
  const [authLoading, setAuthLoading] = useState(false); // 请求加载状态
  const [currentUser, setCurrentUser] = useState<any>(null); // 登录后的用户信息

  // 新增：邮箱验证相关状态
  const [showVerifyModal, setShowVerifyModal] = useState(false); // 邮箱验证模态框
  const [verifyCode, setVerifyCode] = useState(''); // 验证码输入
  const [verifyMessage, setVerifyMessage] = useState(''); // 验证提示信息
  const [verifyMessageType, setVerifyMessageType] = useState<'success' | 'error'>('error'); // 验证提示类型
  const [verifyLoading, setVerifyLoading] = useState(false); // 验证请求加载状态
  const [currentVerifyEmail, setCurrentVerifyEmail] = useState(''); // 当前需要验证的邮箱

  // 初始化：从本地存储读取登录状态
  useEffect(() => {
    const savedCounts = localStorage.getItem('yixiao_ai_tool_clicks');
    if (savedCounts) setClickCounts(JSON.parse(savedCounts));

    // 读取登录用户信息/Token
    const savedUser = localStorage.getItem('yixiao_ai_user');
    if (savedUser) setCurrentUser(JSON.parse(savedUser));
  }, []);

  // 排行榜逻辑（原有）
  const topTenTools = useMemo(() => {
    const allTools = [...POPULAR_TOOLS, ...FEATURED_ARTIFACTS_TOOLS];
    return allTools
      .sort((a, b) => (clickCounts[b.id] || 0) - (clickCounts[a.id] || 0))
      .slice(0, 10);
  }, [clickCounts]);
  const maxClicks = Math.max(...(Object.values(clickCounts) as number[]), 1);

  // 新增：表单输入变化处理
  const handleAuthInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAuthForm(prev => ({ ...prev, [name]: value }));
    setAuthMessage(''); // 清空提示
  };

  // 修改：验证码输入处理（限制6位数字）
  const handleVerifyCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // 只保留数字，且长度不超过6位
    const filteredValue = value.replace(/[^0-9]/g, '').slice(0, 6);
    setVerifyCode(filteredValue);
    setVerifyMessage(''); // 清空验证提示
  };

  // 新增：注册接口请求（优化，处理邮箱验证提示）
  const handleRegister = async () => {
    const { username, email, password } = authForm;
    // 表单验证
    if (!username || !email || !password) {
      setAuthMessage('请填写完整的注册信息！');
      setAuthMessageType('error');
      return;
    }

    setAuthLoading(true);
    setAuthMessage('');
    try {
      const response = await fetch(`${API_BASE_URL}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // 新增：允许跨域携带凭证
        body: JSON.stringify({ username, email, password })
      });
      const data = await response.json();

      if (data.code === 200) {
        setAuthMessage(data.msg);
        setAuthMessageType('success'); // 成功提示（绿色）
        // 清空注册表单
        setAuthForm(prev => ({ ...prev, username: '', email: '', password: '' }));
        // 如果是注册成功且需要验证，自动记录邮箱并提示
        if (data.msg.includes('请查收邮箱')) {
          setCurrentVerifyEmail(email);
          // 3秒后自动显示验证模态框（可选）
          setTimeout(() => {
            setShowAuthModal(false);
            setShowVerifyModal(true);
          }, 3000);
        } else {
          // 切换到登录模式
          setTimeout(() => setIsRegisterMode(false), 2000);
        }
      } else {
        setAuthMessage(data.msg || '注册失败');
        setAuthMessageType('error');
      }
    } catch (error) {
      setAuthMessage('网络错误，请检查后端服务是否运行');
      setAuthMessageType('error');
    } finally {
      setAuthLoading(false);
    }
  };

  // 新增：登录接口请求（优化，处理未验证邮箱）
  const handleLogin = async () => {
    const { account, loginPassword } = authForm;
    // 表单验证
    if (!account || !loginPassword) {
      setAuthMessage('请填写账号和密码！');
      setAuthMessageType('error');
      return;
    }

    setAuthLoading(true);
    setAuthMessage('');
    try {
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // 新增：允许跨域携带凭证
        body: JSON.stringify({ account, password: loginPassword })
      });
      const data = await response.json();

      if (data.code === 200) {
        // 登录成功：保存用户信息到本地存储
        setCurrentUser(data.data);
        localStorage.setItem('yixiao_ai_user', JSON.stringify(data.data));
        setAuthMessage('登录成功！');
        setAuthMessageType('success');
        // 关闭模态框
        setTimeout(() => setShowAuthModal(false), 1000);
      } else if (data.code === 403 && data.msg.includes('邮箱尚未验证')) {
        // 未验证邮箱：显示提示并记录邮箱
        setAuthMessage(data.msg);
        setAuthMessageType('error');
        setCurrentVerifyEmail(data.data?.email || account);
        // 3秒后自动显示验证模态框
        setTimeout(() => {
          setShowVerifyModal(true);
        }, 3000);
      } else {
        setAuthMessage(data.msg || '登录失败');
        setAuthMessageType('error');
      }
    } catch (error) {
      setAuthMessage('网络错误，请检查后端服务是否运行');
      setAuthMessageType('error');
    } finally {
      setAuthLoading(false);
    }
  };

  // 修改：邮箱验证接口请求（增加6位数字校验）
  const handleVerifyEmail = async () => {
    // 新增：校验6位数字格式
    if (!verifyCode || verifyCode.length !== 6 || !/^\d{6}$/.test(verifyCode)) {
      setVerifyMessage('请输入有效的6位数字验证码！');
      setVerifyMessageType('error');
      return;
    }

    setVerifyLoading(true);
    setVerifyMessage('');
    try {
      const response = await fetch(`${API_BASE_URL}/api/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ code: verifyCode })
      });
      const data = await response.json();

      if (data.code === 200) {
        setVerifyMessage(data.msg);
        setVerifyMessageType('success');
        setVerifyCode('');
        // 验证成功后关闭模态框，提示登录
        setTimeout(() => {
          setShowVerifyModal(false);
          setShowAuthModal(true);
          setIsRegisterMode(false);
          setAuthMessage('邮箱验证成功，请登录！');
          setAuthMessageType('success');
        }, 2000);
      } else {
        setVerifyMessage(data.msg || '验证失败');
        setVerifyMessageType('error');
      }
    } catch (error) {
      setVerifyMessage('网络错误，请检查后端服务是否运行');
      setVerifyMessageType('error');
    } finally {
      setVerifyLoading(false);
    }
  };

  // 新增：重新发送验证邮件（可选，如需实现需后端配合）
  const handleResendVerifyEmail = async () => {
    // 这里需要后端新增 /api/resend-verify-email 接口
    setVerifyMessage('正在重新发送邮件...');
    setVerifyMessageType('success');
    try {
      const response = await fetch(`${API_BASE_URL}/api/resend-verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: currentVerifyEmail })
      });
      const data = await response.json();
      if (data.code === 200) {
        setVerifyMessage('验证邮件已重新发送，请查收！');
        setVerifyMessageType('success');
      } else {
        setVerifyMessage(data.msg || '邮件发送失败');
        setVerifyMessageType('error');
      }
    } catch (error) {
      setVerifyMessage('网络错误，发送失败');
      setVerifyMessageType('error');
    }
  };

  // 新增：退出登录
  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('yixiao_ai_user');
  };

  // 页面内容渲染（原有）
  const renderContent = () => {
    switch (activeTab) {
      case TabType.HOME:
        return (
          <div className="space-y-12 pb-24">
            <section className="relative overflow-hidden bg-white px-8 py-16 md:py-20 rounded-[2.5rem] shadow-sm border border-gray-100">
              <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-indigo-50 rounded-full blur-3xl opacity-40"></div>
              <div className="relative z-10 max-w-4xl mx-auto text-center">
                <div className="inline-flex items-center space-x-2 px-4 py-2 mb-8 text-xs font-black tracking-[0.2em] text-indigo-600 bg-indigo-50 rounded-full border border-indigo-100">
                  <span className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse"></span>
                  <span>新工具！Typeless语音输入神器</span>
                </div>
                <h1 className="text-4xl md:text-7xl font-black text-slate-900 mb-8 leading-[1.1] tracking-tight">
                  发现 AI 的 <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-500">无限可能</span>
                </h1>
                <p className="text-lg md:text-xl text-slate-500 mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
                  逸潇AI 助手为您精选全球 50+ 顶级人工智能应用。从创意设计到代码编程，助您在 AI 浪潮中抢占先机。
                </p>
                <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
                  <button onClick={() => setActiveTab(TabType.USER_POOL)} className="px-10 py-5 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-200 transform hover:-translate-y-1 active:scale-95">查看用户自建池</button>
                  <button onClick={() => setActiveTab(TabType.NEWS)} className="px-10 py-5 bg-white text-slate-900 border-2 border-slate-50 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95">阅读行业新闻</button>
                </div>
              </div>
            </section>
            <ToolGrid searchQuery={searchQuery} />
          </div>
        );
      case TabType.FAVORITES: return <FavoritesView />;
      case TabType.FEATURED_ARTIFACTS: return <FeaturedArtifactsView />;
      case TabType.USER_POOL: return <UserPoolView />;
      case TabType.FORUM: return <ForumView />;
      case TabType.NEWS: return <NewsView />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#fafbfc] text-slate-900 flex">
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 md:ml-64 w-full pt-6 md:pt-10 px-4 md:px-10 pb-20 md:pb-10">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10 bg-white/50 backdrop-blur-sm p-4 rounded-[2rem] border border-white shadow-sm">
            <div className="flex-1 max-w-xl relative group">
              <input
                type="text"
                placeholder="搜索全球顶尖 AI 应用..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all group-hover:shadow-md text-gray-700 font-medium"
              />
              <img src={getHandDrawnIcon('search')} className="h-6 w-6 absolute left-4 top-3.5 opacity-50" alt="search" />
            </div>

            <div className="flex items-center space-x-3 self-end lg:self-auto overflow-x-auto pb-1 lg:pb-0">
              <button className="flex items-center space-x-2 px-4 py-3 bg-amber-50 text-amber-700 border border-amber-100 rounded-2xl font-black text-sm hover:bg-amber-100 transition-colors shrink-0">
                <img src={getHandDrawnIcon('coins')} className="w-7 h-7" alt="points" />
                <span>{userPoints.toLocaleString()} 贡献值</span>
              </button>

              <button
                onClick={() => setShowRankingModal(true)}
                className="flex items-center space-x-2 px-5 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-2xl font-black text-sm shadow-lg shadow-orange-100 hover:scale-105 active:scale-95 transition-all shrink-0"
              >
                <img
                  src="https://yixiaostudio.tos-cn-beijing.volces.com/github-pages-templates/yixiaostudio.cn/Yixiao-AI-Assistant/leaderboard.png"
                  className="w-7 h-7"
                  alt="ranking"
                />
                <span>排行榜</span>
              </button>

              {/* 修改：登录/注册按钮 - 已登录显示用户名，未登录显示登录按钮 */}
              {currentUser ? (
                <div className="flex items-center space-x-2 px-5 py-2 bg-slate-900 text-white rounded-2xl font-black text-sm shadow-lg shadow-slate-200 shrink-0">
                  <img src="https://yixiaostudio.tos-cn-beijing.volces.com/github-pages-templates/yixiaostudio.cn/Yixiao-AI-Assistant/user-login.png" className="w-8 h-8" alt="user" />
                  <span className="truncate max-w-[80px]">{currentUser.username}</span>
                  <button onClick={handleLogout} className="ml-2 p-1 hover:bg-slate-800 rounded-full">
                    <img src={getHandDrawnIcon('logout')} className="w-5 h-5" alt="logout" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="px-5 py-2 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 shrink-0 flex items-center space-x-2"
                >
                  <img src="https://yixiaostudio.tos-cn-beijing.volces.com/github-pages-templates/yixiaostudio.cn/Yixiao-AI-Assistant/user-login.png" className="w-8 h-8" alt="user" />
                  <span>登录 / 注册</span>
                </button>
              )}
            </div>
          </div>
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">{renderContent()}</div>
        </div>
      </main>

      {/* 排行榜模态框（原有） */}
      {showRankingModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-2xl shadow-2xl p-8 md:p-12 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center p-2">
                  <img src="https://yixiaostudio.tos-cn-beijing.volces.com/github-pages-templates/yixiaostudio.cn/Yixiao-AI-Assistant/leaderboard.png"
                   className="w-full h-full" alt="ranking-title" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-gray-900">全站热力排行榜</h3>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Top 10 AI Tools</p>
                </div>
              </div>
              <button onClick={() => setShowRankingModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <img src={getHandDrawnIcon('close-window')} className="h-8 w-8" alt="close" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
              {topTenTools.map((tool, index) => {
                const clicks = clickCounts[tool.id] || 0;
                const progress = (clicks / maxClicks) * 100;
                const isTopThree = index < 3;
                const badges = ['gold-medal', 'silver-medal', 'bronze-medal'];
                return (
                  <div key={tool.id} className={`flex items-center p-4 rounded-2xl transition-all border ${isTopThree ? 'bg-gradient-to-r from-orange-50/50 to-transparent border-orange-100 shadow-sm' : 'bg-slate-50 border-transparent hover:border-gray-200'}`}>
                    <div className="w-10 flex justify-center mr-2">
                      {isTopThree ? <img src={getHandDrawnIcon(badges[index])} className="w-8 h-8" alt="rank" /> : <span className="font-black text-gray-400">{index + 1}</span>}
                    </div>
                    <div className="w-14 h-14 bg-white rounded-xl shadow-sm flex items-center justify-center p-2 mr-4 shrink-0">
                      <img src={getHandDrawnIcon(tool.icon || 'idea')} className="w-full h-full object-contain" alt={tool.name} />
                    </div>
                    <div className="flex-1 min-w-0 mr-4">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-gray-900 truncate">{tool.name}</span>
                        <span className="text-[10px] font-black text-orange-600 bg-orange-100 px-2 py-0.5 rounded uppercase">{clicks} 热度</span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-1000 ${index < 3 ? 'bg-orange-500' : 'bg-slate-400'}`} style={{ width: `${Math.max(progress, 5)}%` }}></div>
                      </div>
                    </div>
                    <a href={tool.url} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-white border border-gray-200 text-gray-600 text-xs font-bold rounded-xl hover:bg-slate-900 hover:text-white transition-all shadow-sm">前往</a>
                  </div>
                );
              })}
            </div>
            <div className="mt-8 pt-6 border-t border-gray-100 text-center text-xs text-gray-400 font-medium tracking-wide">社区用户实时点击数据</div>
          </div>
        </div>
      )}

      {/* 登录/注册模态框（原有，优化提示样式） */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-md shadow-2xl p-8 md:p-10 animate-in zoom-in-95 duration-200 flex flex-col">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center p-2">
                  <img src="https://yixiaostudio.tos-cn-beijing.volces.com/github-pages-templates/yixiaostudio.cn/Yixiao-AI-Assistant/user-login.png"
                   className="w-full h-full" alt="auth-title" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-gray-900">{isRegisterMode ? '用户注册' : '用户登录'}</h3>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">欢迎使用逸潇AI助手</p>
                </div>
              </div>
              <button onClick={() => setShowAuthModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <img src={getHandDrawnIcon('close-window')} className="h-8 w-8" alt="close" />
              </button>
            </div>

            {/* 表单区域 */}
            <div className="flex-1 space-y-5">
              {/* 注册表单 */}
              {isRegisterMode && (
                <>
                  <div className="relative">
                    <input
                      type="text"
                      name="username"
                      value={authForm.username}
                      onChange={handleAuthInputChange}
                      placeholder="请输入用户名"
                      className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-gray-700 font-medium"
                    />
                    <img src={getHandDrawnIcon('user-male')} className="h-6 w-6 absolute left-4 top-4 opacity-50" alt="username" />
                  </div>
                  <div className="relative">
                    <input
                      type="email"
                      name="email"
                      value={authForm.email}
                      onChange={handleAuthInputChange}
                      placeholder="请输入邮箱"
                      className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-gray-700 font-medium"
                    />
                    <img src={getHandDrawnIcon('email')} className="h-6 w-6 absolute left-4 top-4 opacity-50" alt="email" />
                  </div>
                  <div className="relative">
                    <input
                      type="password"
                      name="password"
                      value={authForm.password}
                      onChange={handleAuthInputChange}
                      placeholder="请输入密码"
                      className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-gray-700 font-medium"
                    />
                    <img src={getHandDrawnIcon('lock')} className="h-6 w-6 absolute left-4 top-4 opacity-50" alt="password" />
                  </div>
                </>
              )}

              {/* 登录表单 */}
              {!isRegisterMode && (
                <>
                  <div className="relative">
                    <input
                      type="text"
                      name="account"
                      value={authForm.account}
                      onChange={handleAuthInputChange}
                      placeholder="用户名/邮箱"
                      className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-gray-700 font-medium"
                    />
                    <img src={getHandDrawnIcon('user-male')} className="h-6 w-6 absolute left-4 top-4 opacity-50" alt="account" />
                  </div>
                  <div className="relative">
                    <input
                      type="password"
                      name="loginPassword"
                      value={authForm.loginPassword}
                      onChange={handleAuthInputChange}
                      placeholder="请输入密码"
                      className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-gray-700 font-medium"
                    />
                    <img src={getHandDrawnIcon('lock')} className="h-6 w-6 absolute left-4 top-4 opacity-50" alt="password" />
                  </div>
                </>
              )}

              {/* 提示信息（优化样式：成功绿色，失败红色） */}
              {authMessage && (
                <div className={`text-sm font-medium text-center mt-2 ${authMessageType === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                  {authMessage}
                </div>
              )}

              {/* 提交按钮 */}
              <button
                onClick={isRegisterMode ? handleRegister : handleLogin}
                disabled={authLoading}
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-200 transform hover:-translate-y-1 active:scale-95 disabled:opacity-70 disabled:pointer-events-none"
              >
                {authLoading ? (
                  <div className="flex items-center justify-center">
                    <img src={getHandDrawnIcon('loading')} className="h-5 w-5 mr-2 animate-spin" alt="loading" />
                    处理中...
                  </div>
                ) : (
                  isRegisterMode ? '完成注册' : '立即登录'
                )}
              </button>

              {/* 切换登录/注册 */}
              <div className="text-center mt-4 text-sm text-gray-500 font-medium">
                {isRegisterMode ? (
                  <>
                    已有账号？
                    <button onClick={() => {
                      setIsRegisterMode(false);
                      setAuthMessage('');
                    }} className="text-indigo-600 font-bold ml-1 hover:underline">
                      立即登录
                    </button>
                  </>
                ) : (
                  <>
                    还没有账号？
                    <button onClick={() => {
                      setIsRegisterMode(true);
                      setAuthMessage('');
                    }} className="text-indigo-600 font-bold ml-1 hover:underline">
                      注册账号
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 修改：邮箱验证模态框（适配6位数字验证码） */}
      {showVerifyModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[101] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-md shadow-2xl p-8 md:p-10 animate-in zoom-in-95 duration-200 flex flex-col">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center p-2">
                  <img src={getHandDrawnIcon('email')} className="w-full h-full" alt="verify-title" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-gray-900">邮箱验证</h3>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Verify Your Email</p>
                </div>
              </div>
              <button onClick={() => setShowVerifyModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <img src={getHandDrawnIcon('close-window')} className="h-8 w-8" alt="close" />
              </button>
            </div>

            {/* 验证表单区域 */}
            <div className="flex-1 space-y-5">
              {/* 修改：提示文案改为6位数字 */}
              <div className="text-center text-sm text-gray-600 font-medium">
                请输入发送到 <span className="text-indigo-600 font-bold">{currentVerifyEmail}</span> 的6位数字验证码（15分钟内有效）
              </div>

              {/* 修改：验证码输入框（限制6位数字） */}
              <div className="relative">
                <input
                  type="text"
                  value={verifyCode}
                  onChange={handleVerifyCodeChange}
                  placeholder="请输入6位数字验证码（邮件中获取）"
                  pattern="^\d{6}$"  // 新增：浏览器原生数字验证
                  title="请输入6位数字验证码"  // 新增：验证提示
                  className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all text-gray-700 font-medium"
                  maxLength={6}  // 新增：限制最大长度
                  inputMode="numeric"  // 新增：移动端弹出数字键盘
                />
                <img src={getHandDrawnIcon('key')} className="h-6 w-6 absolute left-4 top-4 opacity-50" alt="verify-code" />
              </div>

              {/* 验证提示信息 */}
              {verifyMessage && (
                <div className={`text-sm font-medium text-center mt-2 ${verifyMessageType === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                  {verifyMessage}
                </div>
              )}

              {/* 验证按钮 */}
              <button
                onClick={handleVerifyEmail}
                disabled={verifyLoading}
                className="w-full py-4 bg-green-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-green-700 transition-all shadow-2xl shadow-green-200 transform hover:-translate-y-1 active:scale-95 disabled:opacity-70 disabled:pointer-events-none"
              >
                {verifyLoading ? (
                  <div className="flex items-center justify-center">
                    <img src={getHandDrawnIcon('loading')} className="h-5 w-5 mr-2 animate-spin" alt="loading" />
                    验证中...
                  </div>
                ) : (
                  '验证邮箱'
                )}
              </button>

              {/* 重新发送邮件（可选） */}
              <button
                onClick={handleResendVerifyEmail}
                className="w-full py-3 bg-white text-green-600 border border-green-200 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-green-50 transition-all"
              >
                重新发送验证邮件
              </button>

              {/* 帮助提示 */}
              <div className="text-center text-xs text-gray-500 font-medium">
                未收到邮件？请检查垃圾邮件箱，或确认邮箱地址正确
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;