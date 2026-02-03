import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import TemplateDetail from './pages/TemplateDetail';
import MyGallery from './pages/MyGallery';
import Community from './pages/Community';
import Profile from './pages/Profile';
import Tasks from './pages/Tasks';
import TravelMap from './pages/TravelMap';
import Header from './components/Header';
// 导入积分类型
import { PointsProfile } from './components/PointsManager';

// ========== 新增：创建积分刷新Context（供跨组件触发刷新） ==========
export const PointsRefreshContext = createContext<{
  refreshPoints: () => Promise<void>;
}>({ refreshPoints: async () => { } });

// 1. 保留能正常登录的后端接口地址
const API_BASE_URL = 'https://sd5r3ie17n7a7iuta91j0.apigateway-cn-beijing.volceapi.com';
// 2. 积分接口地址（替换为火山引擎实际地址）
const POINTS_API_BASE_URL = 'https://sd5r3ie17n7a7iuta91j0.apigateway-cn-beijing.volceapi.com/api/points';

// ========== 新增：生成图片类型枚举（便于区分单张/九宫格） ==========
export type GenerateType = 'single' | 'grid9';

// ========== 新增：邮箱格式验证工具函数 ==========
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
  return emailRegex.test(email);
};

// ========== 提取独立的登录/注册模态框组件 ==========
const AuthModal = React.memo(({
  isRegisterMode,
  authForm,
  authMessage,
  authMessageType,
  authLoading,
  onInputChange,
  onRegister,
  onLogin,
  onSwitchMode,
  onClose
}) => (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl w-full max-w-md p-8 shadow-2xl">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold">{isRegisterMode ? '用户注册' : '用户登录'}</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-xl">×</button>
      </div>

      {isRegisterMode ? (
        <div className="space-y-4 mb-4">
          <input
            type="text"
            name="username"
            value={authForm.username}
            onChange={onInputChange}
            placeholder="用户名"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoComplete="off"
          />
          <div className="relative">
            <input
              type="email"
              name="email"
              value={authForm.email}
              onChange={onInputChange}
              placeholder="邮箱"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${authForm.email && !isValidEmail(authForm.email)
                  ? 'border-red-500 focus:ring-red-500'
                  : 'focus:ring-blue-500'
                }`}
              autoComplete="off"
            />
            {/* 新增：邮箱格式错误提示 */}
            {authForm.email && !isValidEmail(authForm.email) && (
              <p className="absolute -bottom-5 left-0 text-xs text-red-500">请输入有效的邮箱地址</p>
            )}
          </div>
          <input
            type="password"
            name="password"
            value={authForm.password}
            onChange={onInputChange}
            placeholder="密码"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoComplete="new-password"
          />
        </div>
      ) : (
        <div className="space-y-4 mb-4">
          <input
            type="text"
            name="account"
            value={authForm.account}
            onChange={onInputChange}
            placeholder="用户名/邮箱"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoComplete="off"
          />
          <input
            type="password"
            name="loginPassword"
            value={authForm.loginPassword}
            onChange={onInputChange}
            placeholder="密码"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoComplete="current-password"
          />
        </div>
      )}

      {authMessage && (
        <div className={`text-sm text-center mb-4 ${authMessageType === 'success' ? 'text-green-600' : 'text-red-600'}`}>
          {authMessage}
        </div>
      )}

      <button
        onClick={isRegisterMode ? onRegister : onLogin}
        disabled={authLoading}
        className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-70"
      >
        {authLoading ? '处理中...' : (isRegisterMode ? '注册' : '登录')}
      </button>

      <div className="text-center mt-4 text-sm">
        {isRegisterMode ? (
          <>已有账号？<button onClick={onSwitchMode} className="text-blue-600 ml-1">登录</button></>
        ) : (
          <>没有账号？<button onClick={onSwitchMode} className="text-blue-600 ml-1">注册</button></>
        )}
      </div>
    </div>
  </div>
));

// ========== 提取独立的邮箱验证模态框组件 ==========
const VerifyModal = React.memo(({
  verifyCode,
  verifyMessage,
  verifyMessageType,
  verifyLoading,
  currentVerifyEmail,
  onCodeChange,
  onVerify,
  onClose
}) => (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl w-full max-w-md p-8 shadow-2xl">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold">邮箱验证</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-xl">×</button>
      </div>
      <div className="text-center text-sm mb-4">
        请输入发送到 <span className="text-blue-600 font-bold">{currentVerifyEmail}</span> 的6位验证码
      </div>
      <input
        type="text"
        value={verifyCode}
        onChange={onCodeChange}
        placeholder="6位数字验证码"
        maxLength={6}
        inputMode="numeric"
        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 mb-4"
        autoComplete="off"
      />
      {verifyMessage && (
        <div className={`text-sm text-center mb-4 ${verifyMessageType === 'success' ? 'text-green-600' : 'text-red-600'}`}>
          {verifyMessage}
        </div>
      )}
      <button
        onClick={onVerify}
        disabled={verifyLoading}
        className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-70"
      >
        {verifyLoading ? '验证中...' : '验证邮箱'}
      </button>
    </div>
  </div>
));

// ========== 工具函数：调用积分接口（修复CORS + 避免缓存） ==========
const requestPointsApi = async (userId: number, url: string, options: RequestInit = {}) => {
  try {
    // 核心修复1：将userId转为字符串，避免数字类型传递问题
    const userIdStr = String(userId);
    // 核心修复2：加随机时间戳参数避免缓存（替代cache-control请求头）
    const timestamp = new Date().getTime();
    // 拼接URL：userId + 时间戳（避免缓存）
    const fullUrl = `${POINTS_API_BASE_URL}${url}?userId=${userIdStr}&t=${timestamp}`;
    console.log(`调用积分接口：${fullUrl}`); // 新增日志，便于排查

    const res = await fetch(fullUrl, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        // 核心修复3：移除导致CORS错误的请求头（cache-control/pragma/expires）
        ...options.headers
      },
      cache: 'no-cache', // 简化缓存配置，避免触发CORS
      credentials: 'include' // 确保跨域请求携带凭证
    });

    const data = await res.json();
    console.log(`积分接口返回：`, data); // 新增日志，便于排查
    return data;
  } catch (error) {
    console.error('积分接口请求失败:', error);
    return { success: false, msg: '网络错误，请重试' };
  }
};

// ========== 主App组件 ==========
const App: React.FC = () => {
  // ===== 登录相关状态（移除Token相关） =====
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [authForm, setAuthForm] = useState({
    username: '',
    email: '',
    password: '',
    account: '',
    loginPassword: ''
  });
  const [authMessage, setAuthMessage] = useState('');
  const [authMessageType, setAuthMessageType] = useState<'success' | 'error'>('error');
  const [authLoading, setAuthLoading] = useState(false);

  // 邮箱验证相关状态
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyCode, setVerifyCode] = useState('');
  const [verifyMessage, setVerifyMessage] = useState('');
  const [verifyMessageType, setVerifyMessageType] = useState<'success' | 'error'>('error');
  const [currentVerifyEmail, setCurrentVerifyEmail] = useState('');
  const [verifyLoading, setVerifyLoading] = useState(false);

  // ========== 积分状态管理（对接后端） ==========
  const [profile, setProfile] = useState<PointsProfile>({
    points: 0,
    credits: 0,
    crystalRoses: 0,
    lastRoseClaimDate: '',
    lastCreditsClaimDate: '',
    isPlusMember: false
  });
  const [profileLoading, setProfileLoading] = useState(false);

  // ===== 从后端获取积分数据（核心优化：增加日志 + 容错） =====
  const fetchProfile = useCallback(async () => {
    if (!currentUser?.id) {
      console.log('currentUser.id为空：', currentUser); // 显示完整的currentUser，便于排查
      return;
    }

    // 新增日志：确认当前传递的userId
    console.log('当前登录用户ID：', currentUser.id);
    setProfileLoading(true);

    try {
      const res = await requestPointsApi(currentUser.id, '/profile');
      if (res.success) {
        setProfile(res.data);
        console.log('积分数据更新为：', res.data);
      } else {
        alert(res.msg || '获取积分失败');
      }
    } catch (error) {
      console.error('拉取积分失败：', error);
      alert('获取积分失败，请重试');
    } finally {
      setProfileLoading(false);
    }
  }, [currentUser]);

  // ========== 核心新增：暴露给Context的刷新积分函数 ==========
  const refreshPoints = useCallback(async () => {
    console.log('触发积分刷新...');
    await fetchProfile();
  }, [fetchProfile]);

  // ===== 领取积分（新增：调用后端领取接口） =====
  const claimCredits = useCallback(async () => {
    if (!currentUser?.id) {
      alert('请先登录');
      return;
    }
    const res = await requestPointsApi(currentUser.id, '/claim-credits', {
      method: 'POST'
    });
    if (res.success) {
      alert(res.msg);
      await fetchProfile(); // 领取成功后强制刷新积分
    } else {
      alert(res.msg);
    }
  }, [currentUser, fetchProfile]);

  // ===== 领取玫瑰（新增：调用后端领取接口） =====
  const claimRose = useCallback(async () => {
    if (!currentUser?.id) {
      alert('请先登录');
      return;
    }
    const res = await requestPointsApi(currentUser.id, '/claim-rose', {
      method: 'POST'
    });
    if (res.success) {
      alert(res.msg);
      await fetchProfile(); // 领取成功后强制刷新积分
    } else {
      alert(res.msg);
    }
  }, [currentUser, fetchProfile]);

  // ========== 核心修改1：扣减玫瑰接口（新增） ==========
  const deductRose = useCallback(async () => {
    if (!currentUser?.id) {
      alert('请先登录');
      return false;
    }
    const res = await requestPointsApi(currentUser.id, '/deduct-rose', {
      method: 'POST',
      body: JSON.stringify({ num: 1 }) // 固定扣1个玫瑰
    });
    if (res.success) {
      await fetchProfile(); // 扣减成功后刷新积分
      return true;
    } else {
      alert(res.msg);
      return false;
    }
  }, [currentUser, fetchProfile]);

  // ========== 核心修改2：重构扣减积分函数（支持玫瑰/PLUS判断） ==========
  const deductCredits = useCallback(async (num = 1) => {
    if (!currentUser?.id) {
      alert('请先登录');
      return false;
    }
    const res = await requestPointsApi(currentUser.id, '/deduct-credits', {
      method: 'POST',
      body: JSON.stringify({ num })
    });
    if (res.success) {
      await fetchProfile(); // 扣减成功后强制刷新积分
      return true;
    } else {
      alert(res.msg);
      return false;
    }
  }, [currentUser, fetchProfile]);

  // ========== 核心新增：生成图片主逻辑（单张/九宫格） ==========
  const handleGenerateImage = useCallback(async (type: GenerateType): Promise<boolean> => {
    // 1. 未登录：强制弹出登录框
    if (!currentUser?.id) {
      setShowAuthModal(true);
      return false;
    }

    // 2. 生成单张图片：直接扣1 credits
    if (type === 'single') {
      if (profile.credits < 1) {
        alert('当前credits不足，无法生成单张图片！');
        return false;
      }
      return await deductCredits(1);
    }

    // 3. 生成九宫格：优先扣玫瑰 → 非PLUS会员禁止 → 扣9 credits
    if (type === 'grid9') {
      // 3.1 有玫瑰：优先扣1个玫瑰
      if (profile.crystalRoses > 0) {
        const roseDeducted = await deductRose();
        if (roseDeducted) {
          alert('使用1个水晶玫瑰免费生成九宫格！');
        }
        return roseDeducted;
      }

      // 3.2 无玫瑰：检查PLUS会员
      if (!profile.isPlusMember) {
        alert('当前无水晶玫瑰且未开通PLUS会员，无法生成九宫格！\n可领取每日玫瑰或开通PLUS会员后重试。');
        return false;
      }

      // 3.3 有PLUS会员：扣9 credits
      if (profile.credits < 9) {
        alert('当前credits不足9个，无法生成九宫格！');
        return false;
      }
      const creditsDeducted = await deductCredits(9);
      if (creditsDeducted) {
        alert('已扣减9个credits生成九宫格（PLUS会员特权）！');
      }
      return creditsDeducted;
    }

    return false;
  }, [currentUser, profile, deductCredits, deductRose]);

  // ===== 初始化：读取登录状态 + 加载积分 =====
  useEffect(() => {
    // 1. 读取登录状态（只存用户信息，不存Token）
    const savedUser = localStorage.getItem('ai_photo_generator_user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        // 核心修复：统一用户ID字段名（兼容user_id和id）
        const userData = {
          ...parsedUser,
          id: parsedUser.id || parsedUser.user_id // 优先用id，没有则用user_id
        };
        setCurrentUser(userData);
        console.log('从本地存储加载用户：', userData);
        console.log('当前用户ID：', userData.id); // 新增日志，确认ID有值
      } catch (error) {
        console.error('解析本地用户信息失败：', error);
        localStorage.removeItem('ai_photo_generator_user');
      }
    } else {
      // 未登录：初始化游客积分
      setProfile({
        points: 0,
        credits: 0,
        crystalRoses: 0,
        lastRoseClaimDate: '',
        lastCreditsClaimDate: '',
        isPlusMember: false
      });
    }
  }, []);

  // ===== 用户ID变化时：只初始化拉取一次积分（核心修改：移除定时轮询） =====
  useEffect(() => {
    if (currentUser?.id) {
      // 核心修改1：仅登录/用户ID变化时拉取一次积分，取消定时轮询
      fetchProfile();
    } else {
      // 退出登录：重置积分状态
      setProfile({
        points: 0,
        credits: 0,
        crystalRoses: 0,
        lastRoseClaimDate: '',
        lastCreditsClaimDate: '',
        isPlusMember: false
      });
    }
    // 核心修改2：移除定时器相关逻辑（无需清除，因为没创建）
  }, [currentUser, fetchProfile]);

  // ========== 核心新增：监听localStorage变化，触发积分刷新 ==========
  // App.tsx 中修复storage监听
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      // 关键：加判断，只处理「其他页面」触发的事件，忽略当前页面的修改
      if (e.key === 'ai_points_need_refresh' && e.newValue && e.storageArea === localStorage) {
        console.log('监听到积分刷新标记，触发刷新');
        // 先执行刷新，再清除标记（且清除时避免触发自身）
        refreshPoints().finally(() => {
          // 临时移除监听，避免removeItem触发循环
          window.removeEventListener('storage', handleStorageChange);
          localStorage.removeItem('ai_points_need_refresh');
          // 重新添加监听
          window.addEventListener('storage', handleStorageChange);
        });
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [refreshPoints]);

  // ===== 稳定的事件处理函数 =====
  const handleAuthInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAuthForm(prev => ({ ...prev, [name]: value }));
    setAuthMessage('');
    // 新增：输入日志，排查用户实际输入内容
    console.log(`输入框[${name}]值变更为：${value}`);
  }, []);

  const handleVerifyCodeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
    setVerifyCode(value);
    setVerifyMessage('');
  }, []);

  const handleSwitchAuthMode = useCallback(() => {
    setIsRegisterMode(prev => !prev);
    setAuthMessage('');
    // 新增：切换模式时清空表单，避免输入残留
    setAuthForm(prev => ({
      ...prev,
      username: '',
      email: '',
      password: '',
      account: '',
      loginPassword: ''
    }));
  }, []);

  // ===== 注册接口（核心修复：增加前端邮箱验证 + 详细日志） =====
  const handleRegister = useCallback(async () => {
    const { username, email, password } = authForm;

    // 新增1：前端邮箱格式验证
    if (!username) {
      setAuthMessage('请输入用户名！');
      setAuthMessageType('error');
      return;
    }
    if (!email) {
      setAuthMessage('请输入邮箱！');
      setAuthMessageType('error');
      return;
    }
    if (!isValidEmail(email)) {
      setAuthMessage('请输入有效的邮箱地址！');
      setAuthMessageType('error');
      return;
    }
    if (!password || password.length < 6) {
      setAuthMessage('密码长度不能少于6位！');
      setAuthMessageType('error');
      return;
    }

    // 新增2：注册参数日志，排查传参问题
    console.log('注册请求参数：', { username, email, password_length: password.length });

    setAuthLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, email, password })
      });
      const data = await response.json();

      if (data.code === 200) {
        setAuthMessage(data.msg);
        setAuthMessageType('success');
        setAuthForm(prev => ({ ...prev, username: '', email: '', password: '' }));
        if (data.msg.includes('请查收邮箱')) {
          setCurrentVerifyEmail(email);
          setTimeout(() => {
            setShowAuthModal(false);
            setShowVerifyModal(true);
          }, 3000);
        } else {
          setTimeout(() => setIsRegisterMode(false), 2000);
        }
      } else {
        setAuthMessage(data.msg || '注册失败');
        setAuthMessageType('error');
      }
    } catch (error) {
      setAuthMessage('网络错误，请检查后端服务');
      setAuthMessageType('error');
    } finally {
      setAuthLoading(false);
    }
  }, [authForm]);

  // ===== 登录接口（核心修复：统一用户ID字段名 + 登录后立即拉取积分） =====
  const handleLogin = useCallback(async () => {
    const { account, loginPassword } = authForm;
    if (!account || !loginPassword) {
      setAuthMessage('请填写账号和密码！');
      setAuthMessageType('error');
      return;
    }

    setAuthLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ account, password: loginPassword })
      });
      const data = await response.json();

      if (data.code === 200) {
        // 核心修复：统一用户ID字段名（兼容user_id和id）
        const userData = {
          ...data.data,
          id: data.data.id || data.data.user_id // 优先用id，没有则用user_id
        };
        // 存储修复后的用户信息
        setCurrentUser(userData);
        localStorage.setItem('ai_photo_generator_user', JSON.stringify(userData));

        // 登录成功后立即拉取最新积分
        await fetchProfile();

        setAuthMessage('登录成功！');
        setAuthMessageType('success');
        setTimeout(() => setShowAuthModal(false), 1000);
      } else if (data.code === 403 && data.msg.includes('邮箱尚未验证')) {
        setAuthMessage(data.msg);
        setAuthMessageType('error');
        setCurrentVerifyEmail(data.data?.email || account);
        setTimeout(() => setShowVerifyModal(true), 3000);
      } else {
        setAuthMessage(data.msg || '登录失败');
        setAuthMessageType('error');
      }
    } catch (error) {
      setAuthMessage('网络错误，请检查后端服务');
      setAuthMessageType('error');
    } finally {
      setAuthLoading(false);
    }
  }, [authForm, fetchProfile]); // 新增fetchProfile依赖

  // ===== 邮箱验证接口（保留原有逻辑） =====
  const handleVerifyEmail = useCallback(async () => {
    if (!verifyCode || verifyCode.length !== 6 || !/^\d{6}$/.test(verifyCode)) {
      setVerifyMessage('请输入6位数字验证码！');
      setVerifyMessageType('error');
      return;
    }

    setVerifyLoading(true);
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
        setTimeout(() => {
          setShowVerifyModal(false);
          setShowAuthModal(true);
          setIsRegisterMode(false);
          setAuthMessage('验证成功，请登录！');
          setAuthMessageType('success');
        }, 2000);
      } else {
        setVerifyMessage(data.msg || '验证失败');
        setVerifyMessageType('error');
      }
    } catch (error) {
      setVerifyMessage('网络错误，请检查后端服务');
      setVerifyMessageType('error');
    } finally {
      setVerifyLoading(false);
    }
  }, [verifyCode]);

  // ===== 退出登录（移除Token清除） =====
  const handleLogout = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem('ai_photo_generator_user');

    // 退出登录后重置积分状态为游客模式
    setProfile({
      points: 0,
      credits: 0,
      crystalRoses: 0,
      lastRoseClaimDate: '',
      lastCreditsClaimDate: '',
      isPlusMember: false
    });
  }, []);

  // ===== 渲染 =====
  return (
    <PointsRefreshContext.Provider value={{ refreshPoints }}>
      <HashRouter>
        <div className="min-h-screen flex flex-col">
          {/* 传递积分相关props给Header（扩展：新增生成图片函数） */}
          <Header
            currentUser={currentUser}
            profile={profile}
            profileLoading={profileLoading}
            claimCredits={claimCredits}    // 领取积分函数
            claimRose={claimRose}          // 领取玫瑰函数
            deductCredits={deductCredits}  // 扣减积分函数
            handleGenerateImage={handleGenerateImage} // 新增：生成图片主函数
            onLoginClick={() => setShowAuthModal(true)}
            onLogoutClick={handleLogout}
          />
          <main className="flex-grow">
            <Routes>
              {/* 传递生成图片函数给模板详情页（核心：让生成按钮调用此逻辑） */}
              <Route path="/" element={<Home />} />
              <Route path="/template/:id" element={<TemplateDetail handleGenerateImage={handleGenerateImage} profile={profile} />} />
              <Route path="/gallery" element={<MyGallery />} />
              <Route path="/community" element={<Community />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/map" element={<TravelMap />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
          <footer className="bg-white border-t py-8 text-center text-gray-500 text-sm">
            <p>© 2024 AI九宫格写真生成器 - 记录你的每一个闪光时刻</p>
          </footer>

          {/* 独立模态框组件 */}
          {showAuthModal && (
            <AuthModal
              isRegisterMode={isRegisterMode}
              authForm={authForm}
              authMessage={authMessage}
              authMessageType={authMessageType}
              authLoading={authLoading}
              onInputChange={handleAuthInputChange}
              onRegister={handleRegister}
              onLogin={handleLogin}
              onSwitchMode={handleSwitchAuthMode}
              onClose={() => setShowAuthModal(false)}
            />
          )}
          {showVerifyModal && (
            <VerifyModal
              verifyCode={verifyCode}
              verifyMessage={verifyMessage}
              verifyMessageType={verifyMessageType}
              verifyLoading={verifyLoading}
              currentVerifyEmail={currentVerifyEmail}
              onCodeChange={handleVerifyCodeChange}
              onVerify={handleVerifyEmail}
              onClose={() => setShowVerifyModal(false)}
            />
          )}
        </div>
      </HashRouter>
    </PointsRefreshContext.Provider>
  );
};

export default App;