import React, { useState, useEffect, useCallback } from 'react';
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

// 1. 保留能正常登录的后端接口地址
const API_BASE_URL = 'https://sd5r3ie17n7a7iuta91j0.apigateway-cn-beijing.volceapi.com/';
// 2. 积分接口地址（替换为火山引擎实际地址）
const POINTS_API_BASE_URL = 'https://sd5r3ie17n7a7iuta91j0.apigateway-cn-beijing.volceapi.com/api/points';

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
          <input 
            type="email" 
            name="email" 
            value={authForm.email} 
            onChange={onInputChange} 
            placeholder="邮箱" 
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoComplete="off"
          />
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

// ========== 工具函数：对比积分数据是否变化（核心新增） ==========
const isProfileChanged = (oldProfile: PointsProfile, newProfile: PointsProfile): boolean => {
  // 只对比核心数值字段，非数值字段（如日期）不敏感，可按需添加
  return (
    oldProfile.credits !== newProfile.credits ||
    oldProfile.crystalRoses !== newProfile.crystalRoses ||
    oldProfile.points !== newProfile.points ||
    oldProfile.isPlusMember !== newProfile.isPlusMember
  );
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

  // ===== 从后端获取积分数据（核心优化：仅数据变化时更新状态） =====
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
        // 核心修改：对比新旧数据，只有变化时才更新状态（避免无意义重渲染）
        if (isProfileChanged(profile, res.data)) {
          setProfile(res.data);
          console.log('积分数据发生变化，已更新：', res.data);
        } else {
          console.log('积分数据无变化，无需更新');
        }
      } else {
        alert(res.msg || '获取积分失败');
      }
    } catch (error) {
      console.error('拉取积分失败：', error);
      alert('获取积分失败，请重试');
    } finally {
      setProfileLoading(false);
    }
  }, [currentUser, profile]); // 依赖profile，用于对比数据变化

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
      await fetchProfile(); // 领取成功后主动刷新积分（此时数据一定会变）
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
      await fetchProfile(); // 领取成功后主动刷新积分
    } else {
      alert(res.msg);
    }
  }, [currentUser, fetchProfile]);

  // ===== 扣减积分（新增：生成单张图时调用） =====
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
      await fetchProfile(); // 扣减成功后主动刷新积分
      return true;
    } else {
      alert(res.msg);
      return false;
    }
  }, [currentUser, fetchProfile]);

  // 🔥 新增：扣减玫瑰（生成九宫格时调用）
  const deductRose = useCallback(async () => {
    if (!currentUser?.id) {
      alert('请先登录');
      return false;
    }
    const res = await requestPointsApi(currentUser.id, '/deduct-rose', {
      method: 'POST'
    });
    if (res.success) {
      await fetchProfile(); // 扣减成功后主动刷新积分/玫瑰
      return true;
    } else {
      alert(res.msg);
      return false;
    }
  }, [currentUser, fetchProfile]);

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

  // ===== 稳定的事件处理函数 =====
  const handleAuthInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAuthForm(prev => ({ ...prev, [name]: value }));
    setAuthMessage('');
  }, []);

  const handleVerifyCodeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
    setVerifyCode(value);
    setVerifyMessage('');
  }, []);

  const handleSwitchAuthMode = useCallback(() => {
    setIsRegisterMode(prev => !prev);
    setAuthMessage('');
  }, []);

  // ===== 注册接口（保留原有逻辑） =====
  const handleRegister = useCallback(async () => {
    const { username, email, password } = authForm;
    if (!username || !email || !password) {
      setAuthMessage('请填写完整的注册信息！');
      setAuthMessageType('error');
      return;
    }

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
    <HashRouter>
      <div className="min-h-screen flex flex-col">
        {/* 传递积分相关props给Header（新增deductRose） */}
        <Header 
          currentUser={currentUser}
          profile={profile}
          profileLoading={profileLoading}
          claimCredits={claimCredits}    // 领取积分函数
          claimRose={claimRose}          // 领取玫瑰函数
          deductCredits={deductCredits}  // 扣减积分函数
          deductRose={deductRose}        // 🔥 新增：传递扣减玫瑰函数
          onLoginClick={() => setShowAuthModal(true)}
          onLogoutClick={handleLogout}
        />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            {/* 🔥 核心修改：给TemplateDetail传递扣减方法和积分数据 */}
            <Route 
              path="/template/:id" 
              element={
                <TemplateDetail 
                  deductCredits={deductCredits} 
                  deductRose={deductRose}
                  profile={profile}
                  profileLoading={profileLoading}
                />
              } 
            />
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
  );
};

export default App;